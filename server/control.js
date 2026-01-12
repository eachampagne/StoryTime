const axios = require('axios');

const { Prompt, Badges, Text } = require('./database');
const { io } = require('./socket.js');

const getCachedData = require('./data.js');

const useLive = !!parseInt(process.env.USE_LIVE_DATA); // cast to boolean

io.on('connect', (socket) => {
  console.info('user connected');
  syncJustJoined(socket);

  socket.on('disconnect', () => {
    console.info('a user disconnected');
    if (io.engine.clientsCount === 0) {
      stopPromptCycle();
    }
  });

  socket.on('new text', handleNewText);

  socket.on('vote', handleVote);
});

function generateNewPrompt() {
  if (useLive) {
    return axios.get('https://random-word-api.herokuapp.com/word?number=5')
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        console.error('Failed to get words from API', error);
      });
  } else {
    return getCachedData();
  }
}

const roundDuration = parseInt(process.env.MS_BETWEEN_PROMPTS); // TODO: move to env variable?
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
  const numResponses = Object.keys(roundData.responses).length;

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
    )
      .catch((error) => console.error('Failed to mark winner:', error));

    winningText = winningResponse.text;

    // save winner, final votes, number of words matched to DB

    // record final votes
    // I am not 100% certain if trying to do all of these updates concurrently can cause conflicts of some kind
    // doing this at round end means that if the server crashes or is stopped during a round, any votes cast won't be recorded
    // but there wouldn't have been any badges awarded either
    // this saves a bunch of database calls
    // posts on the user page and bookshelf page will display 0 until the round is over and the page is refreshed
    // but it's not like those pages will have every incoming message added immediately anyway
    await Promise.all(
      responsesArray.map(responseObj => {
        return Text.update({
          likes: responseObj.votes
        }, {
          where: {id: responseObj.id}
        });
      })
    )
      .catch((error) => console.error('Failed to record votes:', error));

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

async function endStory() {
  // TODO: award logic here

  roundData.currentCanon = [];

  io.emit('story end');

  if (!stopAfterNext) {
    const newBadge = await Badges.create({})
        .catch((error) => {
          console.error('Failed to create badge:', error)
        })
      badgeId = newBadge.id;
    startRound();
  } else {
    roundEndTimer = null; // clear timer to make it clear no rounds are in progress
  }
}

async function startPromptCycle() {
  console.info('starting a cycle');
  stopAfterNext = false;
  if (roundEndTimer === null) { // check that there's no round in progress before creating the new badge
    // just in case someone disconnects, then reconnects during the same cycle
    const newBadge = await Badges.create({})
      .catch((error) => {
        console.error('Failed to create badge:', error)
      })
    badgeId = newBadge.id;
    startRound(); // don't start a new round while the current one is in progress
  }
}

function stopPromptCycle() {
  console.info('cycle will end');
  stopAfterNext = true;
}

module.exports = {
  generateNewPrompt
};
