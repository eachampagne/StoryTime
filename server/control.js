const axios = require('axios');

const { Prompt, Badges } = require('./database');
const { io } = require('./socket.js');

io.on('connect', (socket) => {
  console.log('user connected');
  syncJustJoined(socket);

  socket.on('disconnect', () => {
    console.log('a user disconnected');
    if (io.engine.clientsCount === 0) {
      stopPromptCycle();
    }
  });

  socket.on('new text', handleNewText);
});

const dummyData = [
  ['this', 'is', 'a', 'test', 'array'],
  ['this', 'is', 'test', 'array', '2'],
  ['this', 'is', 'test', 'array', '3'],
  ['this', 'is', 'test', 'array', '4'],
  ['this', 'is', 'test', 'array', '5']
];
let dummyCounter = 0;

// TODO: have way to select from vetted prompts
function generateNewPrompt() {
  // return axios.get('https://random-word-api.herokuapp.com/word?number=5')
  //   .then((response) => {
  //     const words = response.data;
  //     // save words to DB
  //     return Badges.findOne({order: [['id', 'DESC']]})
  //       .then((badge) => {
  //         return Prompt.create({
  //           matchWords: words.join(' '),
  //           badgeId: badge.id
  //         })
  //           .then(() => {
  //             return words;
  //           })
  //       })
  //       .catch((error) => {
  //         console.error('Failed to save words to database:',error);
  //       })
  //   })
  //   .catch((error) => {
  //     console.error('Failed to get words from API', error);
  //   });
  dummyCounter++;
  return new Promise((resolve, reject) => resolve(dummyData[dummyCounter % dummyData.length]));
}

const roundDuration = 20000; // TODO: move to env variable?
let roundEndTimer = null;
let stopAfterNext = false;
let roundData = {
  words: []
}

function startRound() {
  console.log('starting a new round');
  generateNewPrompt()
    .then((words) => {
      roundData.words = words;
      io.emit('new prompt', {
        words
      });
      roundEndTimer = setTimeout(endRound, roundDuration);
    })
    .catch((error) => {
      console.error('Failed to generate new prompt:', error);
    });
}

function endRound() {
  console.log('ending a round');
  io.emit('round end', {}); // TODO: send winner info?
  if (!stopAfterNext) {
    startRound();
  } else {
    roundEndTimer = null; // clear timer to make it clear no rounds are in progress
  }
}

function handleNewText(text, userId) {
  console.log(`User ${userId} posted ${text}`);
}

function handleVote() {

}

function syncJustJoined(socket) {
  if (roundEndTimer) { // there's a round in progress
    socket.emit("sync prompt", roundData); // todo: also include current texts and upvotes, remaining time
  }
  startPromptCycle();
}

function startPromptCycle() {
  console.log('starting a cycle');
  stopAfterNext = false;
  if (!roundEndTimer) { // don't start a new round while the current one is in progress
    startRound();
  }
}

function stopPromptCycle() {
  console.log('ending a cycle');
  stopAfterNext = true;
}

module.exports = {
  generateNewPrompt
};
