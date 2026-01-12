const axios = require('axios');

const { Prompt, Badges, Text } = require('./database');
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
// Note: save to DB functionality now in startRound() rather than generateNewPrompt()
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
  responses: {},
  currentCanon: [],
  endsAt: 0
}
let badgeId;
let promptId;

async function startRound() {
  console.log('starting a new round');
  const words = await generateNewPrompt()
  .catch((error) => {
    console.error('Failed to generate new prompt:', error);
  });
  // save new prompt to DB
  const PromptEntry = await Prompt.create({
    matchWords: words.join(' '),
    badgeId
  });
  promptId = PromptEntry.id;
  roundData.words = words;

  const endsAt = (new Date()).getTime() + roundDuration;
  roundData.endsAt = endsAt;
  roundEndTimer = setTimeout(endRound, roundDuration);
  io.emit('new prompt', {
    words,
    endsAt
  });
}

async function endRound() {
  console.log('ending a round');

  const numResponses = Object.keys(roundData.responses).length;
  console.log(`got ${numResponses} responses`);

  let winningText = '';
  if (numResponses) {
    // find the best response to add to the canon

    // transform responses obj to arr to reuse the logic from client/badgeHelpers/bestOf
    const responsesArray = Object.keys(roundData.responses).map((key) => {
      const responseObj = roundData.responses[key];
      responseObj.id = key;
      return responseObj;
    });
    const winningResponse = responsesArray.reduce((acc, current) => {
      return current.votes > acc.votes ? current : acc; // ties are broken by which comes first in the Object.keys() array
    });

    // mark winning text in DB
    await Text.update(
      { winner: true},
      { where: {id: winningResponse.id} }
    );

    winningText = winningResponse.text;
    console.log(`The winning text was ${winningText}`);

    // save winner, final votes, number of words matched to DB

    roundData.currentCanon.push(winningText);
  }

  // clear roundData
  roundData.words = [];
  roundData.responses = {};

  io.emit('round end', winningText); // TODO: send winner info?
  // it's ok that winningText might be an empty string, because in that case there were no entries
  // so the story is ending anyway

  if (stopAfterNext || (numResponses === 0)) {
    endStory();
  } else {
    startRound();
  }

  // if (!stopAfterNext) {
  //   startRound();
  // } else {
  //   roundEndTimer = null; // clear timer to make it clear no rounds are in progress
  // }
}

async function handleNewText(text, userId, username) {
  console.log(`User ${userId} posted ${text}`);
  // TODO: integrate with database!!

  const newTextEntry = await Text.create({
    text,
    userId,
    promptId
  });

  const responseId = newTextEntry.id;

  const responseObject = {
    text,
    userId,
    username: username, // TODO: possibly need to get username out of database instead of trusting client (and/or use auth somehow); this is fine for now though
    votes: 0
  };
  roundData.responses[responseId] = responseObject;
  // I could broadcast the new post to every client except the posting one,
  // but that would leave that client to add it to the screen itself. It seems
  // easier to treat it as any incoming message from the server rather than adding
  // special logic
  io.emit('new post', responseId, responseObject);
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

// function startStory() {
//   console.log('starting story')

// }

async function endStory() {
  console.log('ending story');
  console.log('Final canon:');
  console.log(roundData.currentCanon);

  // TODO: award logic here

  roundData.currentCanon = [];

  io.emit('story end');

  if (!stopAfterNext) {
    const newBadge = await Badges.create({})
        .catch((error) => {
          console.error('Failed to create badge:', error)
        })
      badgeId = newBadge.id;
      console.log(`new badge id: ${badgeId}`);
    startRound();
  } else {
    roundEndTimer = null; // clear timer to make it clear no rounds are in progress
  }
}

async function startPromptCycle() {
  console.log('starting a cycle');
  stopAfterNext = false;
  if (roundEndTimer === null) { // check that there's no round in progress before creating the new badge
    // just in case someone disconnects, then reconnects during the same cycle
    const newBadge = await Badges.create({})
      .catch((error) => {
        console.error('Failed to create badge:', error)
      })
    badgeId = newBadge.id;
    console.log(`new badge id: ${badgeId}`);
    startRound(); // don't start a new round while the current one is in progress
  }
}

function stopPromptCycle() {
  console.log('cycle will end');
  stopAfterNext = true;
}

module.exports = {
  generateNewPrompt
};
