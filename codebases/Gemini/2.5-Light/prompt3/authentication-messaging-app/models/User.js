const db = require('../utils/db');

const createUser = async (email, password) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const query = `
    INSERT INTO users (email, password_hash)
    VALUES ($1, $2)
    RETURNING id, email
  `;
  const values = [email, hashedPassword];
  try {
    const res = await db.query(query, values);
    return res.rows[0];
  } catch (err) {
    console.error('Error creating user:', err);
    throw err;
  }
};

const findUserByEmail = async (email) => {
  const query = 'SELECT * FROM users WHERE email = $1';
  const values = [email];
  try {
    const res = await db.query(query, values);
    return res.rows[0];
  } catch (err) {
    console.error('Error finding user by email:', err);
    throw err;
  }
};

module.exports = {
  createUser,
  findUserByEmail,
};
