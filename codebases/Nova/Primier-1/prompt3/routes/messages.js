const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Send message
router.post('/send', auth, async (req, res) => {
  try {
    const receiver = await User.findById(req.body.receiverId);
    if (!receiver) return res.status(400).send('Receiver not found');

    const message = new Message({
      sender: req.user._id,
      receiver: receiver._id,
      content: req.body.content
    });
    await message.save();
    res.status(201).send(message);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Get conversation
router.get('/:userId', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user._id }
      ]
    })
    .populate('sender receiver', 'username')
    .sort({ createdAt: 1 });

    res.send(messages);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
