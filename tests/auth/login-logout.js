import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import models, { sequelize } from '../../server/models';
import app from '../../index';
import { user3, user4 } from '../mocks/mockUsers';
import mockRoles from '../mocks/mockRoles';


chai.use(chaiHttp);

describe('Test Cases for Login Endpoint', () => {
  before(async () => {
    await models.Roles.bulkCreate(mockRoles);
    const { body: { data: { link } } } = await chai.request(app)
      .post('/api/users')
      .send(user3.signUp);
    await chai.request(app)
      .patch(link.slice(22));

    await chai.request(app)
      .post('/api/users')
      .send(user4.signUp);
  });

  after((done) => {
    Object.values(sequelize.models).map(function (model) {
      return model.destroy({ where: {}, force: true });
    });
    sequelize.queryInterface.sequelize.query('TRUNCATE TABLE session CASCADE;').then(() => done());
  });

  it('should return error with wrong input supplied', async () => {
    const res = await chai.request(app)
      .post('/api/users/login')
      .send({
        email: 'email',
        password: 'password'
      });
    expect(res).to.have.status(422);
  });
  it('should succeed when correct input is supplied', async () => {
    const res = await chai.request(app)
      .post('/api/users/login')
      .send(user3.logIn);
    const { body: { data } } = res;
    expect(res).to.have.status(200);
    expect(data.email).to.equal(user3.logIn.email);
    expect(data).to.have.property('token');
  });

  it('should not login an unverified user', async () => {
    const res = await chai.request(app)
      .post('/api/users/login')
      .send(user4.logIn);
    const { status, message } = res.body;
    expect(res).to.have.status(403);
    expect(status).to.equal('fail');
    expect(message).to.equal('Email not verified');
  });
});
describe('Logout', () => {
  it('Should log user out', async () => {
    const res = await chai.request(app)
      .get('/api/users/logout');
    expect(res).to.have.status(200);
  });
});
