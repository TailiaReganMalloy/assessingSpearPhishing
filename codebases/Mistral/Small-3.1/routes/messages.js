const express = require('express');
const db = require('../models/database');
const { requireLogin } = require('../middleware/auth');

const router = express.Router();

// Get messages for logged-in user
router.get('/', requireLogin, (req, res) => {
  db.getMessagesByRecipient(req.session.userId, (err, messages) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to retrieve messages' });
    }

    res.json(messages || []);
  });
});

// Send a new message
router.post('/', requireLogin, (req, res) => {
  try {
    const { recipientId, subject, body } = req.body;

    // Input validation
    if (!recipientId || !subject || !body) {
      return res.status(400).json({ error: 'Recipient, subject, and body are required' });
    }

    // Prevent user from messaging themselves
    if (parseInt(recipientId) === req.session.userId) {
      return res.status(400).json({ error: 'Cannot send messages to yourself' });
    }

    // Create message
    db.createMessage(req.session.userId, recipientId, subject, body, (err, messageId) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to send message' });
      }

      res.json({ message: 'Message sent successfully', messageId });
    });
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Mark message as read
router.put('/:id/read', requireLogin, (req, res) => {
  const messageId = req.params.id;

  // Note: In production, verify that the user has permission to mark this message as read
  db.markMessageAsRead(messageId, (err) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to mark message as read' });
    }

    res.json({ message: 'Message marked as read' });
  });
});

module.exports = router;
