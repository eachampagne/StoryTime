const express = require('express');
const promptRoutes = require('./promptRoutes');
const textRoutes = require('./textRoutes');
const userRoutes = require('./userRoutes');
const auth = require('./auth');
const badgesRoutes = require('./badgesRoutes');
const saveStoriesRoutes = require('./savedStoriesRoutes.js');
const app = express();



// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// // Add a middleware function to check if the user is authenticated
// const isAuthenticated = (req, res, next) => {
//   if (req.isAuthenticated()) {
//     return next(); // User is authenticated, proceed to the route handler
//   }
//   res.redirect('/'); // Redirect unauthenticated users to the login page
// };

// // Use the isAuthenticated middleware for protected routes
// app.use('/text', isAuthenticated);
// app.use('/user', isAuthenticated);
// app.use('/prompt', isAuthenticated);
// app.use('/badges', isAuthenticated);

app.use('/auth', auth);
app.use('/text', textRoutes);
app.use('/user', userRoutes);
app.use('/prompt', promptRoutes);
app.use('/badges', badgesRoutes);
app.use('/user/bookshelf', saveStoriesRoutes);

module.exports.app = app;