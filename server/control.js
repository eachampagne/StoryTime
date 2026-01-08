const axios = require('axios');

const { Prompt, Badges } = require('./database');

let nextPromptTimer;

// TODO: have way to select from vetted prompts
function generateNewPrompt() {
  return axios.get('https://random-word-api.herokuapp.com/word?number=5')
    .then((response) => {
      const words = response.data;
      // save words to DB
      return Badges.findOne({order: [['id', 'DESC']]})
        .then((badge) => {
          return Prompt.create({
            matchWords: words.join(' '),
            badgeId: badge.id
          })
            .then(() => {
              return words;
            })
        })
        .catch((error) => {
          console.error('Failed to save words to database:',error);
        })
    })
    .catch((error) => {
      console.error('Failed to get words from API', error);
    });
}

module.exports = {
  generateNewPrompt
};
