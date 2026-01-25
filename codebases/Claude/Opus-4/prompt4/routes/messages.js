const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { db } = require('../database/init');
const { authenticateToken } = require('./auth');

// Apply authentication middleware to all message routes
router.use(authenticateToken);

// Get all messages for the authenticated user (inbox)
router.get('/inbox', (req, res) => {
  const userId = req.user.userId;

  db.all(
    `SELECT m.*, u.email as sender_email 
     FROM messages m 
     JOIN users u ON m.sender_id = u.id 
     WHERE m.recipient_id = ? 
     ORDER BY m.created_at DESC`,
    [userId],
    (err, messages) => {
      if (err) {
        console.error('Error fetching inbox:', err);
        return res.status(500).json({ error: 'Error fetching messages' });
      }

      res.json({ messages });
    }
  );
});

// Get sent messages
router.get('/sent', (req, res) => {
  const userId = req.user.userId;

  db.all(
    `SELECT m.*, u.email as recipient_email 
     FROM messages m 
     JOIN users u ON m.recipient_id = u.id 
     WHERE m.sender_id = ? 
     ORDER BY m.created_at DESC`,
    [userId],
    (err, messages) => {
      if (err) {
        console.error('Error fetching sent messages:', err);
        return res.status(500).json({ error: 'Error fetching messages' });
      }

      res.json({ messages });
    }
  );
});

// Get a specific message
router.get('/:id', (req, res) => {
  const messageId = req.params.id;
  const userId = req.user.userId;

  db.get(
    `SELECT m.*, 
            sender.email as sender_email,
            recipient.email as recipient_email
     FROM messages m 
     JOIN users sender ON m.sender_id = sender.id
     JOIN users recipient ON m.recipient_id = recipient.id
     WHERE m.id = ? AND (m.sender_id = ? OR m.recipient_id = ?)`,
    [messageId, userId, userId],
    (err, message) => {
      if (err) {
        console.error('Error fetching message:', err);
        return res.status(500).json({ error: 'Error fetching message' });
      }

      if (!message) {
        return res.status(404).json({ error: 'Message not found' });
      }

      // Mark as read if recipient is viewing
      if (message.recipient_id === userId && !message.read_at) {
        db.run(
          "UPDATE messages SET read_at = CURRENT_TIMESTAMP WHERE id = ?",
          [messageId],
          (err) => {
            if (err) console.error('Error marking message as read:', err);
          }
        );
      }

      res.json({ message });
    }
  );
});

// Send a new message
router.post('/send', [
  body('recipient_email').isEmail().normalizeEmail(),
  body('subject').notEmpty().trim().isLength({ max: 200 }),
  body('content').notEmpty().trim().isLength({ max: 5000 })
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const senderId = req.user.userId;
  const { recipient_email, subject, content } = req.body;

  // Prevent self-messaging
  if (recipient_email === req.user.email) {
    return res.status(400).json({ error: 'Cannot send message to yourself' });
  }

  // Find recipient
  db.get(
    "SELECT id FROM users WHERE email = ?",
    [recipient_email],
    (err, recipient) => {
      if (err) {
        console.error('Error finding recipient:', err);
        return res.status(500).json({ error: 'Error sending message' });
      }

      if (!recipient) {
        return res.status(404).json({ error: 'Recipient not found' });
      }

      // Insert message
      db.run(
        "INSERT INTO messages (sender_id, recipient_id, subject, content) VALUES (?, ?, ?, ?)",
        [senderId, recipient.id, subject, content],
        function(err) {
          if (err) {
            console.error('Error inserting message:', err);
            return res.status(500).json({ error: 'Error sending message' });
          }

          res.status(201).json({ 
            success: true, 
            messageId: this.lastID,
            message: 'Message sent successfully' 
          });
        }
      );
    }
  );
});

// Get unread message count
router.get('/unread/count', (req, res) => {
  const userId = req.user.userId;

  db.get(
    "SELECT COUNT(*) as count FROM messages WHERE recipient_id = ? AND read_at IS NULL",
    [userId],
    (err, result) => {
      if (err) {
        console.error('Error counting unread messages:', err);
        return res.status(500).json({ error: 'Error counting messages' });
      }

      res.json({ unreadCount: result.count });
    }
  );
});

// Get all users (for recipient selection)
router.get('/users/all', (req, res) => {
  const userId = req.user.userId;

  db.all(
    "SELECT id, email FROM users WHERE id != ? ORDER BY email",
    [userId],
    (err, users) => {
      if (err) {
        console.error('Error fetching users:', err);
        return res.status(500).json({ error: 'Error fetching users' });
      }

      res.json({ users });
    }
  );
});

module.exports = router;