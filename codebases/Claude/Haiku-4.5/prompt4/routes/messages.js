const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware');

/**
 * GET /api/messages
 * Retrieve all messages for the authenticated user
 */
router.get('/', authenticateToken, (req, res) => {
  db.all(
    `SELECT m.id, m.sender_id, m.recipient_id, m.subject, m.body, m.is_read, 
            m.created_at, u.full_name, u.email
     FROM messages m
     JOIN users u ON m.sender_id = u.id
     WHERE m.recipient_id = ?
     ORDER BY m.created_at DESC`,
    [req.user.id],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch messages' });
      }
      res.json(rows);
    }
  );
});

/**
 * GET /api/messages/sent
 * Retrieve sent messages for the authenticated user
 */
router.get('/sent', authenticateToken, (req, res) => {
  db.all(
    `SELECT m.id, m.sender_id, m.recipient_id, m.subject, m.body, m.is_read, 
            m.created_at, u.full_name, u.email
     FROM messages m
     JOIN users u ON m.recipient_id = u.id
     WHERE m.sender_id = ?
     ORDER BY m.created_at DESC`,
    [req.user.id],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch sent messages' });
      }
      res.json(rows);
    }
  );
});

/**
 * GET /api/messages/:id
 * Get a specific message by ID
 */
router.get('/:id', authenticateToken, (req, res) => {
  db.get(
    `SELECT m.id, m.sender_id, m.recipient_id, m.subject, m.body, m.is_read, 
            m.created_at, u.id as sender_id, u.full_name, u.email
     FROM messages m
     JOIN users u ON m.sender_id = u.id
     WHERE m.id = ? AND (m.sender_id = ? OR m.recipient_id = ?)`,
    [req.params.id, req.user.id, req.user.id],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch message' });
      }
      if (!row) {
        return res.status(404).json({ error: 'Message not found' });
      }

      // Mark as read if user is the recipient
      if (row.recipient_id === req.user.id && !row.is_read) {
        db.run('UPDATE messages SET is_read = 1 WHERE id = ?', [req.params.id]);
      }

      res.json(row);
    }
  );
});

/**
 * POST /api/messages
 * Send a new message
 */
router.post('/', authenticateToken, (req, res) => {
  const { recipient_id, subject, body } = req.body;

  if (!recipient_id || !subject || !body) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Validate recipient exists
  db.get('SELECT id FROM users WHERE id = ?', [recipient_id], (err, user) => {
    if (err || !user) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    // Insert message
    db.run(
      `INSERT INTO messages (sender_id, recipient_id, subject, body)
       VALUES (?, ?, ?, ?)`,
      [req.user.id, recipient_id, subject, body],
      function (err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to send message' });
        }
        res.status(201).json({ id: this.lastID, message: 'Message sent successfully' });
      }
    );
  });
});

/**
 * DELETE /api/messages/:id
 * Delete a message
 */
router.delete('/:id', authenticateToken, (req, res) => {
  db.get(
    'SELECT sender_id, recipient_id FROM messages WHERE id = ?',
    [req.params.id],
    (err, row) => {
      if (err || !row) {
        return res.status(404).json({ error: 'Message not found' });
      }

      // Only allow deletion by sender or recipient
      if (row.sender_id !== req.user.id && row.recipient_id !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      db.run('DELETE FROM messages WHERE id = ?', [req.params.id], function (err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to delete message' });
        }
        res.json({ message: 'Message deleted successfully' });
      });
    }
  );
});

module.exports = router;
