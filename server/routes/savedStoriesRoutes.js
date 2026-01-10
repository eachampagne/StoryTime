const express = require('express');
const router = express.Router();
const { Text, UsersBookshelves} = require('../database/index');

// // GET to get all the saved stories with the users id
router.get('/:userId', (req, res) => {
  // needs to get all stories that the current user logged in has saved
  console.log(req.params, 'EHL;L;LPOFJOSHNKJBHSJB')
  UsersBookshelves.findAll({where: {userId: parseInt(req.params.userId)}})
    .then((savedTexts) => {
      //console.log(data)
      // need to find the text that matches the storyId
      const storyIds = savedTexts.map((text) => {
        return text.storyId
        // now find the text that match
      })
      return Text.findAll({where: {id: storyIds}})
      // res.status(200).send(savedText); // change
    })
    .then((storys) => {
      res.status(200).send(storys);
    })
    .catch((err) => {
      console.error(err, 'savedStoriesRoutes GET');
      res.sendStatus(500);
    })

})

// // POST user can make a bookshelf
// router.post('/bookshelf', (req, res) => {
router.post('/:userId', (req, res) => {
  UsersBookshelves.create({storyId: parseInt(req.body.textId), userId: parseInt(req.params.userId)})
    .then(() => {
      res.status(201).send()
    })
    .catch((err) => {
      console.error(err, 'POST error in savedStories')
      res.sendStatus(500);
    })
});

// })

// // PATCH be able to remove/add the stories to the shelf. Maybe even change the name
// router.patch('/bookshelf', (req, res) => {


// })

// DELETE a story from the bookshelf. Maybe even just delete the bookshelf as a whole
router.delete('/:userId', (req, res) => {
  console.log(req.params, req.body, 'testtststts')
  UsersBookshelves.destroy({where: {storyId: parseInt(req.body.textId), userId: parseInt(req.params.userId)}})
    .then((story) => {
      console.log(story)

      res.status(201).send()
    })
    .catch((err) => {
      console.error(err, 'DELETE error in savedStories')
      res.sendStatus(500);
    })

})


// dummy POST for when user clicks the submit button
// router.post('/', (req, res) => {
//   console.log(req.body, "BOPDYYYYYYYYYYYYYYYY")
//   FullStories.find({})
//     .then(() => {
//       res.status(201).send()
//     })
//     .catch((err) => {
//       console.error(err, 'POST in savedStories')
//     })
// })
module.exports = router;