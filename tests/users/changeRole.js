import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import app from '../../index';
import models, { sequelize } from '../../server/models';
import { user5, user6 } from '../mocks/mockUsers';
import mockRoles from '../mocks/mockRoles';

chai.use(chaiHttp);

describe('Test Cases for role assignment', () => {
  let user5token, user5id, user6id;

  before(async () => {
    await models.Roles.bulkCreate(mockRoles);

    const { body: { data: { link } } } = await chai.request(app)
      .post('/api/users')
      .send(user5.signUp);

    await chai.request(app)
      .patch(link.slice(22));

    const { body: { data: { userId: id, token } } } = await chai.request(app)
      .post('/api/users/login')
      .send(user5.logIn);


    const { body: { data: { link: link2 } } } = await chai.request(app)
      .post('/api/users')
      .send(user6.signUp);

    await chai.request(app)
      .patch(link2.slice(22));

    const { body: { data: { userId: id2 } } } = await chai.request(app)
      .post('/api/users/login')
      .send(user6.logIn);

    user5token = token;
    user5id = id;
    user6id = id2;
  });

  after((done) => {
    Object.values(sequelize.models).map(function (model) {
      return model.destroy({ where: {}, force: true });
    });
    sequelize.queryInterface.sequelize.query('TRUNCATE TABLE session CASCADE;').then(() => done());
  });

  it('Shouldn\'t be able to change user\'s role if not admin', async () => {
    const res = await chai.request(app)
      .patch('/api/users/role')
      .set('Authorization', `Bearer ${user5token}`)
      .send({ id: user6id, role: 'clown' });

    const { body: { status, message } } = res;
    expect(res).to.have.status(401);
    expect(status).to.eql('fail');
    expect(message).to.eql('only admins can change user roles');
  });

  it('Shouldn\'t upgrade user making the request to admin if wrong pass is supplied', async () => {
    const res = await chai.request(app)
      .patch('/api/users/admin')
      .set('Authorization', `Bearer ${user5token}`)
      .send({ pass: 'I am a masterpiece' });

    const { body: { status, message } } = res;
    expect(res).to.have.status(403);
    expect(status).to.eql('fail');
    expect(message).to.eql('wrong pass');
  });

  it('Should upgrade user making the request to admin if correct pass is supplied', async () => {
    const res = await chai.request(app)
      .patch('/api/users/admin')
      .set('Authorization', `Bearer ${user5token}`)
      .send({ pass: process.env.ADMIN_PASS });

    const { body: { data: { id, assignedRole } } } = res;
    expect(res).to.have.status(200);
    expect(id).to.eql(user5id);
    expect(assignedRole).to.eql('admin');
  });

  it('Shouldn\'t be able to assign users to non-existent roles', async () => {
    const res = await chai.request(app)
      .patch('/api/users/role')
      .set('Authorization', `Bearer ${user5token}`)
      .send({ id: user6id, role: 'clown' });

    const { body: { status, message } } = res;
    expect(res).to.have.status(422);
    expect(status).to.eql('fail');
    expect(message).to.eql('not a valid role');
  });

  it('Should be able to upgrade other users from author to admin if admin', async () => {
    const res = await chai.request(app)
      .patch('/api/users/role')
      .set('Authorization', `Bearer ${user5token}`)
      .send({ id: user6id, role: 'admin' });

    const { body: { data: { id, assignedRole } } } = res;
    expect(res).to.have.status(200);
    expect(id).to.eql(user6id);
    expect(assignedRole).to.eql('admin');
  });

  it('Should throw 404 for non existing id', async () => {
    const res = await chai.request(app)
      .patch('/api/users/role')
      .set('Authorization', `Bearer ${user5token}`)
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
      .set('Authorization', `Bearer ${user5token}`)
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
