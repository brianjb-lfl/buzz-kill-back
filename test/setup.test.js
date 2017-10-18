'use strict';

const {TEST_DATABASE_URL} = require('../config');
const {dbConnect, dbDisconnect} = require('../db-mongoose');
const chai = require('chai');
const chaiHttp = require('chai-http');

const { app } = require('../index');
const {Patron} = require('../models');


// Set NODE_ENV to `test` to disable http layer logs
// You can do this in the command line, but this is cross-platform
process.env.NODE_ENV = 'test';

// Clear the console before each run
process.stdout.write('\x1Bc\n');

const expect = chai.expect;
chai.use(chaiHttp);

describe('/api', function () {
  const table = 13;
  const seat = 13;
  const gender = 'm';
  const drink = {drinkEq: 1.0};

  before(function() {
    console.log(TEST_DATABASE_URL);
    return dbConnect(TEST_DATABASE_URL);
  });

  after(function() {
    return dbDisconnect();
  });

  beforeEach(function(){
    return Patron.create({
      table: 1,
      seat: 1,
      gender: "m",
      drinks: [{
        drinkEq: 1.5
      }]
    });
  });

  afterEach(function(){
    return Patron.remove({});
  });

  describe('api/patrons GET', function() {
    it('should return all existing patrons', function() {
      return chai
        .request(app)
        .get('/api/patrons/')
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res.body.length).to.be.above(0);
          expect(res.body).to.be.an('array');
          expect(res).to.be.json;
          res.body.forEach(function(patron) {
            expect(patron).to.be.an('object');
            expect(patron).to.include.keys('seatString', 'start', 'bac', 'timeOnSite', 'drinks');
          });
        })
        .catch(err => {
          if(err instanceof chai.AssertionError) {
            throw err;
          }
        });
    });
  });

  describe('api/patrons POST', function() {
    it('should reject posts with missing table', function() {
      return chai
        .request(app)
        .post('/api/patrons/')
        .send({seat, gender})
        .then(function () {
          expect.fail(null, null, 'Request should fail');})
        .catch(err => {
          if(err instanceof chai.AssertionError) {
            throw err;
          }
          const res = err.response;
          expect(res).to.have.status(422);
          expect(res.body.reason).to.equal('validationError');
          expect(res.body.message).to.equal('Missing field');
          expect(res.body.location).to.equal('table');
        });
    });

    it('should reject posts with missing seat', function() {
      return chai
        .request(app)
        .post('/api/patrons/')
        .send({table, gender})
        .then(function () {
          expect.fail(null, null, 'Request should fail');})
        .catch(err => {
          if(err instanceof chai.AssertionError) {
            throw err;
          }
          const res = err.response;
          expect(res).to.have.status(422);
          expect(res.body.reason).to.equal('validationError');
          expect(res.body.message).to.equal('Missing field');
          expect(res.body.location).to.equal('seat');
        });
    });

    it('should reject posts with missing gender', function() {
      return chai
        .request(app)
        .post('/api/patrons/')
        .send({table, seat})
        .then(function () {
          expect.fail(null, null, 'Request should fail');})
        .catch(err => {
          if(err instanceof chai.AssertionError) {
            throw err;
          }
          const res = err.response;
          expect(res).to.have.status(422);
          expect(res.body.reason).to.equal('validationError');
          expect(res.body.message).to.equal('Missing field');
          expect(res.body.location).to.equal('gender');
        });
    });

    it('should reject posts with non-number table entry', function() {
      return chai
        .request(app)
        .post('/api/patrons/')
        .send({table: "a", seat, gender})
        .then(function () {
          expect.fail(null, null, 'Request should fail');})
        .catch(err => {
          if(err instanceof chai.AssertionError) {
            throw err;
          }
          const res = err.response;
          expect(res).to.have.status(422);
          expect(res.body.reason).to.equal('validationError');
          expect(res.body.message).to.equal('Missing field');
          expect(res.body.location).to.equal('gender');
        });
    });

    // need test of non-number seat entry

    it('should reject patrons in a seat already occupied', function() {
      // create a patron with known table, seat
      return Patron.create({table, seat, gender})
        .then( () =>
          chai.request(app)
            .post('/api/patrons/')
            .send({table, seat, gender})
        )
        .then( () => 
          expect.fail(null, null, 'Request should fail')
        )
        .catch(err => {
          if(err instanceof chai.AssertionError) {
            throw err;
          }
          const res = err.response;
          expect(res).to.have.status(422);
          expect(res.body.reason).to.equal('validationError');
          expect(res.body.message).to.equal('That table/seat is already occupied');
        });
    });



  });

  describe('api/drinks/:id PUT', function() {
    // drinks PUT tests
  });

  describe('api/patrons/dayclose DELETE', function() {
    // drinks PUT tests
  });

  describe('api/patrons/:id DELETE', function() {
    // drinks PUT tests
  });

});