const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const { ensureAuthenticated } = require('../middleware/auth');

// Send Message
router.post('/send', ensureAuthenticated, async (req, res) => {
  try {
    const { receiverEmail, content } = req.body;
    const receiver = await User.findOne({ email: receiverEmail });
    if (!receiver) return res.status(404).send('Receiver not found');

    const message = new Message({
      sender: req.user._id,
      receiver: receiver._id,
      content,
    });
    await message.save();
    res.redirect('/messages');
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// View Messages
router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    const messages = await Message.find({
      receiver: req.user._id,
    }).populate('sender', 'email');
    res.render('messages', { messages });
  } catch (error) {
    res.status(500).send('Server error');
  }
});

module.exports = router;