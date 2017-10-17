'use strict';

const express = require('express');
const router = express.Router();
const { Patron } = require('./models');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

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
      drinks: []
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

