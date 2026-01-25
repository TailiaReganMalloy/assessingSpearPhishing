const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');

function readJson(fileName) {
  const filePath = path.join(DATA_DIR, fileName);
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

const users = readJson('users.json');
const messages = readJson('messages.json');

function getUserByEmail(email) {
  if (!email) return undefined;
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

function getUserById(userId) {
  return users.find((user) => user.id === userId);
}

function getMessagesForRecipient(recipientId) {
  return messages
    .filter((message) => message.recipientId === recipientId)
    .sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt))
    .map((message) => ({
      ...message,
      sender: getUserById(message.senderId)
    }));
}

function getMessageForRecipient(recipientId, messageId) {
  const message = messages.find((msg) => msg.id === messageId && msg.recipientId === recipientId);
  if (!message) return undefined;
  return {
    ...message,
    sender: getUserById(message.senderId)
  };
}

module.exports = {
  getUserByEmail,
  getUserById,
  getMessagesForRecipient,
  getMessageForRecipient
};
