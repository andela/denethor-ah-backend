import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import app from '../../index';

chai.use(chaiHttp);

describe('Test Cases for the API end points', () => {
  it('should return the home route with a status of OK', async () => {
    const res = await chai.request(app)
      .get('/');
    expect(res).to.have.status(200);
  });
});
