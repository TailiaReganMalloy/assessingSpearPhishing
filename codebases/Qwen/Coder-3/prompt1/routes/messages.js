const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Message = require('../models/Message');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

// Apply authentication middleware to all routes in this file
router.use(requireAuth);

// Render messages page
router.get('/', (req, res) => {
  const currentUser = User.findById(req.session.userId);
  if (!currentUser) {
    return res.redirect('/auth/login');
  }

  // Get messages for the current user
  const messages = Message.findMessagesForUser(currentUser.id);
  
  // Get all users except the current user for the send message form
  const users = User.findAll().filter(user => user.id !== currentUser.id);

  res.render('messages', { 
    currentUser,
    messages,
    users,
    User // Pass the User model to the template
  });
});

// Handle sending a new message
router.post('/send', [
  body('toUserId').notEmpty().withMessage('Recipient is required'),
  body('content').notEmpty().withMessage('Message content is required')
], (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const currentUser = User.findById(req.session.userId);
    const messages = Message.findMessagesForUser(currentUser.id);
    const users = User.findAll().filter(user => user.id !== currentUser.id);
    
    return res.render('messages', {
      errors: errors.array(),
      currentUser,
      messages,
      users
    });
  }

  const { toUserId, content } = req.body;
  const fromUserId = req.session.userId;

  // Create and save new message
  const newMessage = new Message(fromUserId, toUserId, content);
  newMessage.save();

  // Redirect to messages page
  res.redirect('/messages');
});

module.exports = router;