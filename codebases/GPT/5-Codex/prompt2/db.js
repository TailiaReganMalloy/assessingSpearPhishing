const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const DATABASE_FILE = path.join(__dirname, 'data', 'secure-messaging.db');

function openDatabase() {
  const dir = path.dirname(DATABASE_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return new sqlite3.Database(DATABASE_FILE);
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

async function bootstrap() {
  const db = openDatabase();

  await run(
    db,
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      display_name TEXT NOT NULL
    );`
  );

  await run(
    db,
    `CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id INTEGER NOT NULL,
      recipient_id INTEGER NOT NULL,
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(sender_id) REFERENCES users(id),
      FOREIGN KEY(recipient_id) REFERENCES users(id)
    );`
  );

  const existing = await get(db, 'SELECT COUNT(*) AS count FROM users;');
  if (!existing || existing.count === 0) {
    const seededUsers = [
      { email: 'csinstructor@example.edu', name: 'Professor Ada', password: 'TeachSecurely!1' },
      { email: 'student.alex@example.edu', name: 'Alex Carter', password: 'LearningR0cks!' },
      { email: 'student.river@example.edu', name: 'River Singh', password: 'BlueMindDemo#5' }
    ];

    for (const user of seededUsers) {
      const hash = await bcrypt.hash(user.password, 12);
      await run(
        db,
        'INSERT INTO users (email, password_hash, display_name) VALUES (?, ?, ?);',
        [user.email, hash, user.name]
      );
    }

    await run(
      db,
      `INSERT INTO messages (sender_id, recipient_id, subject, body) VALUES
        (2, 1, 'Welcome to Secure Mail', 'Hi Professor Ada, just confirming I can send messages securely.'),
        (3, 1, 'Assignment Question', 'Could we review the encryption topic in next class?'),
        (1, 2, 'Re: Assignment Question', 'Absolutely, we will cover more examples in the lab session.'),
        (1, 3, 'Great Progress', 'Keep experimenting with security best practices. Proud of the work!');`
    );
  }

  return db;
}

module.exports = {
  openDatabase,
  bootstrap,
  getUserByEmail: async (email) => {
    const db = openDatabase();
    return get(db, 'SELECT * FROM users WHERE email = ?;', [email.trim().toLowerCase()]);
  },
  getUserById: async (id) => {
    const db = openDatabase();
    return get(db, 'SELECT * FROM users WHERE id = ?;', [id]);
  },
  getInboxForUser: async (userId) => {
    const db = openDatabase();
    return all(
      db,
      `SELECT m.id, m.subject, m.body, m.created_at, u.display_name AS sender_name
       FROM messages m
       JOIN users u ON u.id = m.sender_id
       WHERE m.recipient_id = ?
       ORDER BY m.created_at DESC;`,
      [userId]
    );
  },
  createMessage: async (senderId, recipientEmail, subject, body) => {
    const db = openDatabase();
    const recipient = await get(db, 'SELECT id FROM users WHERE email = ?;', [recipientEmail.trim().toLowerCase()]);
    if (!recipient) {
      throw new Error('Recipient not found');
    }
    await run(
      db,
      'INSERT INTO messages (sender_id, recipient_id, subject, body) VALUES (?, ?, ?, ?);',
      [senderId, recipient.id, subject, body]
    );
  }
};
