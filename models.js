'use strict';

const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const PatronSchema = mongoose.Schema({
  table: {
    type: Number,
    required: true
  },
  seat: {
    type: Number,
    required: true
  },
  weight: {
    type: Number,
    required: true,
    default: 175
  },
  gender: {
    type: String,
    required: true
  },
  start: {
    type: Date,
    default: Date.now    
  }
});

PatronSchema.methods.apiRepr = function () {
  return {
    id: this._id,
    table: this.table,
    seat: this.seat,
    weight: this.weight,
    gender: this.gender,
    start: this.start
  };
};

const Patron = mongoose.models.Patron || mongoose.model('Patron', PatronSchema);

module.exports = { Patron };
