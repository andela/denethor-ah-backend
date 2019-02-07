import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import app from '../../index';
import { user1 } from '../mocks/mockUsers';
import './signup';


chai.use(chaiHttp);

describe('Test Cases for Login Endpoint', () => {
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
      .send(user1.logIn);
    expect(res).to.have.status(200);
    expect(res.body.status).to.equal('success');
  });
});
describe('Logout', () => {
  it('Should log user out', async () => {
    const res = await chai.request(app)
      .get('/api/users/logout');
    expect(res).to.have.status(200);
  });
});
