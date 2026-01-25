const path = require("path");
const Database = require("better-sqlite3");
const bcrypt = require("bcrypt");

const dbPath = path.join(__dirname, "..", "data.sqlite");
const db = new Database(dbPath);

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL,
    recipient_id INTEGER NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (recipient_id) REFERENCES users(id)
  );
`);

function createUser({ name, email, passwordHash }) {
  const stmt = db.prepare(
    `INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)`
  );
  return stmt.run(name, email, passwordHash);
}

function findUserByEmail(email) {
  return db
    .prepare(`SELECT id, name, email, password_hash FROM users WHERE email = ?`)
    .get(email);
}

function findUserById(id) {
  return db
    .prepare(`SELECT id, name, email, password_hash FROM users WHERE id = ?`)
    .get(id);
}

function listUsers(excludeId) {
  return db
    .prepare(`SELECT id, name, email FROM users WHERE id != ? ORDER BY name`)
    .all(excludeId);
}

function listInbox(recipientId) {
  return db
    .prepare(
      `SELECT m.id, m.subject, m.created_at, u.name AS sender_name, u.email AS sender_email
       FROM messages m
       JOIN users u ON u.id = m.sender_id
       WHERE m.recipient_id = ?
       ORDER BY m.created_at DESC`
    )
    .all(recipientId);
}

function sendMessage({ senderId, recipientId, subject, body }) {
  return db
    .prepare(
      `INSERT INTO messages (sender_id, recipient_id, subject, body)
       VALUES (?, ?, ?, ?)`
    )
    .run(senderId, recipientId, subject, body);
}

function ensureSeedData() {
  const count = db.prepare(`SELECT COUNT(*) AS count FROM users`).get();
  if (count.count > 0) {
    return;
  }

  const passwordAlice = bcrypt.hashSync("Password!123", 12);
  const passwordBob = bcrypt.hashSync("Password!123", 12);
  const passwordClaire = bcrypt.hashSync("Password!123", 12);

  const alice = createUser({
    name: "Alice Admin",
    email: "alice@bluemind.net",
    passwordHash: passwordAlice
  });

  const bob = createUser({
    name: "Bob Analyst",
    email: "bob@bluemind.net",
    passwordHash: passwordBob
  });

  const claire = createUser({
    name: "Claire Student",
    email: "claire@bluemind.net",
    passwordHash: passwordClaire
  });

  sendMessage({
    senderId: bob.lastInsertRowid,
    recipientId: alice.lastInsertRowid,
    subject: "Meeting notes",
    body: "Here are the notes from today's security briefing."
  });

  sendMessage({
    senderId: claire.lastInsertRowid,
    recipientId: alice.lastInsertRowid,
    subject: "Project update",
    body: "The team finished the first authentication prototype."
  });

  sendMessage({
    senderId: alice.lastInsertRowid,
    recipientId: bob.lastInsertRowid,
    subject: "Follow-up",
    body: "Thanks for the notes. Let's review tomorrow."
  });
}

module.exports = {
  db,
  createUser,
  findUserByEmail,
  findUserById,
  listUsers,
  listInbox,
  sendMessage,
  ensureSeedData
};
