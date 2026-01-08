const { Server } = require('socket.io');
const express = require('express');
const { createServer } = require('http');

const control = require('./control.js');

const app = express();
const server = createServer(app);

const io = new Server(server); // do I want to try connectionStateRecovery?

io.on('connect', (socket) => {
  console.log('user connected');
  control.generateNewPrompt()
    .then((words) => {
      io.emit('new prompt', words);
    })
    .catch((error) => {
      console.error('Failed to generate new prompt:', error);
    });

  socket.on('disconnect', () => {
    console.log('a user disconnected');
  });
});

module.exports = { app, server, io };