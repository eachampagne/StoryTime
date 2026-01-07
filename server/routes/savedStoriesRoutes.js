const express = require('express');
const router = express.Router();
const { FullStories, UsersBookshelf } = require('../database/index');

// // GET to get all the saved stories with the users id
router.get('/', (req, res) => {
  // needs to get all stories that the current user logged in has saved
  
  res.status(200).send('that worked')

})

// // POST user can make a bookshelf
// router.post('/user/bookshelf', (req, res) => {

  
// })

// // PATCH be able to remove/add the stories to the shelf. Maybe even change the name
// router.patch('/user/bookshelf', (req, res) => {

  
// })

// // DELETE a story from the bookshelf. Maybe even just delete the bookshelf as a whole
// router.delete('/user/bookshelf', (req, res) => {

  
// })

module.exports = router;