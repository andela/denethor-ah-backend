import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import app from '../../index';
import models, { sequelize } from '../../server/models';
import { user5, user6 } from '../mocks/mockUsers';
import mockRoles from '../mocks/mockRoles';
import superAdmin from '../mocks/super-admin';

chai.use(chaiHttp);

describe('Test Cases for role assignment', () => {
  let user5token, user6id, superAdminToken;

  before(async () => {
    await models.Roles.bulkCreate(mockRoles);
    await models.User.bulkCreate(superAdmin);

    const { body: { data: { link } } } = await chai.request(app)
      .post('/api/users')
      .send(user5.signUp);

    await chai.request(app)
      .patch(link.slice(22));

    const { body: { data: { token } } } = await chai.request(app)
      .post('/api/users/login')
      .send(user5.logIn);

    const { body: { data: { token: superToken } } } = await chai.request(app)
      .post('/api/users/login')
      .send({
        email: superAdmin[0].email,
        password: 'password'
      });

    const { body: { data: { link: link2 } } } = await chai.request(app)
      .post('/api/users')
      .send(user6.signUp);

    await chai.request(app)
      .patch(link2.slice(22));

    const { body: { data: { userId: id2 } } } = await chai.request(app)
      .post('/api/users/login')
      .send(user6.logIn);

    user5token = token;
    user6id = id2;
    superAdminToken = superToken;
  });

  after((done) => {
    Object.values(sequelize.models).map(function (model) {
      return model.destroy({ where: {}, force: true });
    });
    sequelize.queryInterface.sequelize.query('TRUNCATE TABLE session CASCADE;').then(() => done());
  });

  it('Shouldn\'t be able to change user\'s role if not super-admin', async () => {
    const res = await chai.request(app)
      .patch('/api/users/role')
      .set('Authorization', `Bearer ${user5token}`)
      .send({ id: user6id, role: 'clown' });

    const { body: { status, message } } = res;
    expect(res).to.have.status(401);
    expect(status).to.eql('fail');
    expect(message).to.eql('only super-admin can change the role of others');
  });


  it('Should be able to upgrade other users from author to admin if super-admin', async () => {
    const res = await chai.request(app)
      .patch('/api/users/role')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ id: user6id, role: 'admin' });

    const { body: { data: { id, assignedRole } } } = res;
    expect(res).to.have.status(200);
    expect(id).to.eql(user6id);
    expect(assignedRole).to.eql('admin');
  });

  it('Should throw 404 for non existing id', async () => {
    const res = await chai.request(app)
      .patch('/api/users/role')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        id: 'b404756d-8efc-452e-b10e-f8a62a2315ae',
        role: 'admin'
      });

    const { body: { status, message } } = res;
    expect(res).to.have.status(404);
    expect(status).to.eql('fail');
    expect(message).to.eql('no user found with that id');
  });

  it('Should throw 500 for invalid id', async () => {
    const res = await chai.request(app)
      .patch('/api/users/role')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        id: 'b404756d-8efc-452e-b10e-f8a62a23ae',
        role: 'admin'
      });

    const { body: { status, message } } = res;
    expect(res).to.have.status(500);
    expect(status).to.eql('error');
    expect(message).to.eql('internal server error occured');
  });
});
