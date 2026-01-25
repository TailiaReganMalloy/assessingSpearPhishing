const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Message {
  constructor(id, senderId, recipientId, subject, content, timestamp) {
    this.id = id;
    this.senderId = senderId;
    this.recipientId = recipientId;
    this.subject = subject;
    this.content = content;
    this.timestamp = timestamp;
  }

  static initializeDB() {
    this.db = new sqlite3.Database(path.join(__dirname, '../database.sqlite'));
    
    const createMessageTable = `
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender_id INTEGER NOT NULL,
        recipient_id INTEGER NOT NULL,
        subject TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES users (id),
        FOREIGN KEY (recipient_id) REFERENCES users (id)
      )
    `;
    
    this.db.run(createMessageTable, (err) => {
      if (err) {
        console.error('Error creating messages table:', err.message);
      } else {
        console.log('Messages table ready');
      }
    });
  }

  static async create(senderId, recipientId, subject, content) {
    // Sanitize inputs to prevent XSS and SQL injection
    const sanitizedSubject = subject.replace(/[<>'"&]/g, (match) => {
      const escapeMap = { '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', '&': '&amp;' };
      return escapeMap[match];
    });
    
    const sanitizedContent = content.replace(/[<>'"&]/g, (match) => {
      const escapeMap = { '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', '&': '&amp;' };
      return escapeMap[match];
    });
    
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare('INSERT INTO messages (sender_id, recipient_id, subject, content) VALUES (?, ?, ?, ?)');
      stmt.run([senderId, recipientId, sanitizedSubject, sanitizedContent], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(new Message(this.lastID, senderId, recipientId, sanitizedSubject, sanitizedContent, new Date()));
        }
      });
      stmt.finalize();
    });
  }

  static async findByUserId(userId) {
    return new Promise((resolve, reject) => {
      this.db.all(`
        SELECT m.*, u.username as sender_username 
        FROM messages m 
        JOIN users u ON m.sender_id = u.id 
        WHERE m.recipient_id = ?
        ORDER BY m.timestamp DESC
      `, [userId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(row => new Message(
            row.id, 
            row.sender_id, 
            row.recipient_id, 
            row.subject, 
            row.content, 
            row.timestamp
          )));
        }
      });
    });
  }

  static async findBySenderId(senderId) {
    return new Promise((resolve, reject) => {
      this.db.all(`
        SELECT m.*, u.username as recipient_username 
        FROM messages m 
        JOIN users u ON m.recipient_id = u.id 
        WHERE m.sender_id = ?
        ORDER BY m.timestamp DESC
      `, [senderId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(row => new Message(
            row.id, 
            row.sender_id, 
            row.recipient_id, 
            row.subject, 
            row.content, 
            row.timestamp
          )));
        }
      });
    });
  }
}

module.exports = Message;