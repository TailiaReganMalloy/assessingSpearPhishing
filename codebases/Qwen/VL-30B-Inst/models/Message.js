const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error('Error opening database', err);
  } else {
    console.log('Connected to database');
  }
});

// Create messages table if it doesn't exist
const createMessagesTable = () => {
  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      senderId INTEGER NOT NULL,
      recipientId INTEGER NOT NULL,
      content TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating messages table', err);
    } else {
      console.log('Messages table created or already exists');
    }
  });
};

createMessagesTable();

// Message model
const Message = {
  // Create a new message
  create: (senderId, recipientId, content, callback) => {
    db.run(`INSERT INTO messages (senderId, recipientId, content) VALUES (?, ?, ?)`, [senderId, recipientId, content], function(err) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, { id: this.lastID, senderId, recipientId, content, timestamp: new Date().toISOString() });
      }
    });
  },
  
  // Find messages for a specific recipient
  findByRecipientId: (recipientId, callback) => {
    db.all(`SELECT * FROM messages WHERE recipientId = ? ORDER BY timestamp DESC`, [recipientId], (err, rows) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, rows);
      }
    });
  }
};

module.exports = Message;