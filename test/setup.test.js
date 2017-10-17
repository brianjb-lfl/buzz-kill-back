'use strict';

const {TEST_DATABASE_URL} = require('../config');
const {dbConnect, dbDisconnect} = require('../db-mongoose');
const chai = require('chai');
const chaiHttp = require('chai-http');

const {Patron} = require('../models');


// Set NODE_ENV to `test` to disable http layer logs
// You can do this in the command line, but this is cross-platform
process.env.NODE_ENV = 'test';

// Clear the console before each run
process.stdout.write('\x1Bc\n');

const expect = chai.expect;
chai.use(chaiHttp);

before(function() {
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
  return Patron.remove({})
});

describe('Mocha and Chai', function() {
  it('should be properly setup', function() {
    expect(true).to.be.true;
  });
});
