const express = require('express');
const Message = require('../models/Message');

const router = express.Router();

// Send a new message
router.post('/', async (req, res) => {
  try {
    const { sender, recipient, content } = req.body;
    const message = new Message({ sender, recipient, content });
    await message.save();
    res.status(201).send('Message sent successfully');
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Get messages for a user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const messages = await Message.find({ recipient: userId });
    res.status(200).json(messages);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

module.exports = router;