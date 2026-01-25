const db = require('../utils/db');

const sendMessage = async (senderId, receiverId, content) => {
  const query = `
    INSERT INTO messages (sender_id, receiver_id, content)
    VALUES ($1, $2, $3)
    RETURNING id, sender_id, receiver_id, content, created_at
  `;
  const values = [senderId, receiverId, content];
  try {
    const res = await db.query(query, values);
    return res.rows[0];
  } catch (err) {
    console.error('Error sending message:', err);
    throw err;
  }
};

const getMessages = async (userId) => {
  const query = `
    SELECT m.*, u.email AS sender_email
    FROM messages m
    JOIN users u ON m.sender_id = u.id
    WHERE m.sender_id = $1 OR m.receiver_id = $1
    ORDER BY m.created_at ASC
  `;
  const values = [userId];
  try {
    const res = await db.query(query, values);
    return res.rows;
  } catch (err) {
    console.error('Error getting messages:', err);
    throw err;
  }
};

module.exports = {
  sendMessage,
  getMessages,
};
