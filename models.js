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
  gender: {
    type: String,
    required: true
  }
});

PatronSchema.methods.apiRepr = function () {
  return {
    id: this._id,
    table: this.table,
    seat: this.seat,
    gener: this.gender
  };
};

const Patron = mongoose.models.Patron || mongoose.model('Patron', PatronSchema);

module.exports = { Patron };
