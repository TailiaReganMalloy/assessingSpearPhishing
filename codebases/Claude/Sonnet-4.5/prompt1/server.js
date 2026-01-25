const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

// Initialize database
const db = new sqlite3.Database('app.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
});

// Helper functions for database queries
function getQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function allQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function runQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// Session configuration - IMPORTANT: In production, use a secure secret and proper session store
app.use(session({
  secret: 'educational-demo-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));

// Authentication middleware
function requireAuth(req, res, next) {
  if (req.session.userId) {
    next();
  } else {
    res.redirect('/');
  }
}

// Routes

// Serve login page
app.get('/', (req, res) => {
  if (req.session.userId) {
    res.redirect('/messages');
  } else {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  
  // Input validation
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  try {
    // Find user by email
    const user = await getQuery('SELECT * FROM users WHERE email = ?', [email]);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Verify password using bcrypt
    const passwordMatch = bcrypt.compareSync(password, user.password_hash);
    
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Create session
    req.session.userId = user.id;
    req.session.email = user.email;
    
    res.json({ success: true, redirect: '/messages' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'An error occurred during login' });
  }
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ success: true });
  });
});

// Get current user info
app.get('/api/user', requireAuth, (req, res) => {
  res.json({
    id: req.session.userId,
    email: req.session.email
  });
});

// Get messages for logged-in user
app.get('/api/messages', requireAuth, async (req, res) => {
  try {
    const messages = await allQuery(`
      SELECT 
        m.id,
        m.subject,
        m.content,
        m.sent_at,
        m.read,
        u.email as sender_email
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.recipient_id = ?
      ORDER BY m.sent_at DESC
    `, [req.session.userId]);
    
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Mark message as read
app.post('/api/messages/:id/read', requireAuth, async (req, res) => {
  try {
    const messageId = req.params.id;
    
    // Verify the message belongs to the current user
    const message = await getQuery(`
      SELECT * FROM messages 
      WHERE id = ? AND recipient_id = ?
    `, [messageId, req.session.userId]);
    
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    await runQuery('UPDATE messages SET read = 1 WHERE id = ?', [messageId]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ error: 'Failed to update message' });
  }
});

// Send a new message
app.post('/api/messages', requireAuth, async (req, res) => {
  const { recipientEmail, subject, content } = req.body;
  
  if (!recipientEmail || !content) {
    return res.status(400).json({ error: 'Recipient and content are required' });
  }
  
  try {
    // Find recipient
    const recipient = await getQuery('SELECT id FROM users WHERE email = ?', [recipientEmail]);
    
    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found' });
    }
    
    // Insert message
    const result = await runQuery(`
      INSERT INTO messages (sender_id, recipient_id, subject, content)
      VALUES (?, ?, ?, ?)
    `, [req.session.userId, recipient.id, subject || 'No Subject', content]);
    
    res.json({ success: true, messageId: result.lastID });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get all users (for messaging purposes)
app.get('/api/users', requireAuth, async (req, res) => {
  try {
    const users = await allQuery('SELECT id, email FROM users WHERE id != ?', [req.session.userId]);
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`\n✓ Server running on http://localhost:${PORT}`);
  console.log(`\nSecurity features implemented:`);
  console.log(`- Password hashing with bcrypt`);
  console.log(`- Session-based authentication`);
  console.log(`- HTTP-only cookies`);
  console.log(`- Protected API endpoints`);
  console.log(`- Input validation`);
  console.log(`\nDemo credentials:`);
  console.log(`- email@bluemind.net / password123`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('\nDatabase connection closed');
    }
    process.exit(0);
  });
});
