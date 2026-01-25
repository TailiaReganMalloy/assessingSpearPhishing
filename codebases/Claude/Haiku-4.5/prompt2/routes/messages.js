const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../db/database');

const router = express.Router();

// Middleware to ensure user is authenticated
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
};

// Send a message
router.post('/send', requireAuth, [
  body('recipient_id').isInt().withMessage('Invalid recipient'),
  body('subject').trim().optional(),
  body('content').trim().notEmpty().withMessage('Message cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { recipient_id, subject, content } = req.body;
    const sender_id = req.session.userId;

    // Verify recipient exists and is not the sender
    if (sender_id === recipient_id) {
      return res.status(400).json({ error: 'Cannot send message to yourself' });
    }

    const recipient = await db.get(
      'SELECT id FROM users WHERE id = ?',
      [recipient_id]
    );

    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    // Insert message
    await db.run(
      'INSERT INTO messages (sender_id, recipient_id, subject, content) VALUES (?, ?, ?, ?)',
      [sender_id, recipient_id, subject || 'No subject', content]
    );

    res.status(201).json({ 
      success: true,
      message: 'Message sent successfully' 
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get received messages
router.get('/inbox', requireAuth, (req, res) => {
  const recipient_id = req.session.userId;
  const limit = req.query.limit || 50;
  const offset = req.query.offset || 0;

  db.all(
    `SELECT 
      m.id,
      m.sender_id,
      m.subject,
      m.content,
      m.created_at,
      m.read_at,
      u.email,
      u.full_name
    FROM messages m
    JOIN users u ON m.sender_id = u.id
    WHERE m.recipient_id = ?
    ORDER BY m.created_at DESC
    LIMIT ? OFFSET ?`,
    [recipient_id, parseInt(limit), parseInt(offset)],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch messages' });
      }
      res.json(rows);
    }
  );
});

// Get sent messages
router.get('/sent', requireAuth, (req, res) => {
  const sender_id = req.session.userId;
  const limit = req.query.limit || 50;
  const offset = req.query.offset || 0;

  db.all(
    `SELECT 
      m.id,
      m.recipient_id,
      m.subject,
      m.content,
      m.created_at,
      u.email,
      u.full_name
    FROM messages m
    JOIN users u ON m.recipient_id = u.id
    WHERE m.sender_id = ?
    ORDER BY m.created_at DESC
    LIMIT ? OFFSET ?`,
    [sender_id, parseInt(limit), parseInt(offset)],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch messages' });
      }
      res.json(rows);
    }
  );
});

// Get single message
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const messageId = req.params.id;
    const userId = req.session.userId;

    const message = await db.get(
      `SELECT 
        m.id,
        m.sender_id,
        m.recipient_id,
        m.subject,
        m.content,
        m.created_at,
        m.read_at,
        u.email,
        u.full_name
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.id = ? AND (m.recipient_id = ? OR m.sender_id = ?)`,
      [messageId, userId, userId]
    );

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Mark as read if recipient is viewing
    if (message.recipient_id === userId && !message.read_at) {
      await db.run(
        'UPDATE messages SET read_at = CURRENT_TIMESTAMP WHERE id = ?',
        [messageId]
      );
      message.read_at = new Date().toISOString();
    }

    res.json(message);
  } catch (error) {
    console.error('Get message error:', error);
    res.status(500).json({ error: 'Failed to fetch message' });
  }
});

// Get unread message count
router.get('/count/unread', requireAuth, (req, res) => {
  const recipient_id = req.session.userId;

  db.get(
    'SELECT COUNT(*) as count FROM messages WHERE recipient_id = ? AND read_at IS NULL',
    [recipient_id],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch count' });
      }
      res.json({ unread_count: row.count });
    }
  );
});

// Delete a message
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const messageId = req.params.id;
    const userId = req.session.userId;

    const message = await db.get(
      'SELECT sender_id, recipient_id FROM messages WHERE id = ?',
      [messageId]
    );

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Only sender or recipient can delete
    if (message.sender_id !== userId && message.recipient_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await db.run('DELETE FROM messages WHERE id = ?', [messageId]);

    res.json({ success: true, message: 'Message deleted' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

module.exports = router;
