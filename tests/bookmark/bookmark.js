import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import app from '../../index';
import models, { sequelize } from '../../server/models';
import { user1, user2 } from '../mocks/mockUsers';
import { mockArticle2 } from '../mocks/mockArticle';
import mockCategory from '../mocks/mockCategory';
import mockRoles from '../mocks/mockRoles';

chai.use(chaiHttp);


describe('Tests for Bookmark resources', () => {
  let userId;
  let userId2;
  let token;
  let token2;
  let articleId;

  const nonExistingUserId = 'd073e097-fcec-4dd5-a29a-84e020cdd2';
  const nonExistingArticleId = 'a7da270a-bae4-4c0d-8faa-1ed9412f7654';
  const wrongArticleId = 'd073e097-fcec-4dd5-a29a-84e020c';

  before(async () => {
    await models.Roles.bulkCreate(mockRoles);
    await models.Category.bulkCreate(mockCategory);
    const { body: { data: { link } } } = await chai.request(app)
      .post('/api/users')
      .send(user1.signUp);

    const { body: { data: { user: { id, token: userToken } } } } = await chai.request(app)
      .patch(link.slice(22));
    userId = id;
    token = userToken;

    const { body: { data: { link: link2 } } } = await chai.request(app)
      .post('/api/users')
      .send(user2.signUp);

    const { body: { data: { user: { id: id2, token: userToken2 } } } } = await chai.request(app)
      .patch(link2.slice(22));
    userId2 = id2;
    token2 = userToken2;

    const { body: { data: { id: articleId1 } } } = await chai.request(app)
      .post('/api/articles')
      .set('Authorization', `Bearer ${userToken}`)
      .send(mockArticle2);
    articleId = articleId1;
  });

  after(async () => {
    await Object.values(sequelize.models).map(function (model) {
      return model.destroy({ where: {}, force: true });
    });
    await sequelize.queryInterface.sequelize.query('TRUNCATE TABLE session CASCADE;');
  });

  describe('Tests for create Article Bookmark', () => {
    it('Should bookmark article if request is correct', async () => {
      const res = await chai.request(app)
        .post(`/api/articles/${articleId}/bookmark`)
        .set('Authorization', `Bearer ${token}`);
      const { body: { status, message } } = res;
      expect(res).to.have.status(201);
      expect(status).to.equal('success');
      expect(message).to.equal('Bookmark successful');
    });

    it('Should not bookmark if article has already been bookmarked by the user', async () => {
      const res = await chai.request(app)
        .post(`/api/articles/${articleId}/bookmark`)
        .set('Authorization', `Bearer ${token}`);
      const { body: { status, message } } = res;
      expect(res).to.have.status(409);
      expect(status).to.equal('fail');
      expect(message).to.equal('You already bookmarked this article');
    });

    it('Should return error if article does not exist', async () => {
      const res = await chai.request(app)
        .post(`/api/articles/${nonExistingArticleId}/bookmark`)
        .set('Authorization', `Bearer ${token}`);
      const { body: { status, message } } = res;
      expect(res).to.have.status(404);
      expect(status).to.equal('fail');
      expect(message).to.equal('Article not found');
    });

    it('Should return error if article id is incorrrect', async () => {
      const res = await chai.request(app)
        .post(`/api/articles/${wrongArticleId}/bookmark`)
        .set('Authorization', `Bearer ${token}`);
      const { body: { status, message } } = res;
      expect(res).to.have.status(500);
      expect(status).to.equal('error');
      expect(message).to.equal('Internal Server Error!');
    });
  });

  describe("Tests for get user's Bookmarks", () => {
    it("Should get user's Bookmarks if request is correct", async () => {
      const res = await chai.request(app)
        .get(`/api/users/${userId}/bookmarks`)
        .set('Authorization', `Bearer ${token}`);
      const { body: { status, message } } = res;
      expect(res).to.have.status(200);
      expect(status).to.equal('success');
      expect(message).to.equal('Bookmarks retrieved successfully');
    });

    it('Should return fail if no article has been bookmarked by the user', async () => {
      const res = await chai.request(app)
        .get(`/api/users/${userId2}/bookmarks`)
        .set('Authorization', `Bearer ${token2}`);
      const { body: { status, message } } = res;
      expect(res).to.have.status(404);
      expect(status).to.equal('fail');
      expect(message).to.equal('Sorry! You are yet to bookmark any article');
    });

    it('Should return error if user id is incorrrect', async () => {
      const res = await chai.request(app)
        .get(`/api/users/${nonExistingUserId}/bookmarks`)
        .set('Authorization', `Bearer ${token}`);
      const { body: { status, message } } = res;
      expect(res).to.have.status(500);
      expect(status).to.equal('error');
      expect(message).to.equal('Internal Server Error!');
    });
  });

  describe('Tests for delete Article Bookmark', () => {
    it('Should delete article bookmark if request is correct', async () => {
      const res = await chai.request(app)
        .delete(`/api/articles/${articleId}/bookmark`)
        .set('Authorization', `Bearer ${token}`);
      const { body: { status, message } } = res;
      expect(res).to.have.status(200);
      expect(status).to.equal('success');
      expect(message).to.equal('Bookmark removed');
    });

    it('Should return fail if article has not been bookmarked by the user', async () => {
      const res = await chai.request(app)
        .delete(`/api/articles/${articleId}/bookmark`)
        .set('Authorization', `Bearer ${token}`);
      const { body: { status, message } } = res;
      expect(res).to.have.status(404);
      expect(status).to.equal('fail');
      expect(message).to.equal('You are yet to bookmark this article');
    });
  });
});
