const express = require('express');
const User = require('../models/User');
const Message = require('../models/Message');

const router = express.Router();

router.post('/send', async (req, res) => {
  const { sender, receiver, message } = req.body;
  const newMessage = new Message({ sender, receiver, message });
  await newMessage.save();
  res.send('Message sent successfully');
});

router.get('/inbox', async (req, res) => {
  const { username } = req.query;
  const messages = await Message.find({ receiver: username });
  res.send(messages);
});

module.exports = router;