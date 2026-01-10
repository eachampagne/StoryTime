const express = require('express');
const passport = require('passport');
const { User } = require('../database/index');
const bcrypt = require('bcrypt');

const router = express.Router();

// User registration
// is there a graceful way to break a then chain? All these guards seem kind of wasteful.
router.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ message: 'must input a username and password' });
    return;
  }

  // Check if the username already exists
  User.findOne({ where: { username } })
    .then((existingUser) => {
      if (existingUser) {
        res.status(400).json({ message: 'Username already exists.' });
        return;
      }

      // Hash the password
      return bcrypt.hash(password, 10);
    })
    .then((hashedPassword) => {
      if (hashedPassword) {
        return User.create({ username, password: hashedPassword});
      }
    })
    .then((new_user) => {
      if (new_user) {
        const { id: user_id, username: user_name } = new_user;
        return res.status(201).json({ message: 'Registration successful.', new_user, user_id, user_name });
      }
    })
    .catch((error) => {
      console.error('Failed to create new user:', error);
      return res.status(500).json({ message: 'Internal server error.' });
    })
});

// User login
router.post('/login', passport.authenticate('local'), (req, res) => {
  const user_id = req.user.id;
  const user_name = req.user.username;
  console.log('this is the current user id/name ---------->', user_id, user_name)
  return res.json({ message: 'Login successful.', user_id, user_name });
});

// // checking if user is logged in
// router.get('/check', (req, res) => {
//   if (req.isAuthenticated()) {
//     const userID = req.user.id;
//     const user_name = req.user.username;
//     return res.json({ message: 'Authenticated', userID, user_name });
//   }
//   res.status(401).json({ message: 'Not authenticated.' });
// });

// User logout
router.get('/logout', (req, res) => {
  req.logout();
  res.json({ message: 'Logout successful.' });
});

module.exports = router;