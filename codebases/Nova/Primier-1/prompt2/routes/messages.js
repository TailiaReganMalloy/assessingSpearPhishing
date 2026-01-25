const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// Send message
router.post('/send', auth, async (req, res) => {
  try {
    const { recipientId, content } = req.body;
    const sender = await User.findById(req.user.id);
    const recipient = await User.findById(recipientId);

    if (!recipient) return res.status(400).json({ msg: 'User not found' });

    // Add to sender's messages
    sender.messages.push({ sender: 'me', content, timestamp: new Date() });
    await sender.save();

    // Add to recipient's messages
    recipient.messages.push({ sender: sender.username, content, timestamp: new Date() });
    await recipient.save();

    res.json({ msg: 'Message sent' });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Get user messages
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('messages');
    res.json(user.messages);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;