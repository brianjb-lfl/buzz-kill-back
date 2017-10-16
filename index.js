'use strict';

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const {PORT, CLIENT_ORIGIN} = require('./config');
const {dbConnect} = require('./db-mongoose');
// const {dbConnect} = require('./db-knex');

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

app.get('/api/patrons/', (req, res) => {
  res.json(testData);
});

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
}

module.exports = {app};
