const db = require('../db/database');

function createMessage({ senderId, recipientId, subject, body }) {
  const statement = db.prepare(`
    INSERT INTO messages (sender_id, recipient_id, subject, body)
    VALUES (?, ?, ?, ?)
  `);

  return statement.run(senderId, recipientId, subject.trim(), body.trim());
}

function getInbox(userId) {
  return db
    .prepare(
      `SELECT m.id, m.subject, m.body, m.created_at, u.display_name AS sender_name, u.email AS sender_email
       FROM messages m
       INNER JOIN users u ON u.id = m.sender_id
       WHERE m.recipient_id = ?
       ORDER BY m.created_at DESC`
    )
    .all(userId);
}

function getSent(userId) {
  return db
    .prepare(
      `SELECT m.id, m.subject, m.body, m.created_at, u.display_name AS recipient_name, u.email AS recipient_email
       FROM messages m
       INNER JOIN users u ON u.id = m.recipient_id
       WHERE m.sender_id = ?
       ORDER BY m.created_at DESC`
    )
    .all(userId);
}

module.exports = {
  createMessage,
  getInbox,
  getSent,
};
