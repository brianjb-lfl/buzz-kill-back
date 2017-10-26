'use strict';
/* eslint no-console: "off" */

const express = require('express');
const router = express.Router();
const { Patron } = require('./models');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

router.get('/patrons/bytableseat/', (req, res) => {
  Patron
    .find()
    .sort([['table', 'ascending'], ['seat', 'ascending']])
    .then( patrons => {
      let newArr = patrons.map( patron => patron.apiRepr());
      res.json(newArr);
    })
    .catch( err => {
      console.error(err);
      res.status(500).json({error: 'Search failed'});
    });
});

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
  
  const validTblSeatFs = !(req.body.table > 0) || !(req.body.seat>0);
  if (validTblSeatFs) {
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
          reason: 'validationError',
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
      if (err.reason === 'validationError') {
        return res.status(err.code).json(err);
      }
      res.status(500).json({message: 'Internal server error'});
    });
});

router.put('/drinks/:id', jsonParser, (req, res) => {
  if(!(req.params.id && req.body._id && req.params.id === req.body._id)) {
    return res.status(400).json({
      error: 'Request path id and request body id values must match'
    });
  }
  Patron
    .findByIdAndUpdate(
      req.params.id,
      {"$push": {"drinks": req.body.drinks }}, {"new":true}
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
    .find(req.params.id)
    .then( patron => {
      if(!patron) {
        res.status(422).json({message: 'User not found'});
      }
      return Patron.findByIdAndRemove(req.params.id);
    })
    .then( () => {
      res.status(204).end();
    })
    .catch( err => {
      res.status(500).json({message: 'Internal server error'});
    });
});

module.exports = { router };

