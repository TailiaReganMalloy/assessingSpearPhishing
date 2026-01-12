const express = require('express');
const db = require('../db');
const router = express.Router();

/**
 * Middleware to check if user is authenticated
 */
function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ 
      error: 'Authentication required' 
    });
  }
  next();
}

/**
 * POST /api/messages/send
 * Send a message from authenticated user to recipient
 */
router.post('/send', requireAuth, async (req, res) => {
  try {
    const { recipientEmail, subject, body } = req.body;
    const senderId = req.session.userId;

    // Validation
    if (!recipientEmail || !subject || !body) {
      return res.status(400).json({ 
        error: 'Recipient email, subject, and body are required' 
      });
    }

    // Find recipient by email
    const recipient = await db.get(
      'SELECT id FROM users WHERE email = ?',
      [recipientEmail]
    );

    if (!recipient) {
      return res.status(404).json({ 
        error: 'Recipient not found' 
      });
    }

    if (recipient.id === senderId) {
      return res.status(400).json({ 
        error: 'Cannot send message to yourself' 
      });
    }

    // Insert message
    const result = await db.run(
      `INSERT INTO messages (sender_id, recipient_id, subject, body, is_read) 
       VALUES (?, ?, ?, ?, 0)`,
      [senderId, recipient.id, subject, body]
    );

    return res.status(201).json({
      message: 'Message sent successfully',
      messageId: result.lastID
    });

  } catch (err) {
    console.error('Send message error:', err);
    return res.status(500).json({ 
      error: 'Server error sending message' 
    });
  }
});

/**
 * GET /api/messages/inbox
 * Get all unread messages for authenticated user
 */
router.get('/inbox', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;

    // Fetch unread messages with sender information
    const messages = await db.all(
      `SELECT m.id, m.subject, m.body, m.created_at, u.email as sender_email
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.recipient_id = ? AND m.is_read = 0
       ORDER BY m.created_at DESC`,
      [userId]
    );

    return res.json({
      messages: messages,
      count: messages.length
    });

  } catch (err) {
    console.error('Get inbox error:', err);
    return res.status(500).json({ 
      error: 'Server error fetching messages' 
    });
  }
});

/**
 * GET /api/messages/all
 * Get all messages (read and unread) for authenticated user
 */
router.get('/all', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;

    const messages = await db.all(
      `SELECT m.id, m.subject, m.body, m.created_at, m.is_read, 
              u.email as sender_email
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.recipient_id = ?
       ORDER BY m.created_at DESC`,
      [userId]
    );

    return res.json({
      messages: messages,
      count: messages.length
    });

  } catch (err) {
    console.error('Get all messages error:', err);
    return res.status(500).json({ 
      error: 'Server error fetching messages' 
    });
  }
});

/**
 * PUT /api/messages/:messageId/read
 * Mark a message as read
 */
router.put('/:messageId/read', requireAuth, async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.session.userId;

    // Verify the message belongs to the user
    const message = await db.get(
      'SELECT id FROM messages WHERE id = ? AND recipient_id = ?',
      [messageId, userId]
    );

    if (!message) {
      return res.status(404).json({ 
        error: 'Message not found' 
      });
    }

    // Mark as read
    await db.run(
      'UPDATE messages SET is_read = 1 WHERE id = ?',
      [messageId]
    );

    return res.json({
      message: 'Message marked as read'
    });

  } catch (err) {
    console.error('Mark read error:', err);
    return res.status(500).json({ 
      error: 'Server error updating message' 
    });
  }
});

/**
 * DELETE /api/messages/:messageId
 * Delete a message
 */
router.delete('/:messageId', requireAuth, async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.session.userId;

    // Verify the message belongs to the user (either sender or recipient)
    const message = await db.get(
      `SELECT id FROM messages 
       WHERE id = ? AND (recipient_id = ? OR sender_id = ?)`,
      [messageId, userId, userId]
    );

    if (!message) {
      return res.status(404).json({ 
        error: 'Message not found' 
      });
    }

    // Delete the message
    await db.run(
      'DELETE FROM messages WHERE id = ?',
      [messageId]
    );

    return res.json({
      message: 'Message deleted successfully'
    });

  } catch (err) {
    console.error('Delete message error:', err);
    return res.status(500).json({ 
      error: 'Server error deleting message' 
    });
  }
});

/**
 * GET /api/messages/users/all
 * Get list of all users (for recipient selection)
 */
router.get('/users/all', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;

    const users = await db.all(
      'SELECT id, email FROM users WHERE id != ? ORDER BY email',
      [userId]
    );

    return res.json({ users });

  } catch (err) {
    console.error('Get users error:', err);
    return res.status(500).json({ 
      error: 'Server error fetching users' 
    });
  }
});

module.exports = router;
