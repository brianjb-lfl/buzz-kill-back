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
    weight: 175,
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

describe('api/drinks/:id PUT', function() {
  // drinks PUT tests
});

describe('api/patrons/dayclose DELETE', function() {
  // drinks PUT tests
});

describe('api/patrons/:id DELETE', function() {
  // drinks PUT tests
});