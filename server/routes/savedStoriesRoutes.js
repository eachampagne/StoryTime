const express = require('express');
const router = express.Router();
const { FullStories, UsersBookshelves} = require('../database/index');

// // GET to get all the saved stories with the users id
router.get('/:userId', (req, res) => {
  // needs to get all stories that the current user logged in has saved
  console.log(req.params, 'EHL;L;LPOFJOSHNKJBHSJB')
  UsersBookshelves.findAll({where: {userId: req.params.userId}})
    .then((data) => {
      res.status(200).send(data); // change
    })
    .catch((err) => {
      console.error(err, 'savedStoriesRoutes GET');
    })

})

// // POST user can make a bookshelf
// router.post('/bookshelf', (req, res) => {
router.post();

// })

// // PATCH be able to remove/add the stories to the shelf. Maybe even change the name
// router.patch('/bookshelf', (req, res) => {


// })

// // DELETE a story from the bookshelf. Maybe even just delete the bookshelf as a whole
// router.delete('/bookshelf', (req, res) => {


// })

module.exports = router;