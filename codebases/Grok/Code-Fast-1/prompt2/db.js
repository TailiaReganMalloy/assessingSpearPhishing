const fs = require('fs');
const path = require('path');

const usersFile = path.join(__dirname, 'users.json');
const messagesFile = path.join(__dirname, 'messages.json');

// Helper to read JSON
function readJSON(file) {
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

// Helper to write JSON
function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// Initialize files if not exist
if (!fs.existsSync(usersFile)) writeJSON(usersFile, []);
if (!fs.existsSync(messagesFile)) writeJSON(messagesFile, []);

// Functions
function insertUser(username, password_hash) {
  const users = readJSON(usersFile);
  const id = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
  users.push({ id, username, password_hash });
  writeJSON(usersFile, users);
}

function getUserByUsername(username) {
  const users = readJSON(usersFile);
  return users.find(u => u.username === username);
}

function insertMessage(from_user, to_user, message) {
  const messages = readJSON(messagesFile);
  const id = messages.length > 0 ? Math.max(...messages.map(m => m.id)) + 1 : 1;
  messages.push({ id, from_user, to_user, message, timestamp: new Date().toISOString() });
  writeJSON(messagesFile, messages);
}

function getMessagesForUser(userId) {
  const messages = readJSON(messagesFile);
  const users = readJSON(usersFile);
  const userMap = {};
  users.forEach(u => userMap[u.id] = u.username);
  return messages.filter(m => m.to_user == userId).map(m => ({
    ...m,
    from_username: userMap[m.from_user]
  })).sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
}

function getAllUsers() {
  return readJSON(usersFile).map(u => ({ id: u.id, username: u.username }));
}

module.exports = {
  insertUser,
  getUserByUsername,
  insertMessage,
  getMessagesForUser,
  getAllUsers
};