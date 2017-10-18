'use strict';

const mongoose = require('mongoose');
const moment = require('moment');

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
  },
  drinks: [{
    drinkEq: {
      type: Number,
      required: true,
      default: 1.0
    },
    drinkTime: {
      type: Date,
      default: Date.now
    }
  }]
});

PatronSchema.virtual('bac')
  .get(function() {
    let bacCalc = 0;
    const genderF = this.gender === 'm' ? .73 : .66;
    this.drinks.forEach( drink => {
      const elapsedT = moment.utc(moment()).diff(moment.utc(drink.drinkTime))/3600000;
      bacCalc += Math.max(((drink.drinkEq * .6 * 5.14) / (this.weight * genderF)) - (.015 * elapsedT), 0);
    });
    return (bacCalc * 100).toFixed(1);
  });

PatronSchema.virtual('timeOnSite')
  .get(function() {
    let elapsedTime = Math.round(moment.utc(moment()).diff(moment.utc(this.start))/60000);
    let timeOutput = Math.floor(elapsedTime / 60);
    elapsedTime -= (timeOutput * 60);
    if(elapsedTime < 10) {
      timeOutput += ":0" + elapsedTime;
    }
    else {
      timeOutput += ":" + elapsedTime;
    }
    
    return timeOutput;
  });

PatronSchema.virtual('seatString')
  .get(function() {
    return `Table ${this.table} - Seat ${this.seat}`;
  });

PatronSchema.methods.apiRepr = function () {
  return {
    id: this._id,
    table: this.table,
    seat: this.seat,
    seatString: this.seatString,
    weight: this.weight,
    gender: this.gender,
    start: this.start,
    drinks: this.drinks,
    bac: this.bac,
    timeOnSite: this.timeOnSite
  };
};

const Patron = mongoose.models.Patron || mongoose.model('Patron', PatronSchema);

module.exports = { Patron };
