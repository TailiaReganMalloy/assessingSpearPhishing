const fs = require('fs/promises');
const path = require('path');
const { v4: uuid } = require('uuid');

const usersPath = path.join(__dirname, '..', 'data', 'users.json');
const messagesPath = path.join(__dirname, '..', 'data', 'messages.json');

async function readJson(targetPath) {
  const buffer = await fs.readFile(targetPath, 'utf-8');
  return JSON.parse(buffer);
}

async function writeJson(targetPath, payload) {
  await fs.writeFile(targetPath, JSON.stringify(payload, null, 2));
}

async function listUsers() {
  return readJson(usersPath);
}

async function findUserByEmail(email) {
  const users = await listUsers();
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

async function listMessages() {
  return readJson(messagesPath);
}

async function listMessagesForUser(userId) {
  const messages = await listMessages();
  return messages.filter((message) => message.recipientId === userId);
}

async function addMessage({ senderId, recipientId, subject, body }) {
  const messages = await listMessages();
  const trimmedSubject = subject.trim() || 'No subject';
  const trimmedBody = body.trim();
  const newMessage = {
    id: uuid(),
    senderId,
    recipientId,
    subject: trimmedSubject,
    body: trimmedBody,
    sentAt: new Date().toISOString()
  };

  messages.unshift(newMessage);
  await writeJson(messagesPath, messages);
  return newMessage;
}

module.exports = {
  listUsers,
  findUserByEmail,
  listMessagesForUser,
  addMessage
};
