'use strict';

const express = require('express');
const router = express.Router();
const { Patron } = require('./models');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

router.get('/patrons/', (req, res) => {
  Patron
    .find()
    .sort([['start', 'descending']])
    .then( patrons => {
      let newArr = patrons.map( patron => patron.apiRepr());
      res.json(newArr);
    })
    .catch( err => {
      console.error(err);
      res.status(500).json({error: 'Search failed'});
    });
});

router.post('/patrons/', jsonParser, (req, res) => {
  
  const requiredFs = ['table', 'seat', 'gender'];
  const missingF = requiredFs.find( field => !(field in req.body));
  if (missingF) {
    return res.status(422).json({
      code: 422,
      reason: 'validationError',
      message: 'Missing field',
      location: missingF
    });
  }
  
  const nanF = (isNaN(req.body.table) || isNaN(req.body.seat));
  if (nanF) {
    return res.status(422).json({
      code: 422,
      reason: 'validationError',
      message: 'Table and seat must be numbers'
    });
  }
  
  let {table, seat, gender} = req.body;
  let drinks = [];

  return Patron.find({table, seat})
    .count()
    .then( count => {
      if(count > 0){
        return Promise.reject({
          code: 422,
          reason: 'ValidationError',
          message: 'That table/seat is already occupied'
        });
      }
    })
    .then( () => {
      return   Patron.create({table, seat, gender, drinks});
    })
    .then(patron => res.status(201).json(patron.apiRepr())
    )
    .catch( err => {
      if (err.reason === 'ValidationError') {
        return res.status(err.code).json(err);
      }
      res.status(500).json({message: 'Internal server error'});
    });
});

router.put('/drinks/:id', jsonParser, (req, res) => {
  if(!(req.params.id && req.body._id && req.params.id === req.body._id)) {
    res.status(400).json({
      error: 'Request path id and request body id values must match'
    });
  }
  Patron
    .findByIdAndUpdate(
      req.params.id,
      {"$push": { "drinks": req.body.drinks }}, {"new":true}
    )
    .then(
      patron => res.status(201).json(patron.apiRepr())
    )
    .catch( err => {
      res.status(500).json({message: 'Internal server error'});
    });
});

router.delete('/patrons/dayclose/', (req, res) => {
  
  return Patron
    .remove({})
    .then( () => {
      res.status(204).end();
    });
});

router.delete('/patrons/:id', (req, res) => {

  Patron
    .findByIdAndRemove(req.params.id)
    .then( () => {
      res.status(204).end();
    })
    .catch( err => {
      res.status(500).json({message: 'Internal server error'});
    });
});

module.exports = { router };

