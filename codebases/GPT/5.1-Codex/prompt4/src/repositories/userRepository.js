const { get, all, run } = require('../database');

const findByEmail = (email) =>
  get('SELECT * FROM users WHERE email = ? LIMIT 1', [email.toLowerCase()]);

const findById = (id) => get('SELECT * FROM users WHERE id = ?', [id]);

const listPeers = (excludeUserId) =>
  all('SELECT id, display_name, email FROM users WHERE id != ? ORDER BY display_name', [excludeUserId]);

const createUser = async ({ email, displayName, passwordHash }) => {
  const normalizedEmail = email.toLowerCase();
  await run(
    'INSERT INTO users (email, display_name, password_hash) VALUES (?, ?, ?)',
    [normalizedEmail, displayName, passwordHash]
  );
  return findByEmail(normalizedEmail);
};

module.exports = {
  findByEmail,
  findById,
  listPeers,
  createUser
};
