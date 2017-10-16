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
      res.json(patrons);
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
      gender: req.body.gender
    })
    .then(
      patron => res.status(201).json(patron.apiRepr())
    )
    .catch( err => {
      res.status(500).json({message: 'Internal server error'});
    });
});

module.exports = { router };

