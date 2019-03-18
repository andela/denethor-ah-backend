import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import sinon from 'sinon';
import app from '../../index';
import models, { sequelize, Article, Tag } from '../../server/models';
import {
  user1, user2, user3, user5, user6, user8, user9
} from '../mocks/mockUsers';
import {
  mockArticle, invalidArticle, mockHighlight, InvalidHighlight, invalidUpdateArticle,
  mockTaggedArticle
} from '../mocks/mockArticle';
import mockCategory from '../mocks/mockCategory';
import { comment, longComment } from '../mocks/mockComments';
import mockRoles from '../mocks/mockRoles';
import superAdmin from '../mocks/super-admin';

chai.use(chaiHttp);

describe('Tests for article resource', () => {
  let userToken;
  let userToken4;
  let articleId;
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
      await models.User.bulkCreate(superAdmin);
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

  describe('Test Cases for Share Article Endpoint', () => {
    let user9Token, article9Id;

    before(async () => {
      const { body: { data: { link } } } = await chai.request(app)
        .post('/api/users')
        .send(user9.signUp);

      const { body: { data: { user: { token } } } } = await chai.request(app)
        .patch(link.slice(22));

      user9Token = token;
    });
    it('should create an article to be shared ', async () => {
      const res = await chai.request(app)
        .post('/api/articles')
        .set('Authorization', `Bearer ${user9Token}`)
        .send(mockArticle);
      expect(res).to.have.status(201);
      expect(res.body.status).to.equal('Success');
      expect(res.body.data.readTime).to.not.equal(undefined);
      article9Id = res.body.data.id;
    });
    it('should share an article with type facebook', async () => {
      const sharetype = 'facebook';
      const res = await chai.request(app)
        .post(`/api/articles/${article9Id}/share?sharetype=${sharetype}`);
      expect(res).to.have.status(201);
      expect(res.body.status).to.equal('success');
      expect(res.body.message).to.not.equal(undefined);
    });
    it('should share an article with type twitter', async () => {
      const sharetype = 'twitter';
      const res = await chai.request(app)
        .post(`/api/articles/${article9Id}/share?sharetype=${sharetype}`);
      expect(res).to.have.status(201);
      expect(res.body.status).to.equal('success');
      expect(res.body.message).to.not.equal(undefined);
    });
    it('should  not share an article with an invalid type', async () => {
      const sharetype = 'twitt';
      const res = await chai.request(app)
        .post(`/api/articles/${article9Id}/share?sharetype=${sharetype}`);
      expect(res).to.have.status(422);
      expect(res.body.status).to.equal('fail');
      expect(res.body.message).to.not.equal(undefined);
    });
    it('should  not share an article with an invalid article Id', async () => {
      const sharetype = 'twitter';
      const fakeId = 'ab59246c-7034-4765-96fe-7baa4da9b1d5';
      const res = await chai.request(app)
        .post(`/api/articles/${fakeId}/share?sharetype=${sharetype}`);
      expect(res).to.have.status(404);
      expect(res.body.status).to.equal('fail');
      expect(res.body.message).to.not.equal(undefined);
    });
    it('should  not share an article with an invalid article Id data type ', async () => {
      const sharetype = 'twitter';
      const fakeId = 'ab59246c-7034-4765-96fe-7baa4da9b1d582';
      const res = await chai.request(app)
        .post(`/api/articles/${fakeId}/share?sharetype=${sharetype}`);
      expect(res).to.have.status(500);
      expect(res.body.status).to.equal('Error');
      expect(res.body.error).to.not.equal(undefined);
    });
  });

  describe('Tests cases for comments', () => {
    let articleId2;
    let commentId;
    let commentId2;
    const fakeCommentId = 'fakeCommentId';
    const fakeUUIDCommentId = 'ae43b025-39a3-4514-b26d-eb9a3f11328f';
    const fakeArticleId = 'd8725ebc-826b-4262-aa1b-24bdf110a01';
    before(async () => {
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

      const { body: { data: { link: newLink } } } = await chai.request(app)
        .post('/api/users')
        .send(user3.signUp);

      const { body: { data: { user: { token: newToken } } } } = await chai.request(app)
        .patch(newLink.slice(22));

      userToken4 = newToken;

      const { body: { data: { id: newCommentId } } } = await chai.request(app)
        .post(`/api/articles/${articleId}/comments`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(comment);
      commentId2 = newCommentId;
    });

    describe('Tests create, delete and update for comments', () => {
      it('Should create comment if all is right', async () => {
        const res = await chai.request(app)
          .post(`/api/articles/${articleId}/comments`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(comment);
        const {
          body: { data: { id: newCommentId, commentBody, articleId: returnedArticleId } }
        } = res;
        commentId = newCommentId;
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

      it('Should return error for unauthorized user', async () => {
        const res = await chai.request(app)
          .delete(`/api/articles/${articleId}/comments/${commentId}`)
          .set('Authorization', `Bearer ${userToken4}`);
        const { body, body: { status, data: { message } } } = res;
        expect(res).to.have.status(401);
        expect(body).to.have.property('data');
        expect(status).to.eql('fail');
        expect(message).to.eql('Not authorized');
      });

      it('Should delete comment', async () => {
        const res = await chai.request(app)
          .delete(`/api/articles/${articleId}/comments/${commentId}`)
          .set('Authorization', `Bearer ${userToken}`);
        const { body, body: { status, data: { message } } } = res;
        expect(res).to.have.status(200);
        expect(body).to.have.property('data');
        expect(status).to.eql('success');
        expect(message).to.eql('Comment was deleted successfully');
      });

      it('Should return error when no article Id', async () => {
        const res = await chai.request(app)
          .delete(`/api/articles/ /comments/${commentId}`)
          .set('Authorization', `Bearer ${userToken}`);
        const { body, body: { status, data } } = res;
        expect(res).to.have.status(422);
        expect(body).to.have.property('data');
        expect(data).to.have.property('input');
        expect(status).to.eql('fail');
      });

      it('Should return error when no comment Id', async () => {
        const res = await chai.request(app)
          .delete(`/api/articles/${articleId}/comments/ /`)
          .set('Authorization', `Bearer ${userToken}`);
        const { body, body: { status, data } } = res;
        expect(res).to.have.status(422);
        expect(body).to.have.property('data');
        expect(data).to.have.property('input');
        expect(status).to.eql('fail');
      });

      it('Should return error when fake comment Id is supplied', async () => {
        const res = await chai.request(app)
          .delete(`/api/articles/${articleId}/comments/${fakeCommentId}`)
          .set('Authorization', `Bearer ${userToken}`);
        const { body: { status } } = res;
        expect(res).to.have.status(500);
        expect(status).to.eql('error');
      });

      it('Should return error when fake UUID comment Id is supplied', async () => {
        const res = await chai.request(app)
          .delete(`/api/articles/${articleId}/comments/${fakeUUIDCommentId}`)
          .set('Authorization', `Bearer ${userToken}`);
        const { body: { status, data: { message } } } = res;
        expect(res).to.have.status(404);
        expect(status).to.eql('fail');
        expect(message).to.eql('No comment was found');
      });
      describe('Tests for get article Comments', () => {
        it('Should get article Comments if request is correct', async () => {
          const res = await chai.request(app)
            .get(`/api/articles/${articleId}/comments/`);
          const { body: { status, message } } = res;
          expect(res).to.have.status(200);
          expect(status).to.equal('success');
          expect(message).to.equal('Comments retrieved successfully');
        });

        it('Should return fail if there are no comment for the article', async () => {
          const res = await chai.request(app)
            .get(`/api/articles/${articleId2}/comments/`);
          const { body: { status, message } } = res;
          expect(res).to.have.status(404);
          expect(status).to.equal('fail');
          expect(message).to.equal('No comment yet. Be the first to comment on this article');
        });

        it('Should return error if article id is incorrrect', async () => {
          const res = await chai.request(app)
            .get(`/api/articles/${fakeArticleId}/comments/`);
          const { body: { status, message } } = res;
          expect(res).to.have.status(500);
          expect(status).to.equal('error');
          expect(message).to.equal('Internal Server Error!');
        });
      });
    });
    describe('Tests for like comment', () => {
      it('Should like comment if request is correct', async () => {
        const res = await chai.request(app)
          .post(`/api/articles/${articleId}/comments/${commentId2}/like`)
          .set('Authorization', `Bearer ${userToken}`);
        const { body: { status, message } } = res;
        expect(res).to.have.status(201);
        expect(status).to.equal('success');
        expect(message).to.equal('You liked this comment!');
      });

      it('Should unlike comment if comment has already been liked by the user', async () => {
        const res = await chai.request(app)
          .post(`/api/articles/${articleId}/comments/${commentId2}/like`)
          .set('Authorization', `Bearer ${userToken}`);
        const { body: { status, message } } = res;
        expect(res).to.have.status(200);
        expect(status).to.equal('success');
        expect(message).to.equal('You unliked this comment!');
      });

      it('Should return error if comment id is incorrrect', async () => {
        const res = await chai.request(app)
          .post(`/api/articles/${articleId}/comments/${fakeCommentId}/like`)
          .set('Authorization', `Bearer ${userToken}`);
        const { body: { status, message } } = res;
        expect(res).to.have.status(500);
        expect(status).to.equal('error');
        expect(message).to.equal('Internal Server error occured');
      });
    });
  });

  describe('Tests for liking/disliking Articles', () => {
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

  describe('Tests for highlighting and commenting Articles', () => {
    let articleId2;
    let highlightId;
    const fakeArticleId = 'fakeArticleId';
    const fakeHighlightId = 'fakeHighlightId';
    const fakeUUIDHighlightId = '1234';
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
      const { highlight: { id: newhighlightId } } = data;
      highlightId = newhighlightId;
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

    it('Should update an entry of highlight and comment on an Article', async () => {
      const res = await chai.request(app)
        .patch(`/api/articles/${articleId}/highlights/${highlightId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ comment: 'Testing highlight' });
      const { body, body: { data }, body: { data: { message } } } = res;
      expect(res).to.have.status(200);
      expect(body).to.have.property('data');
      expect(data).to.have.property('highlight');
      expect(message).to.eql('Your highlight updated successfully');
    });

    it('Should return error when no article Id', async () => {
      const res = await chai.request(app)
        .patch(`/api/articles/ /highlights/${highlightId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ comment: 'Testing highlight' });
      const { body, body: { status, data } } = res;
      expect(res).to.have.status(422);
      expect(body).to.have.property('data');
      expect(data).to.have.property('input');
      expect(status).to.eql('fail');
    });

    it('Should return error when no highligh Id', async () => {
      const res = await chai.request(app)
        .patch(`/api/articles/${articleId}/highlights/ /`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ comment: 'Testing highlight' });
      const { body, body: { status, data } } = res;
      expect(res).to.have.status(422);
      expect(body).to.have.property('data');
      expect(data).to.have.property('input');
      expect(status).to.eql('fail');
    });

    it('Should return error when fake highlight Id is supplied', async () => {
      const res = await chai.request(app)
        .patch(`/api/articles/${articleId}/highlights/${fakeHighlightId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ comment: 'Testing highlight' });
      const { body: { status } } = res;
      expect(res).to.have.status(500);
      expect(status).to.eql('error');
    });

    it('Should return error when fake UUID highlight Id is supplied', async () => {
      const res = await chai.request(app)
        .delete(`/api/articles/${articleId}/highlights/${fakeUUIDHighlightId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ comment: 'Testing highlight' });
      const { body: { status, data: { message } } } = res;
      expect(res).to.have.status(404);
      expect(status).to.eql('fail');
      expect(message).to.eql('No highlight was found');
    });

    it('Should return error for unauthorized user', async () => {
      const res = await chai.request(app)
        .delete(`/api/articles/${articleId}/highlights/${highlightId}`)
        .set('Authorization', `Bearer ${userToken4}`);
      const { body, body: { status, data: { message } } } = res;
      expect(res).to.have.status(401);
      expect(body).to.have.property('data');
      expect(status).to.eql('fail');
      expect(message).to.eql('Not authorized');
    });

    it('Should delete an entry of highlight and comment of an Article', async () => {
      const res = await chai.request(app)
        .delete(`/api/articles/${articleId}/highlights/${highlightId}`)
        .set('Authorization', `Bearer ${userToken}`);
      const { body, body: { status, data: { message } } } = res;
      expect(res).to.have.status(200);
      expect(body).to.have.property('data');
      expect(status).to.eql('success');
      expect(message).to.eql('Highlight was deleted successfully');
    });

    it('Should return error when no article Id', async () => {
      const res = await chai.request(app)
        .delete(`/api/articles/ /highlights/${highlightId}`)
        .set('Authorization', `Bearer ${userToken}`);
      const { body, body: { status, data } } = res;
      expect(res).to.have.status(422);
      expect(body).to.have.property('data');
      expect(data).to.have.property('input');
      expect(status).to.eql('fail');
    });

    it('Should return error when no highligh Id', async () => {
      const res = await chai.request(app)
        .delete(`/api/articles/${articleId}/highlights/ /`)
        .set('Authorization', `Bearer ${userToken}`);
      const { body, body: { status, data } } = res;
      expect(res).to.have.status(422);
      expect(body).to.have.property('data');
      expect(data).to.have.property('input');
      expect(status).to.eql('fail');
    });

    it('Should return error when fake highlight Id is supplied', async () => {
      const res = await chai.request(app)
        .delete(`/api/articles/${articleId}/highlights/${fakeHighlightId}`)
        .set('Authorization', `Bearer ${userToken}`);
      const { body: { status } } = res;
      expect(res).to.have.status(500);
      expect(status).to.eql('error');
    });

    it('Should return error when fake UUID highlight Id is supplied', async () => {
      const res = await chai.request(app)
        .delete(`/api/articles/${articleId}/highlights/${fakeUUIDHighlightId}`)
        .set('Authorization', `Bearer ${userToken}`);
      const { body: { status, data: { message } } } = res;
      expect(res).to.have.status(404);
      expect(status).to.eql('fail');
      expect(message).to.eql('No highlight was found');
    });
  });

  describe('Tests for Rating Articles', () => {
    let token2;
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

    it('Should get all ratings', async () => {
      const res = await chai.request(app)
        .get(`/api/articles/${articleId}/ratings`);
      const { body: { status } } = res;
      expect(res).to.have.status(200);
      expect(status).to.equal('success');
    });
  });

  describe('Tests for get an article', () => {
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
      await chai.request(app)
        .post(`/api/articles/${articleId}/comments`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(comment);
    });

    it('should return all articles', async () => {
      const res = await chai.request(app)
        .get('/api/articles');
      expect(res).to.have.status(200);
      expect(res.body.status).to.equal('success');
      expect(res.body.data.length > 0).to.equal(true);
    });

    it('should fail on server error', async () => {
      const articleStub = sinon.stub(Article, 'findAll');
      articleStub.rejects();

      const res = await chai.request(app)
        .get('/api/articles');
      expect(res).to.have.status(500);

      articleStub.restore();
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

      const { body: { data: { id: newCommentId } } } = await chai.request(app)
        .post(`/api/articles/${articleId}/comments`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(comment);
      commentId = newCommentId;
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
    });
  });

  describe('Tests for reporting an article', () => {
    let user8Token;
    const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6I66iMmU3MDAwLWE3MjEtNDY1OS1hMjRiLTg1M2RlNDk4ZDBjOSIsImVtYWlsIjoicHJpbmNlc3M2M0BleGFtcGxlLmNvbSIsImlhdCI6MTU0OTY1MDgzNywiZXhwIjoxNTQ5NzM3MjM3fQ.1B1I2tlmJzGBdiAmY9R_6tPdRrBXHkdW2wOYUSZ0Gbk';
    before(async () => {
      const { body: { data: { link: userVerificationLink } } } = await chai.request(app)
        .post('/api/users')
        .send(user8.signUp);

      const { body: { data: { user: { token: userToken3 } } } } = await chai.request(app)
        .patch(userVerificationLink.slice(22));

      user8Token = userToken3;
    });

    it('Should report an article when a valid user reports it', async () => {
      const res = await chai.request(app)
        .post(`/api/articles/${articleId}/report`)
        .set('Authorization', `Bearer ${user8Token}`);
      expect(res).to.have.status(201);
      expect(res.body).to.have.property('status');
      expect(res.body).to.have.property('message');
      expect(res.body.status).to.equal('Success');
    });
    it('Should return an error when a user tries to report the same article twice', async () => {
      const res = await chai.request(app)
        .post(`/api/articles/${articleId}/report`)
        .set('Authorization', `Bearer ${user8Token}`);
      expect(res).to.have.status(422);
      expect(res.body.status).to.equal('fail');
      expect(res.body.message).to.equal('You already reported this article');
    });
    it('Should return an error if the provided article has been deleted', async () => {
      await models.Article.destroy({ where: { id: articleId }, force: true });
      const res = await chai.request(app)
        .post(`/api/articles/${articleId}/report`)
        .set('Authorization', `Bearer ${user8Token}`);
      expect(res).to.have.status(404);
      expect(res.body.status).to.equal('fail');
      expect(res.body.message).to.equal('No article with that id');
    });
    it('Should not report an article when a user is invalid', async () => {
      const res = await chai.request(app)
        .post(`/api/articles/${articleId}/report`)
        .set('Authorization', `Bearer ${fakeToken}`);
      expect(res).to.have.status(401);
    });
  });

  describe('Tests for Updating and Deleting Articles', () => {
    let token;
    let token2;
    let token3;
    let articleId1;
    let articleId2;

    const nonExistingArticleId = 'd073e097-fcec-4dd5-a29a-84e020c';
    const wrongArticleId = 'a2a532eb-3f8a-4b6a-95c3-8ed4b5e23cab';

    before(async () => {
      await models.Category.bulkCreate(mockCategory);

      const { body: { data: { token: userToken1 } } } = await chai.request(app)
        .post('/api/users/login')
        .send(user1.logIn);
      token = userToken;

      const { body: { data: { link } } } = await chai.request(app)
        .post('/api/users')
        .send(user5.signUp);

      const { body: { data: { user: { token: userToken2 } } } } = await chai.request(app)
        .patch(link.slice(22));
      token2 = userToken2;

      await chai.request(app)
        .patch('/api/users/admin')
        .set('Authorization', `Bearer ${userToken2}`)
        .send({ pass: 'denethorsRock' });

      const { body: { data: { link: link2 } } } = await chai.request(app)
        .post('/api/users')
        .send(user6.signUp);

      const { body: { data: { user: { token: userToken3 } } } } = await chai.request(app)
        .patch(link2.slice(22));
      token3 = userToken3;

      const { body: { data: { id } } } = await chai.request(app)
        .post('/api/articles')
        .set('Authorization', `Bearer ${userToken1}`)
        .send(mockArticle);
      articleId1 = id;

      const { body: { data: { id: id2 } } } = await chai.request(app)
        .post('/api/articles')
        .set('Authorization', `Bearer ${userToken1}`)
        .send(mockArticle);
      articleId2 = id2;
    });

    describe('Tests for Updating Articles', () => {
      it('Should update article if input is correct', async () => {
        const res = await chai.request(app)
          .put(`/api/articles/${articleId1}/`)
          .set('Authorization', `Bearer ${token}`)
          .send(mockArticle);
        const { body: { status, message } } = res;
        expect(res).to.have.status(200);
        expect(status).to.equal('success');
        expect(message).to.equal('Yaay! You just updated this article');
      });

      it('Should not update article if input is incorrect', async () => {
        const res = await chai.request(app)
          .put(`/api/articles/${articleId1}/`)
          .set('Authorization', `Bearer ${token}`)
          .send({ invalidUpdateArticle });
        const { body: { status }, body } = res;
        expect(res).to.have.status(422);
        expect(status).to.equal('fail');
        expect(body).to.have.property('data');
      });

      it("Should not allow Authors update another Author's Article", async () => {
        const res = await chai.request(app)
          .put(`/api/articles/${articleId1}/`)
          .set('Authorization', `Bearer ${token2}`)
          .send(mockArticle);
        const { body: { status, message } } = res;
        expect(res).to.have.status(401);
        expect(status).to.equal('fail');
        expect(message).to.equal("Sorry you can't edit this article");
      });

      it('Should return error if article id is fake', async () => {
        const res = await chai.request(app)
          .put(`/api/articles/${nonExistingArticleId}/`)
          .set('Authorization', `Bearer ${token}`)
          .send(mockArticle);
        const { body: { status, message } } = res;
        expect(res).to.have.status(500);
        expect(status).to.equal('Error');
        expect(message).to.eql('OOPS! an error occurred while trying to update this article. log in and try again!');
      });
    });

    describe('Tests for Deleting Articles', () => {
      it('Should return fail if article does not exist', async () => {
        const res = await chai.request(app)
          .delete(`/api/articles/${wrongArticleId}/`)
          .set('Authorization', `Bearer ${token3}`)
          .send(mockArticle);
        const { body: { status, message } } = res;
        expect(res).to.have.status(404);
        expect(status).to.equal('fail');
        expect(message).to.equal('Article not found');
      });

      it("Should not allow Authors delete another Author's Article", async () => {
        const res = await chai.request(app)
          .delete(`/api/articles/${articleId1}/`)
          .set('Authorization', `Bearer ${token3}`)
          .send(mockArticle);
        const { body: { status, message } } = res;
        expect(res).to.have.status(401);
        expect(status).to.equal('fail');
        expect(message).to.equal('Sorry not authorized');
      });

      it('Should delete article if input is correct', async () => {
        const res = await chai.request(app)
          .delete(`/api/articles/${articleId1}/`)
          .set('Authorization', `Bearer ${token}`);
        const { body: { status, message } } = res;
        expect(res).to.have.status(200);
        expect(status).to.equal('success');
        expect(message).to.equal('Article deleted successfully');
      });

      it("Should allow Admins delete other Author's Article", async () => {
        const { body: { data: { token: superToken } } } = await chai.request(app)
          .post('/api/users/login')
          .send({
            email: superAdmin[0].email,
            password: 'password'
          });
        const res = await chai.request(app)
          .delete(`/api/articles/${articleId2}/`)
          .set('Authorization', `Bearer ${superToken}`)
          .send(mockArticle);
        const { body: { status, message } } = res;
        expect(res).to.have.status(200);
        expect(status).to.equal('success');
        expect(message).to.equal('Article deleted successfully');
      });

      it('should return no article filtering with author', async () => {
        const res = await chai.request(app)
          .get('/api/articles/filter?searchStr=johnnybravo1')
          .set('Authorization', `Bearer ${userToken}`);
        const { body: { status, data: { message } } } = res;
        expect(res).to.have.status(404);
        expect(status).to.eql('fail');
        expect(message).to.eql('No Article was found');
      });

      it('Should return error if article id is fake', async () => {
        const res = await chai.request(app)
          .delete(`/api/articles/${nonExistingArticleId}/`)
          .set('Authorization', `Bearer ${token}`);
        const { body: { status, message } } = res;
        expect(res).to.have.status(500);
        expect(status).to.equal('Error');
        expect(message).to.eql('OOPS! an error occurred while trying to delete this article. log in and try again!');
      });
    });
  });

  describe('Tests for searching an article', () => {
    let articleInstance;
    let articleTags;
    before(async () => {
      const res = await chai.request(app)
        .post('/api/articles')
        .set('Authorization', `Bearer ${userToken}`)
        .send(mockTaggedArticle);

      const { body: { data: newArticle } } = res;
      articleInstance = await Article.findByPk(newArticle.id);
      articleTags = await articleInstance.getTags();
    });

    it('should return an article filtering with all params', async () => {
      const res = await chai.request(app)
        .get(`/api/articles/filter?searchStr=princess&author=johnnybravo1&tag=${articleTags[0].id}`)
        .set('Authorization', `Bearer ${userToken}`);
      const { body: { status, data: { message } } } = res;
      expect(res).to.have.status(200);
      expect(status).to.eql('success');
      expect(message).to.eql('Articles found');
    });

    it('should return an article filtering with search string and author', async () => {
      const res = await chai.request(app)
        .get('/api/articles/filter?searchStr=princess&author=johnnybravo1')
        .set('Authorization', `Bearer ${userToken}`);
      const { body: { status, data: { message } } } = res;
      expect(res).to.have.status(200);
      expect(status).to.eql('success');
      expect(message).to.eql('Articles found');
    });

    it('should return an article filtering with search string and tag', async () => {
      const res = await chai.request(app)
        .get(`/api/articles/filter?searchStr=princess&tag=${articleTags[0].id}`)
        .set('Authorization', `Bearer ${userToken}`);
      const { body: { status, data: { message } } } = res;
      expect(res).to.have.status(200);
      expect(status).to.eql('success');
      expect(message).to.eql('Articles found');
    });

    it('should return an article filtering with tag and author', async () => {
      const res = await chai.request(app)
        .get(`/api/articles/filter?author=johnnybravo1&tag=${articleTags[0].id}`)
        .set('Authorization', `Bearer ${userToken}`);
      const { body: { status, data: { message } } } = res;
      expect(res).to.have.status(200);
      expect(status).to.eql('success');
      expect(message).to.eql('Articles found');
    });

    it('should return an article filtering with search string', async () => {
      const res = await chai.request(app)
        .get('/api/articles/filter?searchStr=princess')
        .set('Authorization', `Bearer ${userToken}`);
      const { body: { status, data: { message } } } = res;
      expect(res).to.have.status(200);
      expect(status).to.eql('success');
      expect(message).to.eql('Articles found');
    });

    it('should return an article filtering with tag', async () => {
      const res = await chai.request(app)
        .get(`/api/articles/filter?tag=${articleTags[0].id}`)
        .set('Authorization', `Bearer ${userToken}`);
      const { body: { status, data: { message } } } = res;
      expect(res).to.have.status(200);
      expect(status).to.eql('success');
      expect(message).to.eql('Articles found');
    });

    it('should return an article filtering with author', async () => {
      const res = await chai.request(app)
        .get('/api/articles/filter?author=johnnybravo1')
        .set('Authorization', `Bearer ${userToken}`);
      const { body: { status, data: { message } } } = res;
      expect(res).to.have.status(200);
      expect(status).to.eql('success');
      expect(message).to.eql('Articles found');
    });

    it('should return an article filtering with search string and tag', async () => {
      const res = await chai.request(app)
        .get('/api/articles/filter?searchStr=princess&tag=1')
        .set('Authorization', `Bearer ${userToken}`);
      const { body: { status, message } } = res;
      expect(res).to.have.status(500);
      expect(status).to.eql('error');
      expect(message).to.eql('Internal server error occurred');
    });
  });
});
