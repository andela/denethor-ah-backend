import chai, { expect } from 'chai';
import passport from 'passport';
import sinon from 'sinon';
import chaiHttp from 'chai-http';
import app from '../../index';
import models, { sequelize } from '../../server/models';
import { user, mockStrategy } from '../mocks/mockStrategy';
import mockRoles from '../mocks/mockRoles';

chai.use(chaiHttp);

describe('Test Cases for the social login endpoints', () => {
  before(async () => {
    await models.Roles.bulkCreate(mockRoles);
    const fake = sinon.fake.returns(passport.use(mockStrategy));
    sinon.replace(passport, 'use', fake);
  });

  after((done) => {
    Object.values(sequelize.models).map(function (model) {
      return model.destroy({ where: {}, force: true });
    });
    sequelize.queryInterface.sequelize.query('TRUNCATE TABLE session CASCADE;').then(() => done());
  });

  it('Should create account for user once Google returns payload', async () => {
    const res = await chai.request(app)
      .get('/api/users/google/redirect');
    const { body: { data } } = res;
    expect(res).to.have.status(200);
    expect(data).to.have.property('token');
    expect(data.user.email).to.eql(user.emails[0].value);
  });

  it('Should create account for user once Facebook returns payload', async () => {
    const res = await chai.request(app)
      .get('/api/users/google/redirect');
    const { body: { data } } = res;
    expect(res).to.have.status(200);
    expect(data).to.have.property('token');
    expect(data.user.email).to.eql(user.emails[0].value);
  });

  it('Should create account for user once Twitter returns payload', async () => {
    const res = await chai.request(app)
      .get('/api/users/google/redirect');
    const { body: { data } } = res;
    expect(res).to.have.status(200);
    expect(data).to.have.property('token');
    expect(data.user.email).to.eql(user.emails[0].value);
  });
});
