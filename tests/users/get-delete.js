import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import app from '../../index';
import models, { sequelize } from '../../server/models';
import { user1, user2 } from '../mocks/mockUsers';
import mockRoles from '../mocks/mockRoles';

chai.use(chaiHttp);

describe('Tests for getting all authors', () => {
  let userToken, user2token, userId, user2id;
  before(async () => {
    await models.Roles.bulkCreate(mockRoles);
    const { body: { data: { link } } } = await chai.request(app)
      .post('/api/users')
      .send(user1.signUp);

    const { body: { data: { link: link2 } } } = await chai.request(app)
      .post('/api/users')
      .send(user2.signUp);

    const { body: { data: { user: { id, token } } } } = await chai.request(app)
      .patch(link.slice(22));

    const { body: { data: { user: { id: id2, token: token2 } } } } = await chai.request(app)
      .patch(link2.slice(22));

    user2token = token2;
    userToken = token;
    userId = id;
    user2id = id2;
  });

  after((done) => {
    Object.values(sequelize.models).map(function (model) {
      return model.destroy({ where: {}, force: true });
    });
    sequelize.queryInterface.sequelize.query('TRUNCATE TABLE session CASCADE;').then(() => done());
  });

  it('Should get all authors for logged in user', async () => {
    const res = await chai.request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${userToken}`);
    const { status, data: { count, users } } = res.body;
    expect(res).to.have.status(200);
    expect(users).to.be.an('array');
    expect(status).to.equal('success');
    expect(count).to.equal(0);
  });

  it('Should not get details of particular user if not admin', async () => {
    const res = await chai.request(app)
      .get(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${userToken}`);
    const { status, message } = res.body;
    expect(res).to.have.status(403);
    expect(status).to.equal('fail');
    expect(message).to.equal('You\'re not an admin');
  });

  it('Should not be able to delete user if not admin', async () => {
    const res = await chai.request(app)
      .delete(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${userToken}`);
    const { status, message } = res.body;
    expect(res).to.have.status(403);
    expect(status).to.equal('fail');
    expect(message).to.equal('You\'re not an admin');
  });

  it('Should get details of particular user if admin', async () => {
    await chai.request(app)
      .patch('/api/users/admin')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ pass: process.env.ADMIN_PASS });

    const res = await chai.request(app)
      .get(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${userToken}`);
    const { status, data: { id } } = res.body;
    expect(res).to.have.status(200);
    expect(status).to.equal('success');
    expect(id).to.equal(userId);
  });

  it('Should be able to delete particular user if admin', async () => {
    const res = await chai.request(app)
      .delete(`/api/users/${user2id}`)
      .set('Authorization', `Bearer ${userToken}`);
    const { status, data: { id, message } } = res.body;
    expect(res).to.have.status(200);
    expect(status).to.equal('success');
    expect(id).to.equal(user2id);
    expect(message).to.equal('user deleted');
  });

  it('Should throw 404 if user is not found', async () => {
    const res = await chai.request(app)
      .get(`/api/users/${user2id}`)
      .set('Authorization', `Bearer ${userToken}`);
    const { status, message } = res.body;
    expect(res).to.have.status(404);
    expect(status).to.equal('fail');
    expect(message).to.equal('no user with that id');
  });

  it('Should throw 500 if user is not found', async () => {
    const res = await chai.request(app)
      .delete(`/api/users/${user2id}`)
      .set('Authorization', `Bearer ${userToken}`);
    const { status, message } = res.body;
    expect(res).to.have.status(404);
    expect(status).to.equal('fail');
    expect(message).to.equal('no user with that id');
  });

  it('Should not be able to access API with deleted account even if you still have token', async () => {
    const res = await chai.request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${user2token}`);
    expect(res).to.have.status(500);
    expect(res.text).to.be.a('string');
  });
});
