'use strict';

const {TEST_DATABASE_URL} = require('../config');
const {dbConnect, dbDisconnect} = require('../db-mongoose');
const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiDateTime = require('chai-datetime');

const { app } = require('../index');
const {Patron} = require('../models');


// Set NODE_ENV to `test` to disable http layer logs
// You can do this in the command line, but this is cross-platform
process.env.NODE_ENV = 'test';

// Clear the console before each run
process.stdout.write('\x1Bc\n');

const expect = chai.expect;
chai.use(chaiHttp);
chai.use(chaiDateTime);

describe('/api', function () {
  // test data
  const table = 13;
  const seat = 13;
  const gender = "m";
  const weight = 175;
  const d = new Date();
  const drink = {drinks: {drinkEq: 1.0, drinkTime: d.toISOString()}};

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
      return chai.request(app)
        .get('/api/patrons/')
        .then(function (res) {
          // check response
          expect(res).to.have.status(200);
          expect(res.body.length).to.be.above(0);
          expect(res.body).to.be.an('array');
          expect(res).to.be.json;
          // check each patron element in response array
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
      return chai.request(app)
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
      return chai.request(app)
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
      return chai.request(app)
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
      return chai.request(app)
        .post('/api/patrons/')
        .send({table: "a", seat, gender})     // text in table field
        .then(function () {
          expect.fail(null, null, 'Request should fail');})
        .catch(err => {
          if(err instanceof chai.AssertionError) {
            throw err;
          }
          const res = err.response;
          expect(res).to.have.status(422);
          expect(res.body.reason).to.equal('validationError');
          expect(res.body.message).to.equal('Table and seat must be numbers');
        });
    });

    it('should reject posts with non-number seat entry', function() {
      return chai.request(app)
        .post('/api/patrons/')
        .send({table, seat: '', gender})      // empty string in seat field
        .then(function () {
          expect.fail(null, null, 'Request should fail');})
        .catch(err => {
          if(err instanceof chai.AssertionError) {
            throw err;
          }
          const res = err.response;
          expect(res).to.have.status(422);
          expect(res.body.reason).to.equal('validationError');
          expect(res.body.message).to.equal('Table and seat must be numbers');
        });
    });

    it('should reject patrons in a seat already occupied', function() {
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

    it('should create a new patron', function() {
      return chai.request(app)
        .post('/api/patrons/')
        .send({table, seat, gender, weight})
        .then(function(res) {
          // test response
          expect(res).to.have.status(201);
          expect(res).to.be.an('object');
          expect(res.body).to.include.keys('seatString', 'start', 'drinks', 'bac', 'timeOnSite');
          // test the newly created individual patron 
          return Patron.findOne({_id: res.body.id})
            .then(function (res) {
              expect(res.table).to.deep.equal(table);
              expect(res.seat).to.deep.equal(seat);
              expect(res.gender).to.deep.equal(gender);
              expect(res.drinks).to.be.an('array');
              expect(res.drinks.length).to.equal(0);
              // test if start timestamp is recent (< 15 sec old)
              let startMS = new Date(res.start);
              startMS = startMS.getTime();
              let currMS = new Date;
              currMS = currMS.getTime();
              expect(currMS - startMS).to.be.below(15000);    // < 15 seconds difference
              expect(startMS - currMS).to.be.below(0);        // start time earlier than current time
              expect(res.weight).to.deep.equal(weight);
            });
        });
    });
  });

  describe('api/drinks/:id PUT', function() {
    it('should add a drink to the patron drinks array', function() {
      const newDrink = drink;
      let patron;
      let startDrinkCt;
      let addedDrink = false;
      return Patron
        .findOne()
        .then(function(_patron) {
          patron = _patron;
          startDrinkCt = _patron.drinks.length;          
          newDrink._id = patron._id;
          return chai.request(app)
            .put(`/api/drinks/${newDrink._id}`)
            .send(newDrink);
        })
        .then(function(res) {
          expect(res).to.have.status(201);
        })
        .then(function() {
          return chai.request(app)
            .get('/api/patrons/')
            .then(function(res) {
              const targetPatron = res.body.find( el => el.id == patron._id);
              // use drinkTime field to identify newly added drink
              if(targetPatron.drinks.find( drink => drink.drinkTime == newDrink.drinks.drinkTime)){
                addedDrink = true;
              }
              expect(addedDrink).to.equal(true);
            });
        });
    });
  });

  it('should reject put if id missing from body', function() {
    return chai.request(app)
      .put('/api/drinks/anyID')
      .send()
      .then(function(res) {
      })
      .catch(function(err) {
        expect(err).to.have.status(400);
        expect(err.response.body.error).to.equal('Request path id and request body id values must match');
      });
  });

  it('should reject put if body and url ids dont match', function() {
    const newDrink = drink;
    newDrink._id = "a";
    return chai.request(app)
      .put('/api/drinks/mismatchedID')
      .send(newDrink)
      .then(function(res) {
      })
      .catch(function(err) {
        expect(err).to.have.status(400);
        expect(err.response.body.error).to.equal('Request path id and request body id values must match');
      });
  });

  describe('api/patrons/dayclose DELETE', function() {
    it('Should delete all patrons', function() {
      return chai
        .request(app)
        .delete('/api/patrons/dayclose/')
        .then(function(res) {
          expect(res).to.have.status(204);
        })
        .then(function() {
          // confirm no patrons remain in collection
          return chai.request(app)
            .get('/api/patrons/')
            .then(function(res) {
              expect(!Object.keys(res.body).length).to.equal(true);
            });
        });
    });
  });

  describe('api/patrons/:id DELETE', function() {
    it('Should delete the patron indicated by id', function() {
      let patron;
      let noDelete;
      return Patron
        .findOne()
        .then(function(_patron) {
          patron = _patron;
          return chai.request(app)
            .delete(`/api/patrons/${patron._id}`);
        })
        .then(function(res) {
          expect(res).to.have.status(204);
        })
        .then(function() {
          // confirm target item has been removed from collection
          return chai.request(app)
            .get('/api/patrons/')
            .then(function(res) {
              if(!Object.keys(res.body).length){
                // no patrons remain in collection
                noDelete = false;
              }
              else {
                // target patron no longer in collection?
                noDelete = res.body.find( el => el.id == patron._id );
              }
              expect(noDelete).to.equal(false);
            });
        });
    });
  });

});