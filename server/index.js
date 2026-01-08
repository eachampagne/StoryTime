const path = require('path');
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const { User } = require('./database/index')
const { app, server, io } = require('./socket.js');
const control = require('./control.js');

const port = process.env.PORT || 8080;

// Middleware for serving static files
app.use(express.static(path.resolve(__dirname, '../dist')));

// Initialize session
const superSecretKey = 'Dev_Dawgs_Till_I_Die';

app.use(
  session({
    secret: superSecretKey,
    resave: false,
    saveUninitialized: true,
  })
  );

  // Initialize Passport.js
  app.use(passport.initialize());
  app.use(passport.session());


// Passport.js local strategy for user login
passport.use(
  new LocalStrategy((username, password, done) => {
    return User.findOne({ where: { username } })
      .then((user) => {
        if (!user) {
          return done(null, false, { message: 'Incorrect username.' });
        }

        return bcrypt.compare(password, user.password)
          .then((passwordMatch) => {
            if (!passwordMatch) {
              return done(null, false, { message: 'Incorrect password.' });
            }

            return done(null, user);
          })
      })
      .catch((error) => {
        return done(error);
      });
  })
);

// Serialize user for session storage
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session storage
passport.deserializeUser((id, done) => {
  User.findByPk(id)
    .then((user) => {
      done(null, user);
    })
    .catch((error) => {
      console.error('Error with deserialization:', error);
      done(error);
    });
});

// Require and use routes
const { app: routesApp } = require('./routes/routes');
app.use('/', routesApp); // Mount routes

app.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname, '../dist/index.html'), function(err) {
    if (err) {
      res.status(500).send(err)
    }
  })
})

// Start the server
server.listen(port, () => {
  console.log(`Server is running on port http://127.0.0.1:${port}`);
});