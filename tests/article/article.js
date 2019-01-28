import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import app from '../../index';
import models, { sequelize } from '../../server/models';
import { user1 } from '../mocks/mockUsers';
import { mockArticle, invalidArticle } from '../mocks/mockArticle';
import mockCategory from '../mocks/mockCategory';
import { comment, longComment } from '../mocks/mockComments';

chai.use(chaiHttp);

describe('Tests for article resource', () => {
  after(async () => {
    await Object.values(sequelize.models).map(function (model) {
      return model.destroy({ where: {}, force: true });
    });
    await sequelize.queryInterface.sequelize.query('TRUNCATE TABLE session CASCADE;');
  });

  describe('Test Cases for Create Article Endpoint', () => {
    let userToken;
    const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6I66iMmU3MDAwLWE3MjEtNDY1OS1hMjRiLTg1M2RlNDk4ZDBjOSIsImVtYWlsIjoicHJpbmNlc3M2M0BleGFtcGxlLmNvbSIsImlhdCI6MTU0OTY1MDgzNywiZXhwIjoxNTQ5NzM3MjM3fQ.1B1I2tlmJzGBdiAmY9R_6tPdRrBXHkdW2wOYUSZ0Gbk';

    before(async () => {
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
    it('should create an article when a current valid user', async () => {
      const res = await chai.request(app)
        .post('/api/articles')
        .set('Authorization', `Bearer ${userToken}`)
        .send(mockArticle);
      expect(res).to.have.status(201);
      expect(res.body.status).to.equal('Success');
    });
  });

  describe('Tests for creating comments', () => {
    let token;
    let articleId;
    before(async () => {
      const { body: { data: { token: userToken } } } = await chai.request(app)
        .post('/api/users/login')
        .send(user1.logIn);

      token = userToken;

      const { body: { data: { id } } } = await chai.request(app)
        .post('/api/articles')
        .set('Authorization', `Bearer ${userToken}`)
        .send(mockArticle);

      articleId = id;
    });

    it('Should create comment if all is right', async () => {
      const res = await chai.request(app)
        .post(`/api/articles/${articleId}/comments`)
        .set('Authorization', `Bearer ${token}`)
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
        .set('Authorization', `Bearer ${token}`)
        .send(longComment);
      const { body } = res;
      expect(res).to.have.status(422);
      expect(body).to.not.have.property('data');
    });
  });

  describe('Tests for liking/disliking Articles', () => {
    let token;
    let articleId;
    const fakeArticleId = 'fakeArticleId';
    before(async () => {
      const { body: { data: { token: userToken } } } = await chai.request(app)
        .post('/api/users/login')
        .send(user1.logIn);

      token = userToken;

      const { body: { data: { id } } } = await chai.request(app)
        .post('/api/articles')
        .set('Authorization', `Bearer ${userToken}`)
        .send(mockArticle);

      articleId = id;
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
        .set('Authorization', `Bearer ${token}`);
      expect(res).to.have.status(500);
    });

    it('Should return server error when fake article id is provided', async () => {
      const res = await chai.request(app)
        .patch(`/api/articles/${fakeArticleId}/dislikes`)
        .set('Authorization', `Bearer ${token}`);
      expect(res).to.have.status(500);
    });

    it('Should create an impression liking an article ', async () => {
      const res = await chai.request(app)
        .patch(`/api/articles/${articleId}/likes`)
        .set('Authorization', `Bearer ${token}`);
      const { body, body: { data }, body: { data: { message: impressionMessage } } } = res;
      expect(res).to.have.status(200);
      expect(body).to.have.property('data');
      expect(data).to.have.property('impression');
      expect(impressionMessage).to.eql('You liked this Article!');
    });

    it('Should update an impression unliking an article ', async () => {
      const res = await chai.request(app)
        .patch(`/api/articles/${articleId}/likes`)
        .set('Authorization', `Bearer ${token}`);
      const { body, body: { data }, body: { data: { message: impressionMessage } } } = res;
      expect(res).to.have.status(200);
      expect(body).to.have.property('data');
      expect(data).to.have.property('impression');
      expect(impressionMessage).to.eql('You unliked this Article!');
    });

    it('Should update an impression disliking an article ', async () => {
      const res = await chai.request(app)
        .patch(`/api/articles/${articleId}/dislikes`)
        .set('Authorization', `Bearer ${token}`);
      const { body, body: { data }, body: { data: { message: impressionMessage } } } = res;
      expect(res).to.have.status(200);
      expect(body).to.have.property('data');
      expect(data).to.have.property('impression');
      expect(impressionMessage).to.eql('You disliked this Article!');
    });

    it('Should update an impression un-disliking an article ', async () => {
      const res = await chai.request(app)
        .patch(`/api/articles/${articleId}/dislikes`)
        .set('Authorization', `Bearer ${token}`);
      const { body, body: { data }, body: { data: { message: impressionMessage } } } = res;
      expect(res).to.have.status(200);
      expect(body).to.have.property('data');
      expect(data).to.have.property('impression');
      expect(impressionMessage).to.eql('You un-disliked this Article!');
    });
  });
});
