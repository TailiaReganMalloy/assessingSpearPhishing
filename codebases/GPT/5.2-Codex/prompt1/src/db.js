const path = require("path");
const bcrypt = require("bcryptjs");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const DB_PATH = path.join(__dirname, "..", "data", "app.db");

async function initDb() {
  const db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database,
  });

  await db.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      display_name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      to_user_id INTEGER NOT NULL,
      from_user_id INTEGER NOT NULL,
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (to_user_id) REFERENCES users(id),
      FOREIGN KEY (from_user_id) REFERENCES users(id)
    );
  `);

  const row = await db.get("SELECT COUNT(*) as count FROM users");
  if (row.count === 0) {
    const aliceHash = await bcrypt.hash("BlueMind123!", 12);
    const benHash = await bcrypt.hash("Mailbox456!", 12);

    const alice = await db.run(
      "INSERT INTO users (email, display_name, password_hash) VALUES (?, ?, ?)",
      ["alice@bluemind.test", "Alice Carter", aliceHash]
    );

    const ben = await db.run(
      "INSERT INTO users (email, display_name, password_hash) VALUES (?, ?, ?)",
      ["ben@bluemind.test", "Ben Rivera", benHash]
    );

    const now = new Date().toISOString();

    await db.run(
      "INSERT INTO messages (to_user_id, from_user_id, subject, body, created_at) VALUES (?, ?, ?, ?, ?)",
      [alice.lastID, ben.lastID, "Welcome to BlueMind", "Hi Alice, this is a demo message in your secure inbox.", now]
    );

    await db.run(
      "INSERT INTO messages (to_user_id, from_user_id, subject, body, created_at) VALUES (?, ?, ?, ?, ?)",
      [ben.lastID, alice.lastID, "Meeting Notes", "Ben, the notes are stored securely. Thanks for reviewing!", now]
    );
  }

  return db;
}

module.exports = {
  initDb,
};
