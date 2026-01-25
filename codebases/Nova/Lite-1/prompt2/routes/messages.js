const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// Get messages route
router.get('/', async (req, res) => {
  try {
    const messages = await Message.find().populate('sender', 'username');
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).send('Error fetching messages');
  }
});

// Send message route
router.post('/', async (req, res) => {
  try {
    const { sender, recipient, content } = req.body;
    const message = new Message({ sender, recipient, content });
    await message.save();
    res.status(201).send('Message sent');
  } catch (error) {
    res.status(500).send('Error sending message');
  }
});

module.exports = router;