const { all, run } = require('../database');

const listInbox = (userId) =>
  all(
    `SELECT messages.id, messages.body, messages.created_at, sender.display_name AS sender_name
     FROM messages
     JOIN users AS sender ON sender.id = messages.sender_id
     WHERE messages.recipient_id = ?
     ORDER BY messages.created_at DESC`,
    [userId]
  );

const createMessage = ({ senderId, recipientId, body }) =>
  run(
    'INSERT INTO messages (sender_id, recipient_id, body) VALUES (?, ?, ?)',
    [senderId, recipientId, body.trim()]
  );

module.exports = {
  listInbox,
  createMessage
};
