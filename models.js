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
    const genderMaleF = 0.73;
    const genderFemaleF = 0.66;
    const secPerHr = 3600000;
    const alcOzPerDrinkEq = 0.6;
    const wgtConvF = 5.14;                // convert lbs to oz and liquid oz to weight oz
    const alcElimRate = .015;
    let bacCalc = 0;
    const genderF = this.gender === 'm' ? genderMaleF : genderFemaleF;
    this.drinks.forEach( drink => {
      const elapsedHrs = moment.utc(moment()).diff(moment.utc(drink.drinkTime))/secPerHr;
      bacCalc += Math.max(((drink.drinkEq * alcOzPerDrinkEq * wgtConvF) / (this.weight * genderF)) - (alcElimRate * elapsedHrs), 0);
    });
    return (bacCalc * 100).toFixed(1);    // eliminate leading ".0" to make numbers easier to read
  });

PatronSchema.virtual('timeOnSite')
  .get(function() {
    // builds string showing time elapsed since visit start
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
    seatString: this.seatString,
    start: this.start,
    drinks: this.drinks,
    bac: this.bac,
    timeOnSite: this.timeOnSite
  };
};

const Patron = mongoose.models.Patron || mongoose.model('Patron', PatronSchema);

module.exports = { Patron };
