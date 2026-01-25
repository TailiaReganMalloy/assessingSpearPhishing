import { mkdirSync, existsSync } from 'fs';
import { dirname } from 'path';
import bcrypt from 'bcrypt';
import { all, db, get, run, DB_PATH } from './index.js';

const SALT_ROUNDS = 12;

async function ensureDataDirectory() {
  const dir = dirname(DB_PATH);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

async function migrate() {
  await ensureDataDirectory();

  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      display_name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id INTEGER NOT NULL,
      recipient_id INTEGER NOT NULL,
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  const existingUsers = await all('SELECT id, email FROM users LIMIT 1');
  if (existingUsers.length === 0) {
    const password = 'Passw0rd!';
    const hash = await bcrypt.hash(password, SALT_ROUNDS);

    const alice = await run(
      'INSERT INTO users (email, display_name, password_hash) VALUES (?, ?, ?)',
      ['alice@example.org', 'Alice Ortega', hash]
    );

    const bob = await run(
      'INSERT INTO users (email, display_name, password_hash) VALUES (?, ?, ?)',
      ['bob@example.org', 'Bob Stone', hash]
    );

    await run(
      'INSERT INTO messages (sender_id, recipient_id, subject, body) VALUES (?, ?, ?, ?)',
      [alice.id, bob.id, 'Welcome', 'Hi Bob, excited to use our secure mailbox.']
    );

    await run(
      'INSERT INTO messages (sender_id, recipient_id, subject, body) VALUES (?, ?, ?, ?)',
      [bob.id, alice.id, 'Re: Welcome', 'Glad to be here. Let us keep credentials private.']
    );
  }
}

migrate()
  .then(async () => {
    const [{ totalUsers }] = await all('SELECT COUNT(*) as totalUsers FROM users');
    console.log(`Database ready at ${DB_PATH} with ${totalUsers} users.`);
    db.close();
  })
  .catch((err) => {
    console.error('Migration failed:', err);
    db.close();
    process.exitCode = 1;
  });
