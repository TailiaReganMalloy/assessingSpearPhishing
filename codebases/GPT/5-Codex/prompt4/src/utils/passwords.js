const bcrypt = require('bcryptjs');

const HASH_ROUNDS = 12;

async function hashPassword(plainText) {
  const salt = await bcrypt.genSalt(HASH_ROUNDS);
  return bcrypt.hash(plainText, salt);
}

function verifyPassword(plainText, hash) {
  return bcrypt.compare(plainText, hash);
}

module.exports = {
  hashPassword,
  verifyPassword,
};
