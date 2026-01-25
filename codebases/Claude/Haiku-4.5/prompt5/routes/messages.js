const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const messages = require('../db/messages');
const auth = require('../db/auth');
const { isAuthenticated } = require('./auth');

// GET /messages - View inbox
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;
    const userMessages = await messages.getUserMessages(userId);
    const unreadCount = await messages.getUnreadCount(userId);
    
    res.render('messages', {
      messages: userMessages,
      unreadCount,
      userName: req.session.userName
    });
  } catch (error) {
    res.status(500).send('Error loading messages: ' + error.message);
  }
});

// GET /messages/sent - View sent messages
router.get('/sent', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;
    const sentMessages = await messages.getSentMessages(userId);
    const unreadCount = await messages.getUnreadCount(userId);
    
    res.render('sent', {
      messages: sentMessages,
      unreadCount,
      userName: req.session.userName
    });
  } catch (error) {
    res.status(500).send('Error loading sent messages: ' + error.message);
  }
});

// GET /messages/compose - Show compose page
router.get('/compose', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;
    const users = await auth.getAllUsers();
    // Filter out the current user
    const recipients = users.filter(u => u.id !== userId);
    const unreadCount = await messages.getUnreadCount(userId);
    
    res.render('compose', {
      recipients,
      unreadCount,
      userName: req.session.userName
    });
  } catch (error) {
    res.status(500).send('Error loading compose page: ' + error.message);
  }
});

// POST /messages/send - Send a message
router.post(
  '/send',
  isAuthenticated,
  body('recipientId').isInt(),
  body('subject').optional().trim(),
  body('body').notEmpty().trim(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid message data' });
    }

    try {
      const senderId = req.session.userId;
      const { recipientId, subject, body } = req.body;

      // Verify recipient exists
      const recipient = await auth.getUserById(recipientId);
      if (!recipient) {
        return res.status(404).json({ error: 'Recipient not found' });
      }

      // Send message
      const message = await messages.sendMessage(senderId, recipientId, subject, body);
      res.json({ success: true, messageId: message.id });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// GET /messages/:id - View specific message
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const messageId = req.params.id;
    const userId = req.session.userId;

    const message = await messages.getMessageById(messageId, userId);
    
    // Mark as read if recipient
    if (message.recipient_id === userId) {
      await messages.markMessageAsRead(messageId, userId);
    }

    const unreadCount = await messages.getUnreadCount(userId);

    res.render('message-detail', {
      message,
      unreadCount,
      userName: req.session.userName
    });
  } catch (error) {
    res.status(404).send('Message not found');
  }
});

module.exports = router;
