const chai = require('chai');
const chaiHttp = require('chai-http');

const { app } = require('../server');

const should = chai.should();
chai.use(chaiHttp);

describe('API', function () {

    it('should 404 on GET requests', function () {
        return chai.request(app)
            .get('/')
            .then(function (res) {
                res.should.have.status(404);
            });
    });
    it('should 404 on POST requests', function () {
        return chai.request(app)
            .post('/')
            .then(function (res) {
                res.should.have.status(404);
            });
    });

});