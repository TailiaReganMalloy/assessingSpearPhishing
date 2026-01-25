const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

const dataDir = path.join(__dirname, 'data');
const jsonPath = path.join(dataDir, 'db.json');

function readDb() {
  const raw = fs.readFileSync(jsonPath, 'utf8');
  return JSON.parse(raw);
}

function writeDb(obj) {
  fs.writeFileSync(jsonPath, JSON.stringify(obj, null, 2));
}

function initDb() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(jsonPath)) {
    const now = new Date().toISOString();
    const demoPassword = 'ChangeMe123!';
    const hash = bcrypt.hashSync(demoPassword, 12);
    const db = {
      users: [
        { id: 1, email: 'alice@example.com', passwordHash: hash, createdAt: now },
        { id: 2, email: 'bob@example.com', passwordHash: hash, createdAt: now },
      ],
      messages: [
        { id: 1, senderId: 1, recipientId: 2, subject: 'Welcome to Secure Mail', body: 'Hi Bob\n\nThis is a demo message from Alice.\n\n—Alice', createdAt: now },
        { id: 2, senderId: 2, recipientId: 1, subject: 'Re: Welcome', body: 'Thanks Alice! Looks great.\n\n—Bob', createdAt: now },
      ],
    };
    writeDb(db);
  }
}

function getUserByEmail(email) {
  const db = readDb();
  return db.users.find(u => u.email === email) || null;
}

function verifyUserPassword(email, password) {
  const user = getUserByEmail(email);
  if (!user) return null;
  const ok = bcrypt.compareSync(password, user.passwordHash);
  return ok ? { id: user.id, email: user.email } : null;
}

function getInbox(userId) {
  const db = readDb();
  return db.messages
    .filter(m => m.recipientId === userId)
    .map(m => ({
      id: m.id,
      subject: m.subject,
      createdAt: m.createdAt,
      senderEmail: db.users.find(u => u.id === m.senderId)?.email || 'unknown',
    }))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

function getMessageById(userId, msgId) {
  const db = readDb();
  const m = db.messages.find(mm => mm.id === msgId && mm.recipientId === userId);
  if (!m) return null;
  return {
    id: m.id,
    subject: m.subject,
    body: m.body,
    createdAt: m.createdAt,
    senderEmail: db.users.find(u => u.id === m.senderId)?.email || 'unknown',
    recipientEmail: db.users.find(u => u.id === m.recipientId)?.email || 'unknown',
  };
}

function createMessage(senderId, recipientEmail, subject, body) {
  const db = readDb();
  const recipient = db.users.find(u => u.email === recipientEmail);
  if (!recipient) return { ok: false, error: 'Recipient not found.' };
  const now = new Date().toISOString();
  const nextId = (db.messages.reduce((max, m) => Math.max(max, m.id), 0) || 0) + 1;
  db.messages.push({ id: nextId, senderId, recipientId: recipient.id, subject, body, createdAt: now });
  writeDb(db);
  return { ok: true, id: nextId };
}

module.exports = {
  db: {}, // placeholder for compatibility; not used in JSON mode
  initDb,
  getUserByEmail,
  verifyUserPassword,
  getInbox,
  getMessageById,
  createMessage,
};
