const db = require('../db/database');

function createUser({ email, passwordHash, displayName }) {
  const statement = db.prepare(`
    INSERT INTO users (email, password_hash, display_name)
    VALUES (?, ?, ?)
  `);

  const info = statement.run(email.toLowerCase(), passwordHash, displayName.trim());
  return findById(info.lastInsertRowid);
}

function findByEmail(email) {
  return db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(email);
}

function findById(id) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
}

function listOtherUsers(userId) {
  return db.prepare('SELECT id, display_name, email FROM users WHERE id != ? ORDER BY display_name ASC').all(userId);
}

module.exports = {
  createUser,
  findByEmail,
  findById,
  listOtherUsers,
};
