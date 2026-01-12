const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const { ensureAuth } = require('../middleware/auth');

// Middleware to ensure user is authenticated
function ensureAuth(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}

// Routes
router.get('/', ensureAuth, async (req, res) => {
  try {
    const messages = await Message.find({ recipient: req.user._id })
      .populate('sender', 'email')
      .sort({ createdAt: -1 });

    res.render('messages', { messages });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

router.get('/send', ensureAuth, (req, res) => {
  res.render('send_message');
});

router.post('/send', ensureAuth, async (req, res) => {
  try {
    const { recipientEmail, subject, content } = req.body;
    const recipient = await User.findOne({ email: recipientEmail });

    if (!recipient) {
      req.flash('error', 'Recipient not found.');
      return res.redirect('/messages/send');
    }

    const message = new Message({
      sender: req.user._id,
      recipient: recipient._id,
      subject,
      content
    });

    await message.save();
    res.redirect('/messages');
  } catch (err) {
    console.error(err);
    res.redirect('/messages/send');
  }
});

router.get('/:id', ensureAuth, async (req, res) => {
  try {
    const message = await Message.findOne({
      _id: req.params.id,
      recipient: req.user._id
    }).populate('sender', 'email');

    if (!message) {
      return res.redirect('/messages');
    }

    message.isRead = true;
    await message.save();

    res.render('view_message', { message });
  } catch (err) {
    console.error(err);
    res.redirect('/messages');
  }
});

module.exports = router;