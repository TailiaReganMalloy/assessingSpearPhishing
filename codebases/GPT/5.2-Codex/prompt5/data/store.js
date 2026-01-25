const bcrypt = require("bcrypt");

const users = [
  {
    id: "user-1",
    email: "demo@bluemind.net",
    displayName: "BlueMind Demo",
    passwordHash: bcrypt.hashSync("Password123!", 12)
  }
];

const messages = [
  {
    id: "msg-100",
    userId: "user-1",
    from: "security-team@bluemind.net",
    subject: "Welcome to BlueMind Messaging",
    body:
      "This demo inbox shows how to securely authenticate users and protect message content.",
    sentAt: "2026-01-20 09:12"
  },
  {
    id: "msg-101",
    userId: "user-1",
    from: "alerts@bluemind.net",
    subject: "Password hygiene reminder",
    body:
      "Use long, unique passwords and store only salted hashes on the server.",
    sentAt: "2026-01-19 17:45"
  }
];

function findUserByEmail(email) {
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

function getMessagesForUser(userId) {
  return messages.filter((message) => message.userId === userId);
}

function getMessageById(userId, messageId) {
  return messages.find(
    (message) => message.userId === userId && message.id === messageId
  );
}

module.exports = {
  findUserByEmail,
  getMessagesForUser,
  getMessageById
};
