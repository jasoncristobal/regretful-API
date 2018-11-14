'use strict';

require('dotenv').config();

const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const { DATABASE_URL, PORT, CLIENT_ORIGIN } = require('./config');

const passport = require('passport');
const {router: mistakesRouter} = require('./mistakes/router');
const {router: authRouter} = require('./auth/router');
const {router: usersRouter} = require('./users/router');

const cors = require('cors');

const { localStrategy, jwtStrategy } = require('./auth/strategies');

const app = express();

passport.use(localStrategy);
passport.use(jwtStrategy);
app.use(
  cors({
      origin: CLIENT_ORIGIN
  })
);
app.use(morgan('common'));
app.use(express.json());
app.use(express.static('public'));
app.use('/api/mistakes', mistakesRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);







app.use('*', function (req, res) {
  res.status(404).json({ message: 'Not Found' });
});

// closeServer needs access to a server object, but that only
// gets created when `runServer` runs, so we declare `server` here
// and then assign a value to it in run
let server;

// this function connects to our database, then starts the server
function runServer(databaseUrl, port = PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
        .on('error', err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
}

// this function closes the server, and returns a promise. we'll
// use it in our integration tests later.
function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

// if server.js is called directly (aka, with `node server.js`), this block
// runs. but we also export the runServer command so other code (for instance, test code) can start the server as needed.
if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = { runServer, app, closeServer };