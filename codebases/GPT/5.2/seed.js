require('dotenv').config();

const bcrypt = require('bcrypt');
const { openDb, migrate, run, get } = require('./db');

async function main() {
  const db = openDb();
  await migrate(db);

  const users = [
    { email: 'alice@bluemind.net', password: 'Password123!' },
    { email: 'bob@bluemind.net', password: 'Password123!' }
  ];

  for (const u of users) {
    const existing = await get(db, 'SELECT id FROM users WHERE email = ?', [u.email]);
    if (existing) continue;

    const passwordHash = await bcrypt.hash(u.password, 12);
    await run(db, 'INSERT INTO users (email, password_hash) VALUES (?, ?)', [u.email, passwordHash]);
  }

  const alice = await get(db, 'SELECT id FROM users WHERE email = ?', ['alice@bluemind.net']);
  const bob = await get(db, 'SELECT id FROM users WHERE email = ?', ['bob@bluemind.net']);

  if (alice && bob) {
    await run(
      db,
      'INSERT INTO messages (sender_user_id, recipient_user_id, subject, body) VALUES (?, ?, ?, ?)',
      [alice.id, bob.id, 'Welcome', 'Hi Bob — this is a demo message.']
    );
  }

  console.log('Seed complete. Demo users: alice@bluemind.net / Password123! and bob@bluemind.net / Password123!');
  db.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
