const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');

// Middleware to ensure user is authenticated
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}

// Display messages
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const messages = await Message.find({ 
      $or: [{ sender: req.user._id }, { recipient: req.user._id }]
    })
    .populate('sender')
    .populate('recipient');
    const users = await User.find({ _id: { $ne: req.user._id } });
    res.render('messages', { messages, users, currentUser: req.user });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

// Send message
router.post('/send', isAuthenticated, async (req, res) => {
  try {
    const { recipient, content } = req.body;
    const newMessage = new Message({
      sender: req.user._id,
      recipient,
      content
    });
    await newMessage.save();
    res.redirect('/messages');
  } catch (err) {
    console.error(err);
    res.redirect('/messages');
  }
});

module.exports = router;