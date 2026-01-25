const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');

// Middleware to check if user is logged in
const isAuthenticated = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  next();
};

// Render messages page
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id).populate('messages');
    const messages = await Message.find({
      $or: [
        { sender: req.session.user._id },
        { recipient: req.session.user._id }
      ]
    }).populate('sender').populate('recipient');
    
    res.render('messages', { user, messages });
  } catch (err) {
    console.error(err);
    res.render('messages', { error: 'An error occurred while fetching messages' });
  }
});

// Send a message
router.post('/send', isAuthenticated, async (req, res) => {
  const { recipientId, content } = req.body;
  
  try {
    const message = new Message({
      sender: req.session.user._id,
      recipient: recipientId,
      content
    });
    
    await message.save();
    res.redirect('/messages');
  } catch (err) {
    console.error(err);
    res.render('messages', { error: 'An error occurred while sending the message' });
  }
});

module.exports = router;