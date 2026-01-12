const express = require('express');
const router = express.Router();
const { Text, UsersBookshelves} = require('../database/index');

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