import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import models, { sequelize } from '../../server/models';
import app from '../../index';
import { user4, user15 } from '../mocks/mockUsers';
import { signToken } from '../../server/api/helpers/tokenization/tokenize';
import mockRoles from '../mocks/mockRoles';

chai.use(chaiHttp);

describe('Test Cases for change Password Endpoint', () => {
  let userToken, userToken2, expiredToken, user2Token;
  const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6I66iMmU3MDAwLWE3MjEtNDY1OS1hMjRiLTg1M2RlNDk4ZDBjOSIsImVtYWlsIjoicHJpbmNlc3M2M0BleGFtcGxlLmNvbSIsImlhdCI6MTU0OTY1MDgzNywiZXhwIjoxNTQ5NzM3MjM3fQ.1B1I2tlmJzGBdiAmY9R_6tPdRrBXHkdW2wOYUSZ0Gbk';
  const email = 'user4@example.test';
  const email2 = 'user@example.test';

  before(async () => {
    await models.Roles.bulkCreate(mockRoles);
    expiredToken = await signToken({
      email
    }, '0.0005');

    userToken2 = await signToken({
      email: email2
    });

    const { body: { data: { link } } } = await chai.request(app)
      .post('/api/users')
      .send(user4.signUp);

    await chai.request(app)
      .patch(link.slice(22));

    const { body: { data: { token } } } = await chai.request(app)
      .post('/api/users/login')
      .send(user4.logIn);
    userToken = token;

    const { body: { data: { link: link2 } } } = await chai.request(app)
      .post('/api/users')
      .send(user15.signUp);

    await chai.request(app)
      .patch(link2.slice(22));

    const { body: { data: { token: token2 } } } = await chai.request(app)
      .post('/api/users/login')
      .send(user15.logIn);
    user2Token = token2;
  });

  after((done) => {
    Object.values(sequelize.models).map(function (model) {
      return model.destroy({ where: {}, force: true });
    });
    sequelize.queryInterface.sequelize.query('TRUNCATE TABLE session CASCADE;').then(() => done());
  });

  describe('Test Cases for change Password Verification Endpoint', () => {
    it('should return error with wrong input supplied', async () => {
      const res = await chai.request(app)
        .post('/api/users/forgotPassword')
        .send({
          email: 'email',
        });
      expect(res).to.have.status(422);
      expect(res.body.status).to.equal('fail');
    });
    it('should succeed when correct input is supplied', async () => {
      await chai.request(app);
      const res = await chai.request(app)
        .post('/api/users/forgotPassword/')
        .send({
          email: 'user4@example.test',
        });
      expect(res).to.have.status(200);
    });

    it('should return error if user not found', async () => {
      const res = await chai.request(app)
        .post('/api/users/forgotPassword/')
        .send({
          email: 'user7@example.test',
        });
      const { status, message } = res.body;
      expect(res).to.have.status(404);
      expect(status).to.equal('fail');
      expect(message).to.equal('User not found,Provide correct email address');
    });
  });

  describe('Test Cases for Change Password Endpoint', () => {
    it('should return error with wrong input supplied', async () => {
      const res = await chai.request(app)
        .patch(`/api/users/forgotPassword/${userToken}`)
        .send({
          password: 'pass'
        });
      expect(res).to.have.status(422);
      expect(res.body.status).to.equal('fail');
    });
    it('should reset a user password if the account exists', async () => {
      const res = await chai.request(app)
        .patch(`/api/users/forgotPassword/${userToken}`)
        .send({
          password: 'password'
        });
      const { body: { data } } = res;
      expect(res).to.have.status(200);
      expect(data.email).to.equal(user4.logIn.email);
      expect(data.message).to.have.equal('Password update Successful. You can now login');
    });

    it('should return error if user does not exist', async () => {
      const res = await chai.request(app)
        .patch(`/api/users/forgotPassword/${userToken2}`)
        .send({
          password: 'password'
        });
      const { status, message } = res.body;
      expect(res).to.have.status(404);
      expect(status).to.equal('fail');
      expect(message).to.equal('User not found,Provide correct email address');
    });
    it('should not change password if incorrect token is supplied', async () => {
      const res = await chai.request(app)
        .patch(`/api/users/forgotPassword/${fakeToken}`)
        .send({
          password: 'password'
        });
      const { status, message } = res.body;
      expect(res).to.have.status(500);
      expect(status).to.equal('error');
      expect(message).to.equal('Internal server error occured.');
    });
    it('User should get an error if token is expired', async () => {
      await chai.request(app)
        .post('/api/users')
        .send(user4.signUp);
      const res = await chai.request(app)
        .patch(`/api/users/forgotPassword/${expiredToken}`)
        .send({
          password: 'password'
        });

      const { status, message } = res.body;
      expect(res).to.have.status(401);
      expect(status).to.equal('fail');
      expect(message).to.equal('Link has expired. Kindly re-initiate password change.');
    });
  });
  describe('Test Cases for Reset Password Endpoint', () => {
    it('should return error with wrong input supplied', async () => {
      const res = await chai.request(app)
        .patch('/api/users/resetPassword/')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          Oldpassword: 'pass'
        });
      expect(res).to.have.status(422);
      expect(res.body.status).to.equal('fail');
    });

    it('should return error if old password supplied is incorrect', async () => {
      const res = await chai.request(app)
        .patch('/api/users/resetPassword/')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          oldPassword: 'secretpasswo',
          newPassword: 'secretpassword'
        });
      expect(res).to.have.status(403);
      expect(res.body.status).to.equal('fail');
      expect(res.body.message).to.have.equal('The old password you have entered is incorrect');
    });

    it('should reset a user password if the account exists', async () => {
      const res = await chai.request(app)
        .patch('/api/users/resetPassword/')
        .set('Authorization', `Bearer ${user2Token}`)
        .send({
          oldPassword: 'secretpassword',
          newPassword: 'secretpassword'
        });
      const { body: { data } } = res;
      expect(res).to.have.status(200);
      expect(res.body.status).to.equal('success');
      expect(data.message).to.have.equal('Password updated successfully.');
    });

    it('should not change password if incorrect token is supplied', async () => {
      const res = await chai.request(app)
        .patch('/api/users/resetPassword/')
        .set('Authorization', `Bearer ${user2Token}`)
        .send({
          password: 'password'
        });
      const { status, message } = res.body;
      expect(res).to.have.status(500);
      expect(status).to.equal('error');
      expect(message).to.equal('Server error.');
    });
  });
});
