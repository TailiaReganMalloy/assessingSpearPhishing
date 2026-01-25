const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3");
const bcrypt = require("bcrypt");

const DATA_DIR = path.join(__dirname, "data");
const DB_PATH = path.join(DATA_DIR, "app.db");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function openDb() {
  ensureDataDir();
  return new sqlite3.Database(DB_PATH);
}

function run(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this);
    });
  });
}

function get(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row);
    });
  });
}

function all(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
}

async function initDb() {
  const db = openDb();
  await run(
    db,
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      display_name TEXT NOT NULL,
      password_hash TEXT NOT NULL
    )`
  );
  await run(
    db,
    `CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id INTEGER NOT NULL,
      recipient_id INTEGER NOT NULL,
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      sent_at TEXT NOT NULL,
      FOREIGN KEY(sender_id) REFERENCES users(id),
      FOREIGN KEY(recipient_id) REFERENCES users(id)
    )`
  );

  const existing = await get(db, "SELECT COUNT(*) AS count FROM users");
  if (existing && existing.count === 0) {
    const passwordHash = await bcrypt.hash("Password!123", 12);
    const users = [
      { email: "alex@example.com", displayName: "Alex Rivera" },
      { email: "jordan@example.com", displayName: "Jordan Lee" },
      { email: "sam@example.com", displayName: "Sam Patel" }
    ];

    const userIds = [];
    for (const user of users) {
      const result = await run(
        db,
        "INSERT INTO users (email, display_name, password_hash) VALUES (?, ?, ?)",
        [user.email, user.displayName, passwordHash]
      );
      userIds.push(result.lastID);
    }

    const now = new Date();
    const messages = [
      {
        senderId: userIds[1],
        recipientId: userIds[0],
        subject: "Welcome to secure messaging",
        body: "This is a sample message to demonstrate authenticated inbox access.",
        sentAt: new Date(now.getTime() - 1000 * 60 * 60).toISOString()
      },
      {
        senderId: userIds[2],
        recipientId: userIds[0],
        subject: "Security checklist",
        body: "Remember to hash passwords, protect sessions, and validate input.",
        sentAt: new Date(now.getTime() - 1000 * 60 * 30).toISOString()
      },
      {
        senderId: userIds[0],
        recipientId: userIds[1],
        subject: "Lab notes",
        body: "Here are the notes from today’s lab on CSRF and session security.",
        sentAt: new Date(now.getTime() - 1000 * 60 * 10).toISOString()
      }
    ];

    for (const message of messages) {
      await run(
        db,
        "INSERT INTO messages (sender_id, recipient_id, subject, body, sent_at) VALUES (?, ?, ?, ?, ?)",
        [message.senderId, message.recipientId, message.subject, message.body, message.sentAt]
      );
    }
  }

  return db;
}

async function getUserByEmail(db, email) {
  return get(db, "SELECT * FROM users WHERE email = ?", [email]);
}

async function getUserById(db, id) {
  return get(db, "SELECT * FROM users WHERE id = ?", [id]);
}

async function getInboxMessages(db, userId) {
  return all(
    db,
    `SELECT messages.id, messages.subject, messages.body, messages.sent_at AS sentAt,
            users.display_name AS senderName, users.email AS senderEmail
     FROM messages
     JOIN users ON messages.sender_id = users.id
     WHERE messages.recipient_id = ?
     ORDER BY messages.sent_at DESC`,
    [userId]
  );
}

async function getMessageById(db, messageId, userId) {
  return get(
    db,
    `SELECT messages.id, messages.subject, messages.body, messages.sent_at AS sentAt,
            users.display_name AS senderName, users.email AS senderEmail
     FROM messages
     JOIN users ON messages.sender_id = users.id
     WHERE messages.id = ? AND messages.recipient_id = ?`,
    [messageId, userId]
  );
}

module.exports = {
  initDb,
  getUserByEmail,
  getUserById,
  getInboxMessages,
  getMessageById
};
