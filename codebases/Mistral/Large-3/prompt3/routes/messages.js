const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Message = require('../models/Message');
const User = require('../models/User');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

// Authentication middleware
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect('/');
  }
  next();
};

// Inbox
router.get('/', requireAuth, async (req, res) => {
  try {
    const messages = await Message.find({ recipient: req.session.userId })
      .populate('sender', 'email')
      .sort({ createdAt: -1 });
    
    res.render('inbox', {
      messages,
      email: req.session.email
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Server error' });
  }
});

// View message
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const message = await Message.findOne({
      _id: req.params.id,
      recipient: req.session.userId
    }).populate('sender', 'email');
    
    if (!message) {
      return res.status(404).render('error', { message: 'Message not found' });
    }
    
    // Mark as read
    if (!message.isRead) {
      message.isRead = true;
      await message.save();
    }
    
    res.render('message', {
      message,
      email: req.session.email
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Server error' });
  }
});

// Compose message
router.get('/compose', requireAuth, csrfProtection, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.session.userId } }, 'email');
    res.render('compose', {
      csrfToken: req.csrfToken(),
      users,
      errors: null,
      formData: {},
      reply: req.query.reply
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Server error' });
  }
});

// Send message
router.post('/send', requireAuth, csrfProtection, [
  check('recipient').not().isEmpty().withMessage('Recipient is required'),
  check('subject').not().isEmpty().withMessage('Subject is required'),
  check('content').not().isEmpty().withMessage('Content is required')
], async (req, res) => {
  const errors = validationResult(req);
  
  try {
    const users = await User.find({ _id: { $ne: req.session.userId } }, 'email');
    
    if (!errors.isEmpty()) {
      return res.render('compose', {
        csrfToken: req.csrfToken(),
        users,
        errors: errors.array(),
        formData: req.body
      });
    }
    
    const { recipient, subject, content } = req.body;
    
    // Find recipient
    const recipientUser = await User.findOne({ email: recipient });
    if (!recipientUser) {
      return res.render('compose', {
        csrfToken: req.csrfToken(),
        users,
        errors: [{ msg: 'Recipient not found' }],
        formData: req.body
      });
    }
    
    // Create message
    const message = new Message({
      sender: req.session.userId,
      recipient: recipientUser._id,
      subject,
      content
    });
    
    await message.save();
    
    res.redirect('/messages');
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Server error' });
  }
});

module.exports = router;