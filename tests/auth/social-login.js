import chai, { expect } from 'chai';
import passport from 'passport';
import sinon from 'sinon';
import chaiHttp from 'chai-http';
import app from '../../index';
import { mockStrategy } from '../mocks/mockStrategy';

chai.use(chaiHttp);

describe('Test Cases for the social login endpoints', () => {
  before(() => {
    const fake = sinon.fake.returns(passport.use(mockStrategy));
    sinon.replace(passport, 'use', fake);
  });

  after(() => {
    sinon.restore();
  });

  it('Should create account for user once Google returns payload', async () => {
    const res = await chai.request(app)
      .get('/api/users/google/redirect');
    expect(res).to.have.status(200);
  });

  it('Should create account for user once Facebook returns payload', async () => {
    const res = await chai.request(app)
      .get('/api/users/facebook/redirect');
    expect(res).to.have.status(200);
  });

  it('Should create account for user once Twitter returns payload', async () => {
    const res = await chai.request(app)
      .get('/api/users/twitter/redirect');
    expect(res).to.have.status(200);
  });
});
