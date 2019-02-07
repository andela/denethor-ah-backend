import { describe } from 'mocha';
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import app from '../index';

chai.use(chaiHttp);

describe('Test Cases for the API end points', () => {
  it('should return the home route with a status of OK', (done) => {
    chai.request(app)
      .get('/')
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });
});

describe('Social login endpoints', () => {
  it('Google login api should respond with a status of 200', (done) => {
    chai.request(app)
      .get('/api/users/google')
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });
  it('Facebook login api should respond with a status of 200', (done) => {
    chai.request(app)
      .get('/api/users/facebook')
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });
  it('Twitter login api should respond with a status of 200', (done) => {
    chai.request(app)
      .get('/api/users/twitter')
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });
  it('Google redirect without required parameters should throw a 400', (done) => {
    chai.request(app)
      .get('/api/users/google/redirect')
      .end((err, res) => {
        expect(res).to.have.status(400);
        done();
      });
  });
  it('Facebook redirect should respond with a status of 200', (done) => {
    chai.request(app)
      .get('/api/users/facebook/redirect')
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });
  it('Twitter redirect should respond with a status of 200', (done) => {
    chai.request(app)
      .get('/api/users/twitter/redirect')
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });
});
