// const describe = require('mocha');
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const app = require('../index');

chai.use(chaiHttp);

describe('Test Cases for the API end points', function() {
  it('should return all articles', function(done) {
    chai.request(app)
      .get('/articles')
      .end(function(err, res) {
        expect(res).to.have.status(200);
        done();
      });
  });
  it('should return route not found', function(done) {
    chai.request(app)
      .get('/users')
      .end(function(err, res) {
        expect(res).to.have.status(404);
        done();
      });
  });
});


