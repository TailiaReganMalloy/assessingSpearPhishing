const bcrypt = require('bcrypt');

const SALT_ROUNDS = 12;

const hashPassword = (plainText) => bcrypt.hash(plainText, SALT_ROUNDS);
const verifyPassword = (plainText, hash) => bcrypt.compare(plainText, hash);

module.exports = {
  hashPassword,
  verifyPassword
};
