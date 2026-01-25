const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const port = process.env.PORT || 3000;

mongoose.connect('mongodb://localhost:27017/bluemind', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

server.listen(port, () => console.log(`Server running on port ${port}`));

app.use(express.json());

io.on('connection', (socket) => {
  socket.on('join', (room) => {
    socket.join(room);
  });

  socket.on('sendMessage', async (data) => {
    const { sender, receiver, message } = data;
    const newMessage = new Message({ sender, receiver, message });
    await newMessage.save();

    socket.broadcast.to(receiver).emit('message', message);
  });
})

// Routes and socket connections will be added here
