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

  socket.on('vote', handleVote);
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
  words: [],
  responses: {}
}
let responseIdCounter = 1; // TODO: replace with id when adding response to DB!!

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

  // clear roundData
  roundData.words = [];
  roundData.responses = {};

  io.emit('round end', {}); // TODO: send winner info?
  if (!stopAfterNext) {
    startRound();
  } else {
    roundEndTimer = null; // clear timer to make it clear no rounds are in progress
  }
}

function handleNewText(text, userId, username) {
  console.log(`User ${userId} posted ${text}`);
  // TODO: integrate with database!!

  const responseObject = {
    text,
    userId,
    username: username, // TODO: possibly need to get username out of database instead of trusting client (and/or use auth somehow); this is fine for now though
    votes: 0
  };
  roundData.responses[responseIdCounter] = responseObject;
  // I could broadcast the new post to every client except the posting one,
  // but that would leave that client to add it to the screen itself. It seems
  // easier to treat it as any incoming message from the server rather than adding
  // special logic
  io.emit('new post', responseIdCounter, responseObject);

  responseIdCounter++; // replace with DB id!
}

function handleVote(postId, delta) {
  roundData.responses[postId].votes += delta;
  io.emit('vote', postId, delta);
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
