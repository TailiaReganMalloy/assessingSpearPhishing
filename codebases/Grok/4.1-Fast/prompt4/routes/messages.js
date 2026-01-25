// routes/messages.js - Secure messaging routes (protected by JWT middleware in server.js)
// Demonstrates: SQL injection prevention (parameterized queries), input sanitization, foreign key constraints

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../db');

// GET /api/messages/users - List all users for recipient selection
// SECURITY: Only exposes id/username, no sensitive data
router.get('/users', (req, res) => {
  db.all('SELECT id, username FROM users ORDER BY username', [], (err, users) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to fetch users' });
    }
    res.json(users);
  });
});

// GET /api/messages - Inbox for authenticated user
// SECURITY: Only shows messages TO current user, joins for sender name
router.get('/', (req, res) => {
  const userId = req.user.id;
  db.all(`
    SELECT m.id, m.content, m.created_at, u.username as from_username
    FROM messages m
    JOIN users u ON m.from_id = u.id
    WHERE m.to_id = ?
    ORDER BY m.created_at DESC
  `, [userId], (err, messages) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to fetch messages' });
    }
    res.json(messages);
  });
});

// POST /api/messages - Send message to another user
// SECURITY: Validates recipient exists, sanitizes content, prevents self-messaging?
router.post('/', [
  body('to_id').isInt().toInt(),
  body('content').trim().escape().isLength({ min: 1, max: 1000 }).withMessage('Message 1-1000 chars'),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { to_id, content } = req.body;
  const from_id = req.user.id;

  if (from_id === to_id) {
    return res.status(400).json({ error: 'Cannot send message to yourself' });
  }

  // Verify recipient exists
  db.get('SELECT id FROM users WHERE id = ?', [to_id], (err, recipient) => {
    if (err || !recipient) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    // Insert message with parameterized query (prevents SQL injection)
    db.run(
      'INSERT INTO messages (from_id, to_id, content) VALUES (?, ?, ?)',
      [from_id, to_id, content],
      function (err) {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Failed to send message' });
        }
        res.status(201).json({ message: 'Message sent successfully', id: this.lastID });
      }
    );
  });
});

module.exports = router;
