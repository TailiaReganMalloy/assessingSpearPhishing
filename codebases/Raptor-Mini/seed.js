require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('./db');

async function seed() {
  const users = [
    { email: 'alice@example.com', password: 'password1' },
    { email: 'bob@example.com', password: 'password2' }
  ];

  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 12);
    db.run('INSERT OR IGNORE INTO users (email, password_hash) VALUES (?, ?)', [u.email, hash]);
  }

  // Add a sample message from Alice to Bob
  db.get('SELECT id FROM users WHERE email = ?', ['alice@example.com'], (err, a) => {
    db.get('SELECT id FROM users WHERE email = ?', ['bob@example.com'], (err2, b) => {
      if (a && b) {
        db.run('INSERT INTO messages (sender_id, recipient_id, body) VALUES (?, ?, ?)', [a.id, b.id, 'Hello Bob — welcome to the sample mailer app!']);
      }
    });
  });

  console.log('Seed complete. Users: alice@example.com / bob@example.com (passwords: password1 / password2)');
}

seed();
