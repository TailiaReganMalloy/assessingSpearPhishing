const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');

const router = express.Router();

// Messages dashboard
router.get('/', (req, res) => {
  db.getMessagesForUser(req.session.user.id, (err, messages) => {
    if (err) {
      console.error('Error fetching messages:', err);
      req.flash('error', 'Failed to load messages.');
      return res.redirect('/');
    }

    res.render('messages', { 
      title: 'BlueMind v5 - Messages',
      messages: messages || []
    });
  });
});

// Compose message page
router.get('/compose', (req, res) => {
  db.getAllUsers((err, users) => {
    if (err) {
      console.error('Error fetching users:', err);
      req.flash('error', 'Failed to load users.');
      return res.redirect('/messages');
    }

    // Filter out current user
    const recipients = users.filter(user => user.id !== req.session.user.id);
    
    res.render('compose', { 
      title: 'BlueMind v5 - Compose Message',
      recipients: recipients
    });
  });
});

// Message validation
const messageValidation = [
  body('recipient_id')
    .isInt({ min: 1 })
    .withMessage('Please select a valid recipient'),
  body('subject')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Subject is required and must be less than 200 characters'),
  body('content')
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Message content is required and must be less than 5000 characters')
];

// Send message
router.post('/send', messageValidation, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('error', errors.array()[0].msg);
    return res.redirect('/messages/compose');
  }

  const { recipient_id, subject, content } = req.body;

  db.sendMessage(req.session.user.id, recipient_id, subject, content, function(err) {
    if (err) {
      console.error('Error sending message:', err);
      req.flash('error', 'Failed to send message.');
      return res.redirect('/messages/compose');
    }

    req.flash('success', 'Message sent successfully!');
    res.redirect('/messages');
  });
});

// Mark message as read
router.post('/:id/read', (req, res) => {
  const messageId = parseInt(req.params.id);
  
  db.markMessageAsRead(messageId, req.session.user.id, (err) => {
    if (err) {
      console.error('Error marking message as read:', err);
    }
    res.redirect('/messages');
  });
});

// View single message
router.get('/:id', (req, res) => {
  const messageId = parseInt(req.params.id);
  
  db.getMessagesForUser(req.session.user.id, (err, messages) => {
    if (err) {
      console.error('Error fetching message:', err);
      req.flash('error', 'Failed to load message.');
      return res.redirect('/messages');
    }

    const message = messages.find(m => m.id === messageId);
    
    if (!message) {
      req.flash('error', 'Message not found.');
      return res.redirect('/messages');
    }

    // Check if user is authorized to view this message
    if (message.sender_id !== req.session.user.id && message.recipient_id !== req.session.user.id) {
      req.flash('error', 'You are not authorized to view this message.');
      return res.redirect('/messages');
    }

    // Mark as read if it's the recipient viewing
    if (message.recipient_id === req.session.user.id && !message.read_at) {
      db.markMessageAsRead(messageId, req.session.user.id, () => {});
      message.read_at = new Date().toISOString();
    }

    res.render('message-detail', {
      title: `BlueMind v5 - ${message.subject}`,
      message: message
    });
  });
});

module.exports = router;