import { describe } from 'mocha';
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import app from '../index';
import { sequelize } from '../server/models';

chai.use(chaiHttp);

describe('Test Cases for the Authentication end points', () => {
  let userData;
  before((done) => {
    userData = {
      email: 'user1@example.test',
      password: 'secretpassword',
      firstname: 'Johnny',
      lastname: 'Bravo',
      username: 'johnnybravo'
    };
    chai.request(app)
      .post('/api/users')
      .send(userData)
      .end(() => {
        done();
      });
  });
  after((done) => {
    sequelize.drop().then(() => sequelize.queryInterface.dropTable('session').then(() => done()));
  });
  describe('Test Cases for Login Endpoint', () => {
    it('should return error with wrong input supplied', (done) => {
      chai.request(app)
        .post('/api/users/login')
        .send({
          email: 'email',
          password: 'password'
        })
        .end((err, res) => {
          expect(res).to.have.status(422);
          done();
        });
    });
    it('should succeed when correct input is supplied', (done) => {
      const userCredentials = {
        email: userData.email,
        password: userData.password
      };
      chai.request(app)
        .post('/api/users/login')
        .send(userCredentials)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.status).to.equal('success');
          done();
        });
    });
  });
  describe('Test Cases for Signup Endpoint', () => {
    it('should create user account when valid input is supplied', (done) => {
      userData = {
        email: 'user2@example.test',
        password: 'secretpassword',
        firstname: 'Johnny',
        lastname: 'Bravo',
        username: 'johnnybravo2'
      };
      chai.request(app)
        .post('/api/users')
        .send(userData)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.status).to.equal('success');
          done();
        });
    });
  });
});
