import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import app from '../../index';
import { user1, user4 } from '../mocks/mockUsers';
import { sequelize } from '../../server/models';


chai.use(chaiHttp);

describe('Test Cases for User Followership end point', () => {
  before(async () => {
    const { body: { data: { link } } } = await chai.request(app)
      .post('/api/users')
      .send(user1.signUp);

    await chai.request(app)
      .patch(link.slice(22));

    const res = await chai.request(app)
      .post('/api/users/login')
      .send(user1.logIn);

    user1.id = res.body.data.userId;
    user1.token = res.body.data.token;

    const { body: { data: { link: link2 } } } = await chai.request(app)
      .post('/api/users')
      .send(user4.signUp);

    const { body: { data } } = await chai.request(app)
      .patch(link2.slice(22));

    user4.token = data.user.token;
  });

  after((done) => {
    Object.values(sequelize.models).map(function (model) {
      return model.destroy({ where: {}, force: true });
    });
    sequelize.queryInterface.sequelize.query('TRUNCATE TABLE session CASCADE;').then(() => done());
  });

  it('should return error when no/wrong authorization token is supplied', async () => {
    // no token supplied
    let res = await chai.request(app)
      .post(`/api/users/${user1.id}/follow`);
    expect(res).to.have.status(401);

    // wrong token supplied
    res = await chai.request(app)
      .post(`/api/users/${user1.id}/follow`)
      .set('authorization', `Bearer ${user4}`);
    expect(res).to.have.status(401);
  });
  it('should return server error when invalid userId is supplied', async () => {
    const res = await chai.request(app)
      .post('/api/users/asdasd/follow')
      .set('authorization', `Bearer ${user4.token}`);
    expect(res).to.have.status(500);
  });
  it('should return error of notFound when wrong userId is supplied', async () => {
    const res = await chai.request(app)
      .post('/api/users/d0ac67b2-d24f-4bd4-a79f-60e1f05a8543/follow')
      .set('authorization', `Bearer ${user4.token}`);
    expect(res).to.have.status(404);
  });
  it('should succeed when correct input is supplied', async () => {
    const res = await chai.request(app)
      .post(`/api/users/${user1.id}/follow`)
      .set('authorization', `Bearer ${user4.token}`);
    // since we create 2 new users
    // when user4 follows user1, user1 should just have one follower
    expect(res.body.data.followersCount).to.equal(1);
    expect(res).to.have.status(201);
  });
});