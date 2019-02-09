import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import app from '../../index';
import { user1 } from '../mocks/mockUsers';
import { mockArticle, invalidArticle } from '../mocks/mockArticle';

chai.use(chaiHttp);

describe('Test Cases for Create Article Endpoint', () => {
  let userToken;
  const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6I66iMmU3MDAwLWE3MjEtNDY1OS1hMjRiLTg1M2RlNDk4ZDBjOSIsImVtYWlsIjoicHJpbmNlc3M2M0BleGFtcGxlLmNvbSIsImlhdCI6MTU0OTY1MDgzNywiZXhwIjoxNTQ5NzM3MjM3fQ.1B1I2tlmJzGBdiAmY9R_6tPdRrBXHkdW2wOYUSZ0Gbk';

  before(async () => {
    const { body: { data: { token } } } = await chai.request(app)
      .post('/api/users/login')
      .send(user1.logIn);
    userToken = token;
  });
  it('should return unauthorized when no token is provided at article creation', async () => {
    const res = await chai.request(app)
      .post('/api/articles')
      .send(mockArticle);
    expect(res).to.have.status(401);
  });
  it('should return unauthorized when invalid token is provided at article creation', async () => {
    const res = await chai.request(app)
      .post('/api/articles')
      .set('Authorization', `Bearer ${fakeToken}`)
      .send(mockArticle);
    expect(res).to.have.status(401);
  });
  it('should return an error when invalid input is provided at article creation by a valid user', async () => {
    const res = await chai.request(app)
      .post('/api/articles')
      .set('Authorization', `Bearer ${userToken}`)
      .send(invalidArticle);
    expect(res).to.have.status(422);
  });
  it('should create an article when a current valid user', async () => {
    const res = await chai.request(app)
      .post('/api/articles')
      .set('Authorization', `Bearer ${userToken}`)
      .send(mockArticle);
    expect(res).to.have.status(201);
    expect(res.body.status).to.equal('Success');
  });
});
