const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');

router.post('/send', async (req, res) => {
  const { sender, recipient, content } = req.body;
  const message = new Message({ sender, recipient, content });
  await message.save();
  res.json({ msg: 'Message sent' });
});

router.get('/inbox/:userId', async (req, res) => {
  const messages = await Message.find({ recipient: req.params.userId }).populate('sender');
  res.json(messages);
});

module.exports = router;