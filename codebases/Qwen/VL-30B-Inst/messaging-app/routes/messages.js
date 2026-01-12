const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const authenticateToken = require('../middleware/authenticateToken');

// Get messages for current user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const messages = await Message.find({ recipientId: req.user.userId });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching messages' });
  }
});

// Send message
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { recipientId, content } = req.body;
    const message = new Message({
      senderId: req.user.userId,
      recipientId,
      content
    });
    await message.save();
    res.status(201).json({ message: 'Message sent successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error sending message' });
  }
});

module.exports = router;