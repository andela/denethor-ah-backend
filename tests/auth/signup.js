import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import app from '../../index';
import models, { sequelize } from '../../server/models';
import { user2 } from '../mocks/mockUsers';
import mockRoles from '../mocks/mockRoles';

chai.use(chaiHttp);


describe('Test Cases for Signup Endpoint', () => {
  let link;
  before(async () => {
    await models.Roles.bulkCreate(mockRoles);
  });
  after(async () => {
    await Object.values(sequelize.models).map(function (model) {
      return model.destroy({ where: {}, force: true });
    });
    await sequelize.queryInterface.sequelize.query('TRUNCATE TABLE session CASCADE;');
  });

  it('should create user account when valid input is supplied', async () => {
    const res = await chai.request(app)
      .post('/api/users')
      .send(user2.signUp);
    const { body: { data } } = res;
    const { link: verifyLink } = data;
    link = verifyLink;
    expect(res).to.have.status(201);
    expect(data).to.have.property('link');
  });

  it('should verify user', async () => {
    const res = await chai.request(app)
      .patch(link.slice(22));
    const { body: { data: { user } } } = res;
    expect(res).to.have.status(200);
    expect(user).to.have.property('token');
    expect(user.username).to.eql(user2.signUp.username);
    expect(user.email).to.eql(user2.signUp.email);
  });
});
