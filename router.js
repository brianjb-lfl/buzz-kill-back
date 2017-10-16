'use strict';

const express = require('express');
const router = express.Router();
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

router.get('/patrons/', (req,res) => {
  console.log('running router.js');
  res.json(testData);
});

module.exports = { router };

