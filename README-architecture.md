# Websockets and Round Architecture

[Main README](README.md)

This project uses websockets to coordinate sending prompts, posts, and votes to all clients without the clients having to request updated information from the server constantly. The library used is [Socket.IO](socket.io) - refer to the library documentation for implementation information. This README is written to explain where and how the application interacts with the websockets, how data flows between the client and server, and how the story cycle that forms the core of the app works.

### Server Side

The Express app, the http server, and the websocket server itself are all defined in `/server/socket.js` and exported from there. `/server/index.js` attaches routes to the Express app and starts listening on the http server. The websocket server is imported into `/server/control.js`, which is where most of the websocket and round logic happens.

When a client connects to the server (which actually happens when the user navigates to the page, even before login), the client's socket emits a `connect` event. The server then attaches event handlers for `new text`, `vote`, and `disconnect` to the new socket. This allows the server to appropriately respond to events from the client. The server can also send data to all clients (such as when a new round starts or someone submits a new post) or to one in particular (such as sending the current round information to someone joining late). See "The Round Cycle" section for more information.

### Client Side

On the client side, most of the websocket code is managed in `client/components/SocketContext.jsx`. It is important that each client has exactly one connection open, so the `<SocketProvider/>` component opens the socket and sets up event listeners to catch incoming events from the server. When the server sends data to the client, such as new prompts or posts, the `<SocketProvider/>` component saves that information to state. This data, as well as the socket itself, are made available to child components through React context. Children can render the data as needed, or access the socket to emit events, such as new posts or votes, to the server.

### Stories and Badges

At the beginning of each story, a new row in the badge table is created. Prompts created during that story have a badge id pointing to the badge that was active when they were made. At the end of the story, awards for the three categories should be awarded and recorded in the badge row, but I broke that logic while implementing websockets and as of writing haven't fixed it.* The current status is that badges are useless for their intended purpose, but can be used to find all prompts (and therefore all texts) that were part of a single story, because all the prompts will have the same badge id and all the texts will have one of those prompt ids.

*All of the logic for prompts, posts, awards, etc. used to be on the client side, which, aside from being giving the client too much control, didn't synchronize across clients at all. During Legacy I switched to websockets and moved most of the logic onto the server where it belonged, but haven't fixed the badges yet. The original client-side functions for awarding badges at the end of a story are in `client/badgeHelpers/bestOf.jsx`.

### The Round Cycle

#### 1. The first client joins: `syncJustJoined()` -> `startPromptCycle()`

The server begins a new round in a new story. A new prompt is generated (either from the API or from the cached API data) and saved to the database, and the server sets a timer for the end of the round based on the environment variables. The server sends the prompt and end time to the client.

#### 2. A user submits a response: `handleNewText()`

The new response is saved to the database immediately. Then a response object is added to the `roundData.responses` object, using the database id as a key for easy lookup when voting. The new response object and its id are sent to all clients to display it.

#### 3. A user votes on a response: `handleVote()`

The vote count for the response is updated in memory (vote counts aren't saved to the database until the end of a round), and the server informs all clients of the vote change so they can update their displays.

Votes use a delta to determine how much the vote count should change, because it is more flexible than simply incrementing/decrementing. For example, a user changing from a downvote to an upvote should increase the vote count by 2, not 1. Using a delta makes this easy to handle.

#### 4. The round ends: `endRound()`

If any users submitted responses during the round, the winner is chosen from them, judging by final vote count, with earlier submissions winning in case of ties. The winner and final vote counts are marked in the database, and the winning text is added to the current canon and sent to all users to update the canon  client-side.

If no responses were submitted, the story ends.

Assuming there are still users connected, the next round starts immediately, and the new prompt and timer are sent to all connected clients. See "The last client leaves" for what happens if there are no remaining connections.

#### 5. A story ends: `endStory()`

The current canon is cleared. If awards were functional, they would be awarded here. If a new story will start, the new story's badge is created here.

#### 7. A new round begins: `startRound()`

The server generates a new prompt and timer, saves the prompt, and sends that data to all clients. There is no difference if the story is also new - the logic for creating badges happens either in `startPromptCycle()` (when the first user joins) or in `endStory()` (which also handles resetting the canon). Either way, the canon is already empty.

#### 8. A user joins during a round: `syncJustJoined()` with a round in progress

When new clients join during a round, the server sends them the `roundData` object, which includes the current prompt, canon, responses (with their vote status), and round end time, so the new client can synchronize with everyone else.

#### 9. The last client leaves: `stopPromptCycle()`

The server flips the `stopAfterNext` flag to true. If any client joins before the current prompt ends, the flag will be flipped back to false and everything will continue as if nothing happened. However, if when the current prompt ends the `stopAfterNext` flag is still true, meaning no clients are connected, the story will end (even if responses were submitted this round). No new story/round will begin until a new client connects and restarts the cycle.

[Main README](README.md)