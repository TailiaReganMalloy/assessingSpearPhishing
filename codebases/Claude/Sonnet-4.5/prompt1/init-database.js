const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

// Create database connection
const db = new sqlite3.Database('app.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
  console.log('Connected to the database.');
});

console.log('Initializing database...');

// Helper function to run queries with promises
function runQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function getQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

async function initializeDatabase() {
  try {
    // Create users table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create messages table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender_id INTEGER NOT NULL,
        recipient_id INTEGER NOT NULL,
        subject TEXT,
        content TEXT NOT NULL,
        sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        read INTEGER DEFAULT 0,
        FOREIGN KEY (sender_id) REFERENCES users(id),
        FOREIGN KEY (recipient_id) REFERENCES users(id)
      )
    `);

    console.log('Database tables created successfully.');

    // Create demo users with hashed passwords
    const demoUsers = [
      { email: 'email@bluemind.net', password: 'password123' },
      { email: 'alice@bluemind.net', password: 'alice123' },
      { email: 'bob@bluemind.net', password: 'bob123' }
    ];

    for (const user of demoUsers) {
      try {
        const passwordHash = bcrypt.hashSync(user.password, 10);
        await runQuery('INSERT INTO users (email, password_hash) VALUES (?, ?)', [user.email, passwordHash]);
        console.log(`Created demo user: ${user.email} (password: ${user.password})`);
      } catch (error) {
        console.log(`User ${user.email} already exists, skipping...`);
      }
    }

    // Create demo messages
    const demoMessages = [
      {
        from: 'alice@bluemind.net',
        to: 'email@bluemind.net',
        subject: 'Welcome to BlueMind!',
        content: 'Hi! Welcome to our secure messaging system. This is an example of how messages are securely stored and displayed.'
      },
      {
        from: 'bob@bluemind.net',
        to: 'email@bluemind.net',
        subject: 'Project Update',
        content: 'The new features have been implemented. Please review when you have time.'
      },
      {
        from: 'alice@bluemind.net',
        to: 'bob@bluemind.net',
        subject: 'Meeting Tomorrow',
        content: 'Don\'t forget about our meeting at 10 AM tomorrow.'
      }
    ];

    for (const msg of demoMessages) {
      try {
        const sender = await getQuery('SELECT id FROM users WHERE email = ?', [msg.from]);
        const recipient = await getQuery('SELECT id FROM users WHERE email = ?', [msg.to]);
        
        if (sender && recipient) {
          await runQuery(
            'INSERT INTO messages (sender_id, recipient_id, subject, content) VALUES (?, ?, ?, ?)',
            [sender.id, recipient.id, msg.subject, msg.content]
          );
          console.log(`Created message from ${msg.from} to ${msg.to}`);
        }
      } catch (error) {
        console.log(`Error creating message: ${error.message}`);
      }
    }

    console.log('\nDatabase initialization complete!');
    console.log('\nDemo credentials:');
    console.log('- email@bluemind.net / password123');
    console.log('- alice@bluemind.net / alice123');
    console.log('- bob@bluemind.net / bob123');

  } catch (error) {
    console.error('Error initializing database:', error.message);
  } finally {
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('Database connection closed.');
      }
    });
  }
}

initializeDatabase();
