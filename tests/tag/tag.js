import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import sinon from 'sinon';
import app from '../../index';
import models, { sequelize, Tag } from '../../server/models';
import { user14 } from '../mocks/mockUsers';
import mockRoles from '../mocks/mockRoles';
import mockTags from '../mocks/mockTags';

chai.use(chaiHttp);

describe('Tests for Tags resource', () => {
  let userToken;
  after(async () => {
    await Object.values(sequelize.models).map(function (model) {
      return model.destroy({ where: {}, force: true });
    });
    await sequelize.queryInterface.sequelize.query('TRUNCATE TABLE session CASCADE;');
  });

  before(async () => {
    await models.Roles.bulkCreate(mockRoles);

    const { body: { data: { link } } } = await chai.request(app)
      .post('/api/users')
      .send(user14.signUp);

    const { body: { data: { user: { token } } } } = await chai.request(app)
      .patch(link.slice(22));

    userToken = token;
  });

  describe('Tests for Tags resource with Mock Tags', () => {
    before(async () => {
      await models.Tag.bulkCreate(mockTags);
    });

    it('should return all tags on the application', async () => {
      const res = await chai.request(app)
        .get('/api/tags')
        .set('Authorization', `Bearer ${userToken}`);
      const { body: { status, data: { message } } } = res;
      expect(res).to.have.status(200);
      expect(status).to.eql('success');
      expect(message).to.eql('Tags found');
    });
  });

  it('should return an error for no Tags', async () => {
    const res = await chai.request(app)
      .get('/api/tags')
      .set('Authorization', `Bearer ${userToken}`);
    const { body: { status, data: { message } } } = res;
    expect(res).to.have.status(404);
    expect(status).to.eql('fail');
    expect(message).to.eql('No Tag was found');
  });

  it('should fail on server error', async () => {
    const tagStub = sinon.stub(Tag, 'findAll');
    tagStub.rejects();

    const res = await chai.request(app)
      .get('/api/tags')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res).to.have.status(500);

    tagStub.restore();
  });
});
