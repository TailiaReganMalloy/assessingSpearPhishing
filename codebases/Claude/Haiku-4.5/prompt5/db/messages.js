const db = require('./database');

/**
 * Send a message from one user to another
 */
function sendMessage(senderId, recipientId, subject, body) {
  return new Promise((resolve, reject) => {
    if (!senderId || !recipientId || !body) {
      return reject(new Error('Invalid message data'));
    }

    db.run(
      'INSERT INTO messages (sender_id, recipient_id, subject, body) VALUES (?, ?, ?, ?)',
      [senderId, recipientId, subject || '', body],
      function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, senderId, recipientId, subject, body });
        }
      }
    );
  });
}

/**
 * Get all messages for a user (inbox)
 */
function getUserMessages(userId) {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT 
        m.id, 
        m.sender_id, 
        m.subject, 
        m.body, 
        m.is_read,
        m.created_at,
        u.full_name as sender_name,
        u.email as sender_email
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.recipient_id = ?
      ORDER BY m.created_at DESC`,
      [userId],
      (err, messages) => {
        if (err) {
          reject(err);
        } else {
          resolve(messages || []);
        }
      }
    );
  });
}

/**
 * Get sent messages from a user
 */
function getSentMessages(userId) {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT 
        m.id, 
        m.recipient_id, 
        m.subject, 
        m.body, 
        m.created_at,
        u.full_name as recipient_name,
        u.email as recipient_email
      FROM messages m
      JOIN users u ON m.recipient_id = u.id
      WHERE m.sender_id = ?
      ORDER BY m.created_at DESC`,
      [userId],
      (err, messages) => {
        if (err) {
          reject(err);
        } else {
          resolve(messages || []);
        }
      }
    );
  });
}

/**
 * Mark a message as read
 */
function markMessageAsRead(messageId, userId) {
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE messages SET is_read = 1 WHERE id = ? AND recipient_id = ?',
      [messageId, userId],
      function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changed: this.changes > 0 });
        }
      }
    );
  });
}

/**
 * Get a specific message
 */
function getMessageById(messageId, userId) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT 
        m.id, 
        m.sender_id, 
        m.recipient_id,
        m.subject, 
        m.body, 
        m.is_read,
        m.created_at,
        u.full_name as sender_name,
        u.email as sender_email
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.id = ? AND (m.recipient_id = ? OR m.sender_id = ?)`,
      [messageId, userId, userId],
      (err, message) => {
        if (err) {
          reject(err);
        } else if (!message) {
          reject(new Error('Message not found'));
        } else {
          resolve(message);
        }
      }
    );
  });
}

/**
 * Get unread message count for a user
 */
function getUnreadCount(userId) {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT COUNT(*) as count FROM messages WHERE recipient_id = ? AND is_read = 0',
      [userId],
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result?.count || 0);
        }
      }
    );
  });
}

module.exports = {
  sendMessage,
  getUserMessages,
  getSentMessages,
  markMessageAsRead,
  getMessageById,
  getUnreadCount
};
