import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import app from '../../index';
import models, { sequelize } from '../../server/models';
import {
  user1, user2, user7, user8
} from '../mocks/mockUsers';
import {
  mockArticle, invalidArticle, mockHighlight, InvalidHighlight
} from '../mocks/mockArticle';
import mockCategory from '../mocks/mockCategory';
import { comment, longComment } from '../mocks/mockComments';
import mockRoles from '../mocks/mockRoles';

chai.use(chaiHttp);

describe('Tests for article resource', () => {
  let userToken;
  after(async () => {
    await Object.values(sequelize.models).map(function (model) {
      return model.destroy({ where: {}, force: true });
    });
    await sequelize.queryInterface.sequelize.query('TRUNCATE TABLE session CASCADE;');
  });

  describe('Test Cases for Create Article Endpoint', () => {
    const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6I66iMmU3MDAwLWE3MjEtNDY1OS1hMjRiLTg1M2RlNDk4ZDBjOSIsImVtYWlsIjoicHJpbmNlc3M2M0BleGFtcGxlLmNvbSIsImlhdCI6MTU0OTY1MDgzNywiZXhwIjoxNTQ5NzM3MjM3fQ.1B1I2tlmJzGBdiAmY9R_6tPdRrBXHkdW2wOYUSZ0Gbk';

    before(async () => {
      await models.Roles.bulkCreate(mockRoles);
      await models.Category.bulkCreate(mockCategory);

      const { body: { data: { link } } } = await chai.request(app)
        .post('/api/users')
        .send(user1.signUp);

      const { body: { data: { user: { token } } } } = await chai.request(app)
        .patch(link.slice(22));

      userToken = token;
    });

    it('should return unauthorized when no token is provided', async () => {
      const res = await chai.request(app)
        .post('/api/articles')
        .send(mockArticle);
      expect(res).to.have.status(401);
    });
    it('should return unauthorized when invalid token is provided at article creation', async () => {
      const res = await chai.request(app)
        .post('/api/articles')
        .set('Authorization', `Bearer ${fakeToken}`)
        .send(mockArticle);
      expect(res).to.have.status(401);
    });
    it('should return an error when invalid input is provided at article creation by a valid user', async () => {
      const res = await chai.request(app)
        .post('/api/articles')
        .set('Authorization', `Bearer ${userToken}`)
        .send(invalidArticle);
      expect(res).to.have.status(422);
    });
    it('should create an article with a valid current user token ', async () => {
      const res = await chai.request(app)
        .post('/api/articles')
        .set('Authorization', `Bearer ${userToken}`)
        .send(mockArticle);
      expect(res).to.have.status(201);
      expect(res.body.status).to.equal('Success');
      expect(res.body.data.readTime).to.not.equal(undefined);
    });
  });

  describe('Tests for creating comments', () => {
    let articleId;
    before(async () => {
      const { body: { data: { id } } } = await chai.request(app)
        .post('/api/articles')
        .set('Authorization', `Bearer ${userToken}`)
        .send(mockArticle);

      articleId = id;
    });

    it('Should create comment if all is right', async () => {
      const res = await chai.request(app)
        .post(`/api/articles/${articleId}/comments`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(comment);
      const {
        body: { data: { commentBody, articleId: returnedArticleId } }
      } = res;
      expect(res).to.have.status(201);
      expect(commentBody).to.eql(comment.commentBody);
      expect(returnedArticleId).to.eql(articleId);
    });

    it('Should not create comment if longer than 140 characters', async () => {
      const res = await chai.request(app)
        .post(`/api/articles/${articleId}/comments`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(longComment);
      const { body } = res;
      expect(res).to.have.status(422);
      expect(body).to.not.have.property('data');
    });
  });

  describe('Tests for liking/disliking Articles', () => {
    let articleId;
    let articleId2;
    const fakeArticleId = 'fakeArticleId';

    before(async () => {
      const { body: { data: { id } } } = await chai.request(app)
        .post('/api/articles')
        .set('Authorization', `Bearer ${userToken}`)
        .send(mockArticle);

      articleId = id;

      const { body: { data: { id: newId } } } = await chai.request(app)
        .post('/api/articles')
        .set('Authorization', `Bearer ${userToken}`)
        .send(mockArticle);

      articleId2 = newId;
    });

    it('Should return unauthorized when no token is provided', async () => {
      const res = await chai.request(app)
        .patch(`/api/articles/${articleId}/likes`);
      expect(res).to.have.status(401);
    });

    it('Should return unauthorized when no token is provided', async () => {
      const res = await chai.request(app)
        .patch(`/api/articles/${articleId}/dislikes`);
      expect(res).to.have.status(401);
    });

    it('Should return server error when fake article id is provided', async () => {
      const res = await chai.request(app)
        .patch(`/api/articles/${fakeArticleId}/likes`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res).to.have.status(500);
    });

    it('Should return server error when fake article id is provided', async () => {
      const res = await chai.request(app)
        .patch(`/api/articles/${fakeArticleId}/dislikes`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res).to.have.status(500);
    });

    it('Should create an impression liking an article ', async () => {
      const res = await chai.request(app)
        .patch(`/api/articles/${articleId}/likes`)
        .set('Authorization', `Bearer ${userToken}`);
      const { body, body: { data }, body: { data: { message: impressionMessage } } } = res;
      expect(res).to.have.status(200);
      expect(body).to.have.property('data');
      expect(data).to.have.property('impression');
      expect(impressionMessage).to.eql('You liked this Article!');
    });

    it('Should update an impression unliking an article ', async () => {
      const res = await chai.request(app)
        .patch(`/api/articles/${articleId}/likes`)
        .set('Authorization', `Bearer ${userToken}`);
      const { body, body: { data }, body: { data: { message: impressionMessage } } } = res;
      expect(res).to.have.status(200);
      expect(body).to.have.property('data');
      expect(data).to.have.property('impression');
      expect(impressionMessage).to.eql('You unliked this Article!');
    });

    it('Should create an impression liking an article ', async () => {
      const res = await chai.request(app)
        .patch(`/api/articles/${articleId}/likes`)
        .set('Authorization', `Bearer ${userToken}`);
      const { body, body: { data }, body: { data: { message: impressionMessage } } } = res;
      expect(res).to.have.status(200);
      expect(body).to.have.property('data');
      expect(data).to.have.property('impression');
      expect(impressionMessage).to.eql('You liked this Article!');
    });

    it('Should create impression disliking an article ', async () => {
      const res = await chai.request(app)
        .patch(`/api/articles/${articleId2}/dislikes`)
        .set('Authorization', `Bearer ${userToken}`);
      const { body, body: { data }, body: { data: { message: impressionMessage } } } = res;
      expect(res).to.have.status(201);
      expect(body).to.have.property('data');
      expect(data).to.have.property('impression');
      expect(impressionMessage).to.eql('You disliked this Article!');
    });

    it('Should update an impression disliking an article ', async () => {
      const res = await chai.request(app)
        .patch(`/api/articles/${articleId}/dislikes`)
        .set('Authorization', `Bearer ${userToken}`);
      const { body, body: { data }, body: { data: { message: impressionMessage } } } = res;
      expect(res).to.have.status(200);
      expect(body).to.have.property('data');
      expect(data).to.have.property('impression');
      expect(impressionMessage).to.eql('You disliked this Article!');
    });

    it('Should update an impression un-disliking an article ', async () => {
      const res = await chai.request(app)
        .patch(`/api/articles/${articleId}/dislikes`)
        .set('Authorization', `Bearer ${userToken}`);
      const { body, body: { data }, body: { data: { message: impressionMessage } } } = res;
      expect(res).to.have.status(200);
      expect(body).to.have.property('data');
      expect(data).to.have.property('impression');
      expect(impressionMessage).to.eql('You un-disliked this Article!');
    });
  });

  describe('Tests for highlighting and commenting  Articles', () => {
    let articleId;
    let articleId2;
    const fakeArticleId = 'fakeArticleId';
    before(async () => {
      const { body: { data: { id } } } = await chai.request(app)
        .post('/api/articles')
        .set('Authorization', `Bearer ${userToken}`)
        .send(mockArticle);

      articleId = id;

      const { body: { data: { id: newId } } } = await chai.request(app)
        .post('/api/articles')
        .set('Authorization', `Bearer ${userToken}`)
        .send(mockArticle);

      articleId2 = newId;
    });

    it('Should return unauthorized when no token is provided', async () => {
      const res = await chai.request(app)
        .post(`/api/articles/${articleId}/highlights`);
      expect(res).to.have.status(401);
    });

    it('Should return unauthorized when no token is provided', async () => {
      const res = await chai.request(app)
        .get(`/api/articles/${articleId}/highlights`);
      expect(res).to.have.status(401);
    });

    it('Should return server error when fake article id is provided', async () => {
      const res = await chai.request(app)
        .post(`/api/articles/${fakeArticleId}/highlights`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(mockHighlight);
      const { body: { status }, body } = res;
      expect(res).to.have.status(500);
      expect(body).to.have.property('message');
      expect(status).to.eql('error');
    });

    it('Should return server error when fake article id is provided', async () => {
      const res = await chai.request(app)
        .get(`/api/articles/${fakeArticleId}/highlights`)
        .set('Authorization', `Bearer ${userToken}`);
      const { body: { status }, body } = res;
      expect(res).to.have.status(500);
      expect(body).to.have.property('message');
      expect(status).to.eql('error');
    });

    it('Should create an entry of highlight and comment of an Article', async () => {
      const res = await chai.request(app)
        .post(`/api/articles/${articleId}/highlights`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(mockHighlight);
      const { body, body: { data }, body: { data: { message } } } = res;
      expect(res).to.have.status(201);
      expect(body).to.have.property('data');
      expect(data).to.have.property('highlight');
      expect(message).to.eql('You highlighted successfully!');
    });

    it('Should return an input error for highlight and comment of an Article', async () => {
      const res = await chai.request(app)
        .post(`/api/articles/${articleId}/highlights`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(InvalidHighlight);
      const { body: { status, data } } = res;
      expect(res).to.have.status(422);
      expect(data).to.have.property('input');
      expect(status).to.eql('fail');
    });

    it('Should return a highlight for an Article', async () => {
      const res = await chai.request(app)
        .get(`/api/articles/${articleId}/highlights`)
        .set('Authorization', `Bearer ${userToken}`);
      const { body, body: { data }, body: { data: { message } } } = res;
      expect(res).to.have.status(200);
      expect(body).to.have.property('data');
      expect(data).to.have.property('highlights');
      expect(message).to.eql('You highlighted this Article!');
    });

    it('Should return no highlights for an Article', async () => {
      const res = await chai.request(app)
        .get(`/api/articles/${articleId2}/highlights`)
        .set('Authorization', `Bearer ${userToken}`);
      const { body: { status }, body: { data } } = res;
      expect(res).to.have.status(404);
      expect(data).to.have.property('message');
      expect(status).to.eql('fail');
    });
  });

  describe('Tests for Rating Articles', () => {
    let token2;
    let articleId;
    let articleId2;

    const wrongArticleId = 'd073e097-fcec-4dd5-a29a-84e020cdd25f';
    const nonExistingArticleId = 'd073e097-fcec-4dd5-a29a-84e020c';

    before(async () => {
      const { body: { data: { link } } } = await chai.request(app)
        .post('/api/users')
        .send(user2.signUp);

      const { body: { data: { user: { token: userToken2 } } } } = await chai.request(app)
        .patch(link.slice(22));
      token2 = userToken2;

      const { body: { data: { id } } } = await chai.request(app)
        .post('/api/articles')
        .set('Authorization', `Bearer ${userToken}`)
        .send(mockArticle);
      articleId = id;

      const { body: { data: { id: id2 } } } = await chai.request(app)
        .post('/api/articles')
        .set('Authorization', `Bearer ${userToken}`)
        .send(mockArticle);
      articleId2 = id2;

      await chai.request(app)
        .post(`/api/articles/${articleId2}/ratings`)
        .set('Authorization', `Bearer ${userToken2}`)
        .send({
          rating: 5
        });
    });

    it('Should return server error if article id does not exist', async () => {
      const res = await chai.request(app)
        .post(`/api/articles/${wrongArticleId}/ratings`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          rating: 5
        });
      const { body: { status, message } } = res;
      expect(res).to.have.status(404);
      expect(status).to.equal('fail');
      expect(message).to.equal('Article not found');
    });

    it('Should create ratings if input is correct', async () => {
      const res = await chai.request(app)
        .post(`/api/articles/${articleId}/ratings`)
        .set('Authorization', `Bearer ${token2}`)
        .send({
          rating: 4
        });
      const { body: { status, message } } = res;
      expect(res).to.have.status(201);
      expect(status).to.equal('success');
      expect(message).to.equal('Yaay! You just rated this article');
    });

    it('Should not create ratings if article has already been rated by the user', async () => {
      const res = await chai.request(app)
        .post(`/api/articles/${articleId2}/ratings`)
        .set('Authorization', `Bearer ${token2}`)
        .send({
          rating: 4
        });
      const { body: { status, message } } = res;
      expect(res).to.have.status(401);
      expect(status).to.equal('fail');
      expect(message).to.equal('You already rated this article');
    });

    it('Should not create rating if rating is higher than 5', async () => {
      const res = await chai.request(app)
        .post(`/api/articles/${articleId}/ratings`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          rating: 10
        });
      const { body: { status }, body } = res;
      expect(res).to.have.status(422);
      expect(status).to.equal('fail');
      expect(body).to.have.property('data');
    });

    it('Should not allow Authors rate their own Article', async () => {
      const res = await chai.request(app)
        .post(`/api/articles/${articleId}/ratings`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          rating: 4
        });
      const { body: { status, message } } = res;
      expect(res).to.have.status(401);
      expect(status).to.equal('fail');
      expect(message).to.equal("Sorry! You can't rate your article");
    });

    it('Should return error if article id is incorrrect', async () => {
      const res = await chai.request(app)
        .post(`/api/articles/${nonExistingArticleId}/ratings`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          rating: 5
        });
      const { body: { status, message } } = res;
      expect(res).to.have.status(502);
      expect(status).to.equal('Error');
      expect(message).to.eql('OOPS! an error occurred while trying to rate article. log in and try again!');
    });
  });

  describe('Tests for get an article', () => {
    let articleId;
    const fakeArticleId = 'd8725ebc-826b-4262-aa1b-24bdf110a01f';
    const wrongArticleIdDataType = 1;

    before(async () => {
      await models.Category.bulkCreate(mockCategory);

      // create an article
      const res = await chai.request(app)
        .post('/api/articles')
        .set('Authorization', `Bearer ${userToken}`)
        .send(mockArticle);
      articleId = res.body.data.id;
    });

    it('should return all articles', async () => {
      const res = await chai.request(app)
        .get('/api/articles');
      expect(res).to.have.status(200);
      expect(res.body.status).to.equal('success');
      expect(res.body.data.length > 0).to.equal(true);
    });

    it('should fail to return wrong article', async () => {
      const res = await chai.request(app)
        .get(`/api/articles/${fakeArticleId}`);
      expect(res).to.have.status(404);
      expect(res.body.status).to.equal('fail');
      expect(res.body.message).to.equal('Resource not found');
    });

    it('should give a server error when wrong articleId expression is supplied', async () => {
      const res = await chai.request(app)
        .get(`/api/articles/${wrongArticleIdDataType}`);
      expect(res).to.have.status(500);
      expect(res.body.status).to.equal('error');
      expect(res.body.message).to.equal('Internal server error');
    });

    it('should return a given article', async () => {
      const res = await chai.request(app)
        .get(`/api/articles/${articleId}`);
      expect(res).to.have.status(200);
      expect(res.body.status).to.equal('success');
      expect(res.body.data.id).to.equal(articleId);
      expect(res.body.data.readTime).to.not.equal(undefined);
    });
  });

  describe('Tests for comment edit history', () => {
    let articleId;
    let article2Id;
    let commentId;
    const fakeArticleId = 'd8725ebc-826b-4262-aa1b-24bdf110a01f';

    before(async () => {
      let res = await chai.request(app)
        .post('/api/articles')
        .set('Authorization', `Bearer ${userToken}`)
        .send(mockArticle);
      articleId = res.body.data.id;

      res = await chai.request(app)
        .post('/api/articles')
        .set('Authorization', `Bearer ${userToken}`)
        .send(mockArticle);
      article2Id = res.body.data.id;

      res = await chai.request(app)
        .post(`/api/articles/${articleId}/comments`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(comment);
      commentId = res.body.data.id;
    });

    it('should update a comment', async () => {
      const res = await chai.request(app)
        .patch(`/api/articles/${articleId}/comments/${commentId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(comment);
      expect(res).to.have.status(200);
      expect(res.body.status).to.equal('success');
      expect(res.body.data.id).to.equal(commentId);
      expect(res.body.data.oldComments.length > 0).to.equal(true);
    });

    it('should fail to update comment when wrong input is supplied', async () => {
      const res = await chai.request(app)
        .patch(`/api/articles/${articleId}/comments/${commentId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({});
      expect(res).to.have.status(422);
      expect(res.body.status).to.equal('fail');
    });

    it('should fail to update when wrong article is supplied', async () => {
      const res = await chai.request(app)
        .patch(`/api/articles/${fakeArticleId}/comments/${commentId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(comment);
      expect(res).to.have.status(404);
      expect(res.body.status).to.equal('fail');
      expect(res.body.message).to.equal('Article not found');
    });

    it('should update a comment', async () => {
      const res = await chai.request(app)
        .patch(`/api/articles/${article2Id}/comments/${commentId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(comment);
      expect(res).to.have.status(404);
      expect(res.body.status).to.equal('fail');
      expect(res.body.message).to.equal('Comment not found under this article');
      describe('Tests for reporting an article', () => {
        let createdArticleId;
        let user8Token;
        const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6I66iMmU3MDAwLWE3MjEtNDY1OS1hMjRiLTg1M2RlNDk4ZDBjOSIsImVtYWlsIjoicHJpbmNlc3M2M0BleGFtcGxlLmNvbSIsImlhdCI6MTU0OTY1MDgzNywiZXhwIjoxNTQ5NzM3MjM3fQ.1B1I2tlmJzGBdiAmY9R_6tPdRrBXHkdW2wOYUSZ0Gbk';
        before(async () => {
          const { body: { data: { link: articleCreatorLink } } } = await chai.request(app)
            .post('/api/users')
            .send(user7.signUp);

          const { body: { data: { user: { token: articleCreatorToken } } } } = await chai.request(app)
            .patch(articleCreatorLink.slice(22));

          const { body: { data: { id } } } = await chai.request(app)
            .post('/api/articles')
            .set('Authorization', `Bearer ${articleCreatorToken}`)
            .send(mockArticle);

          createdArticleId = id;

          const { body: { data: { link: userVerificationLink } } } = await chai.request(app)
            .post('/api/users')
            .send(user8.signUp);

          const { body: { data: { user: { token: userToken3 } } } } = await chai.request(app)
            .patch(userVerificationLink.slice(22));
          user8Token = userToken3;
        });

        it('Should report an article when a valid user reports it', async () => {
          const res = await chai.request(app)
            .post(`/api/articles/${createdArticleId}/report`)
            .set('Authorization', `Bearer ${user8Token}`);
          expect(res).to.have.status(201);
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('message');
          expect(res.body.status).to.equal('Success');
        });
        it('Should return an error if the provided article has been deleted', async () => {
          await models.Article.destroy({ where: { id: createdArticleId }, force: true });
          const res = await chai.request(app)
            .post(`/api/articles/${createdArticleId}/report`)
            .set('Authorization', `Bearer ${user8Token}`);
          expect(res).to.have.status(500);
          expect(res.body).to.have.property('error');
          expect(res.body.error).to.equal('Article is not found');
        });
        it('Should not report an article when a user is invalid', async () => {
          const res = await chai.request(app)
            .post(`/api/articles/${createdArticleId}/report`)
            .set('Authorization', `Bearer ${fakeToken}`);
          expect(res).to.have.status(401);
        });
        it('Should return an error when a user tries to report the same article twice', async () => {
          const res = await chai.request(app)
            .post(`/api/articles/${createdArticleId}/report`)
            .set('Authorization', `Bearer ${user8Token}`);
          expect(res).to.have.status(500);
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('error');
        });
      });
    });
  });
});
