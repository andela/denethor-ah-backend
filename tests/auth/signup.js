import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import app from '../../index';
import { user1 } from '../mocks/mockUsers';

chai.use(chaiHttp);


describe('Test Cases for Signup Endpoint', () => {
  it('should create user account when valid input is supplied', async () => {
    const res = await chai.request(app)
      .post('/api/users')
      .send(user1.signUp);
    expect(res).to.have.status(200);
    expect(res.body.status).to.equal('success');
  });
});
