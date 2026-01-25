const bcrypt = require('bcrypt');
const { getUserByEmail } = require('./dataStore');

async function verifyUserCredentials(email, password) {
  const user = getUserByEmail(email);
  if (!user) return null;

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) return null;

  return {
    id: user.id,
    displayName: user.displayName,
    email: user.email,
    role: user.role,
    avatarColor: user.avatarColor
  };
}

module.exports = {
  verifyUserCredentials
};
