import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import fs from 'fs';
import app from '../../index';
import { user1, user4 } from '../mocks/mockUsers';
import { mockArticle } from '../mocks/mockArticle';
import models, { sequelize } from '../../server/models';
import mockRoles from '../mocks/mockRoles';


chai.use(chaiHttp);

describe('Test Cases for User Profile end point', () => {
  before(async () => {
    await models.Roles.bulkCreate(mockRoles);
    const { body: { data: { link } } } = await chai.request(app)
      .post('/api/users')
      .send(user1.signUp);

    await chai.request(app)
      .patch(link.slice(22));

    const { body: { data: { userId: user1Id, token: user1Token } } } = await chai.request(app)
      .post('/api/users/login')
      .send(user1.logIn);

    user1.id = user1Id;
    user1.token = user1Token;

    const { body: { data: { link: link2 } } } = await chai.request(app)
      .post('/api/users')
      .send(user4.signUp);

    await chai.request(app)
      .patch(link2.slice(22));

    const { body: { data: { userId: user4Id, token: user4Token } } } = await chai.request(app)
      .post('/api/users/login')
      .send(user4.logIn);

    user4.id = user4Id;
    user4.token = user4Token;

    // Carry out some actions as User1
    // follow user
    // create article
    // get second user to follow User1
    await chai.request(app)
      .delete(`/api/users/${user4.id}/follow`)
      .set('authorization', `Bearer ${user1.token}`);

    await chai.request(app)
      .delete(`/api/users/${user1.id}/follow`)
      .set('authorization', `Bearer ${user4.token}`);

    // create an article
    await chai.request(app)
      .post('/api/articles')
      .set('Authorization', `Bearer ${user1Token}`)
      .send(mockArticle);
  });

  after((done) => {
    Object.values(sequelize.models).map(function (model) {
      return model.destroy({ where: {}, force: true });
    });
    sequelize.queryInterface.sequelize.query('TRUNCATE TABLE session CASCADE;').then(() => done());
  });

  it('should update user profile', async () => {
    const res = await chai.request(app)
      .patch(`/api/users/${user1.id}/profile`)
      .set('authorization', `Bearer ${user1.token}`)
      .send({ email: 'jsamchineme@example.test', firstname: 'Johnny2' });

    expect(res).to.have.status(200);
    expect(res.body.data.firstname).to.eql('Johnny2');
    expect(res.body.data.email).to.eql('jsamchineme@example.test');
  });

  it('should not allow user to update another users profile', async () => {
    const res = await chai.request(app)
      .patch(`/api/users/${user4.id}/profile`)
      .set('authorization', `Bearer ${user1.token}`)
      .send({ email: 'jsamchineme@example.test', firstname: 'Johnny2' });

    expect(res).to.have.status(400);
    expect(res.body.status).to.eql('fail');
    expect(res.body.message).to.eql('Wrong User. You cannot perform this operation');
  });

  it('should upload user profile picture', async () => {
    const res = await chai.request(app)
      .post(`/api/users/${user1.id}/profile/upload`)
      .set('authorization', `Bearer ${user1.token}`)
      .attach('profile-picture', fs.readFileSync(`${__dirname}/princess.jpg`), 'princess.jpg');

    expect(res).to.have.status(200);
    expect(res.body.data.imageUrl).to.include('http://res.cloudinary.com/jsamcloud12');
  });

  it('should return user profile with appropriate fields', async () => {
    const res = await chai.request(app)
      .get(`/api/users/${user1.id}/profile`)
      .set('authorization', `Bearer ${user1.token}`);

    expect(res).to.have.status(200);
    expect(res.body.data.firstname).to.equal('Johnny2');
    expect(res.body.data.email).to.eql('jsamchineme@example.test');
    expect(res.body.data).to.have.property('followers');
    expect(res.body.data).to.have.property('following');
    expect(res.body.data).to.have.property('publishedArticles');
  });
});
