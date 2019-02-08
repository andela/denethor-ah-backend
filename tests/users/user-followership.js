import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import app from '../../index';


chai.use(chaiHttp);

describe('Test Cases for User Followership end point', () => {
  let user1, user2;
  before(async () => {
    const user1Data = {
      email: 'user3@example.test',
      password: 'secretpassword',
      firstname: 'Johnny',
      lastname: 'Bravo2',
      username: 'user3example'
    };

    await chai.request(app)
      .post('/api/users')
      .send(user1Data);

    let res = await chai.request(app)
      .post('/api/users/login')
      .send({ email: user1Data.email, password: user1Data.password });

    user1 = user1Data;
    user1.id = res.body.data.userId;

    const user2Data = {
      email: 'user4@example.test',
      password: 'secretpassword',
      firstname: 'Johnny',
      lastname: 'Bravo4',
      username: 'user4example'
    };
    res = await chai.request(app)
      .post('/api/users')
      .send(user2Data);

    res = await chai.request(app)
      .post('/api/users/login')
      .send({ email: user2Data.email, password: user2Data.password });

    user2 = user2Data;
    user2.token = res.body.data.token;
  });
  it('should return error when no/wrong authorization token is supplied', async () => {
    // no token supplied
    let res = await chai.request(app)
      .post(`/api/users/${user1.id}/follow`);
    expect(res).to.have.status(401);

    // wrong token supplied
    res = await chai.request(app)
      .post(`/api/users/${user1.id}/follow`)
      .set('authorization', `Bearer ${user2}`);
    expect(res).to.have.status(401);
  });
  it('should return server error when invalid userId is supplied', async () => {
    const res = await chai.request(app)
      .post('/api/users/asdasd/follow')
      .set('authorization', `Bearer ${user2.token}`);
    expect(res).to.have.status(500);
  });
  it('should return error of notFound when wrong userId is supplied', async () => {
    const res = await chai.request(app)
      .post('/api/users/d0ac67b2-d24f-4bd4-a79f-60e1f05a8543/follow')
      .set('authorization', `Bearer ${user2.token}`);
    expect(res).to.have.status(404);
  });
  it('should succeed when correct input is supplied', async () => {
    const res = await chai.request(app)
      .post(`/api/users/${user1.id}/follow`)
      .set('authorization', `Bearer ${user2.token}`);
    // since we create 2 new users
    // when user2 follows user1, user1 should just have one follower
    expect(res.body.data.followersCount).to.equal(1);
    expect(res).to.have.status(201);
  });
});
