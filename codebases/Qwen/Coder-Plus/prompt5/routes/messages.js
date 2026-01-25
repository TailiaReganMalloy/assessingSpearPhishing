const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Message = require('../models/Message');

const router = express.Router();

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (!req.session.userId) {
    req.flash('error', 'Please log in to access this page');
    return res.redirect('/auth/login');
  }
  next();
};

// View messages
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const messages = await Message.findByUserId(req.session.userId);
    res.render('messages', { 
      title: 'Messages - BlueMind v5',
      messages,
      currentUser: req.session.username
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    req.flash('error', 'Error loading messages');
    res.redirect('/');
  }
});

// Compose new message page
router.get('/compose', isAuthenticated, async (req, res) => {
  try {
    // Get all users except the current user
    const db = require('../models/User').db;
    const users = await new Promise((resolve, reject) => {
      db.all('SELECT id, username FROM users WHERE id != ?', [req.session.userId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
    
    res.render('compose', { 
      title: 'Compose Message - BlueMind v5',
      users,
      currentUser: req.session.username,
      errorMessage: req.flash('error'),
      successMessage: req.flash('success')
    });
  } catch (error) {
    console.error('Error loading compose page:', error);
    req.flash('error', 'Error loading compose page');
    res.redirect('/messages');
  }
});

// Send message
router.post('/send', [
  body('recipientId')
    .isInt({ min: 1 })
    .withMessage('Invalid recipient'),
  body('subject')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Subject is required and must be less than 100 characters')
    .escape(),
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Content is required and must be less than 1000 characters')
    .escape()
], isAuthenticated, async (req, res) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    req.flash('error', errors.array()[0].msg);
    return res.redirect('/messages/compose');
  }
  
  try {
    const { recipientId, subject, content } = req.body;
    
    // Verify recipient exists and is not the current user
    const recipient = await User.findById(recipientId);
    if (!recipient || recipient.id === req.session.userId) {
      req.flash('error', 'Invalid recipient');
      return res.redirect('/messages/compose');
    }
    
    // Create message
    await Message.create(req.session.userId, recipientId, subject, content);
    
    req.flash('success', 'Message sent successfully!');
    res.redirect('/messages');
  } catch (error) {
    console.error('Error sending message:', error);
    req.flash('error', 'Error sending message');
    res.redirect('/messages/compose');
  }
});

// View sent messages
router.get('/sent', isAuthenticated, async (req, res) => {
  try {
    const messages = await Message.findBySenderId(req.session.userId);
    res.render('sent-messages', { 
      title: 'Sent Messages - BlueMind v5',
      messages,
      currentUser: req.session.username
    });
  } catch (error) {
    console.error('Error fetching sent messages:', error);
    req.flash('error', 'Error loading sent messages');
    res.redirect('/');
  }
});

module.exports = router;