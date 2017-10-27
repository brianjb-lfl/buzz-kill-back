'use strict';
/* eslint no-console: "off" */

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { PORT, CLIENT_ORIGIN } = require('./config');
const { dbConnect } = require('./db-mongoose');
const { router } = require('./router');
const { Patron } = require('./models');
require('dotenv').config();

const app = express();

app.use(
  morgan(process.env.NODE_ENV === 'production' ? 'common' : 'dev', {
    skip: (req, res) => process.env.NODE_ENV === 'test'
  })
);

app.use(
  cors({
    origin: CLIENT_ORIGIN
  })
);

app.use('/api/', router);

app.use('*', (req, res) => {
  return res.status(404).json({message: 'Not Found'});
});

// ***** ADD-IN FUNCTION
// function to facilitate ongoing demos
// checks hourly for patrons left over from prior demos
// (> 8 hrs old) and clears them from patron collection
// this function is not part of the production app
function clearOldData() {
  const hrsToAgeOut = 8;
  let oldDataCt = 0;
  Patron
    .count({start: {$lte: new Date(new Date().getTime()-(hrsToAgeOut*60*60*1000)).toISOString()} })
    .then( oldCt => {
      oldDataCt = oldCt;
      return Patron.deleteMany({start: {$lte: new Date(new Date().getTime()-(hrsToAgeOut*60*60*1000)).toISOString()} });
    })
    .then( () => {
      console.log(`Outdated data check ran - delete count: ${oldDataCt}`);
      setTimeout(clearOldData, 60*60*1000);
    })
    .catch( err => {
      console.error(err);
    });
}
// ***** END OF ADD-IN FUNCTION

function runServer(port = PORT) {
  const server = app
    .listen(port, () => {
      console.info(`App listening on port ${server.address().port}`);
    })
    .on('error', err => {
      console.error('Express failed to start');
      console.error(err);
    });
}

if (require.main === module) {
  dbConnect();
  runServer();
  clearOldData();
}

module.exports = {app};
