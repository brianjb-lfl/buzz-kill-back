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
    default: moment()    
  },
  drinks: [{
    drinkEq: {
      type: Number,
      required: true,
      default: 1.0
    },
    drinkTime: {
      type: Date,
      default: moment()
    }
  }]
});

PatronSchema.virtual('bac')
  .get(function() {
    let bacCalc = 0;
    const genderF = this.gender === 'm' ? .73 : .66;
    this.drinks.forEach( drink => {
      const elapsedT = (moment(moment().diff(this.start)).format('m'))/60;
      bacCalc += ((drink.drinkEq * .6 * 5.14) / (this.weight * genderF)) - (.015 * elapsedT);
    });
    return (bacCalc * 100).toFixed(1);
  });

PatronSchema.virtual('timeOnSite')
  .get(function() {
    if(this.drinks.length < 1){
      return "0:00";
    }
    else {
      let minElapsed =  moment(moment().diff(this.start)).format('m');
      const hrsElapsed = Math.floor(minElapsed/60);
      minElapsed = minElapsed - (hrsElapsed * 60);
      minElapsed = minElapsed < 10 ? "0" + minElapsed : minElapsed;
      return hrsElapsed + ":" + minElapsed;
    }
  });

PatronSchema.methods.apiRepr = function () {
  return {
    id: this._id,
    table: this.table,
    seat: this.seat,
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
