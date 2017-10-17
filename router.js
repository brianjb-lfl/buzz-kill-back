'use strict';

const express = require('express');
const router = express.Router();
const { Patron } = require('./models');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const testData = [
  {
    id: 1,
    table: 1,
    seat: 1,
    time: 1.25,
    bac: 4.0 
  },
  {
    id: 2,
    table: 1,
    seat: 2,
    time: 1.25,
    bac: 2.7 
  },
  {
    id: 3,
    table: 2,
    seat: 1,
    time: 0.75,
    bac: 1.0 
  },
  {
    id: 4,
    table: 2,
    seat: 2,
    time: 0.75,
    bac: 0.0 
  },
  {
    id: 5,
    table: 99,
    seat: 5,
    time: 1.15,
    bac: 2.1 
  }
];

router.get('/patrons/test/', (req,res) => {
  console.log('running router.js');
  res.json(testData);
});

router.get('/patrons/', (req, res) => {
  Patron
    .find()
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
  Patron
    .create({
      table: req.body.table,
      seat: req.body.seat,
      weight: req.body.weight,
      gender: req.body.gender,
      drinks: req.body.drinks
    })
    .then(
      patron => res.status(201).json(patron.apiRepr())
    )
    .catch( err => {
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

router.delete('/patrons/:id', (req, res) => {
  Patron
    .findByIdAndRemove(req.params.id)
    .then( () => {
      res.status(204).end();
    });
});

module.exports = { router };

