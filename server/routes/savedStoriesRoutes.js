const express = require('express');
const router = express.Router();
const { Text, UsersBookshelves} = require('../database/index');

/**
 * GET request handler searches through the UserBookshelves table in the
 * database, and find the information matching the id of the user sending
 * the request. It then returns the found data to the client side for
 * the information to be displayed. In addition to finding the stories with
 * matching userId data, it will also grab the text of the story that the user
 * saved in the usersBookshelves table. That information is sent to the client
 * side as well.
 */
router.get('/:userId', (req, res) => {
  UsersBookshelves.findAll({where: {userId: parseInt(req.params.userId)}})
    .then((savedTexts) => {
      const storyIds = savedTexts.map((text) => {
        return text.storyId;
      })
      return Text.findAll({where: {id: storyIds}});
    })
    .then((storys) => {
      res.status(200).send(storys);
    })
    .catch((err) => {
      console.error(err, 'savedStoriesRoutes GET');
      res.sendStatus(500);
    })

})

/**
 * POST allows the user to save a story to their bookshelf. It takes the text id and
 * the user id of the user signed in, and creates a new row to be added to the
 * usersBookshelves table in the database. If that new data is added to the table
 * successfully, we shall get a 201 status code for it being added to the table.
 */
router.post('/:userId', (req, res) => {
  UsersBookshelves.create({storyId: parseInt(req.body.textId), userId: parseInt(req.params.userId)})
    .then(() => {
      res.status(201).send();
    })
    .catch((err) => {
      console.error(err, 'POST error in savedStories')
      res.sendStatus(500);
    })
});

/**
 * DELETE is the request handling that takes place when the user clicks the
 * delete button on the savedStory. It will search the databases for the row that
 * matches the textId and the userId. Then, it will complete destroy the row from
 * the table and it is nonexistent in the database.
 */
router.delete('/:userId', (req, res) => {
  UsersBookshelves.destroy({where: {storyId: parseInt(req.body.textId), userId: parseInt(req.params.userId)}})
    .then((story) => {

      res.status(201).send();
    })
    .catch((err) => {
      console.error(err, 'DELETE error in savedStories');
      res.sendStatus(500);
    })

})

module.exports = router;