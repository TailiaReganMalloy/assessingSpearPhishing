const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const bcryptjs = require('bcryptjs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
  secret: 'your-secret-key-change-this-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // Set to true in production with HTTPS
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));

// Database initialization
const db = new sqlite3.Database('./app.db', (err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Messages table
  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id INTEGER NOT NULL,
      receiver_id INTEGER NOT NULL,
      subject TEXT,
      body TEXT NOT NULL,
      is_read BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sender_id) REFERENCES users(id),
      FOREIGN KEY (receiver_id) REFERENCES users(id)
    )
  `);
}

// Routes

// Login page
app.get('/', (req, res) => {
  if (req.session.userId) {
    return res.redirect('/dashboard');
  }
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Register page
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Handle registration
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({ success: false, message: 'Email and password required' });
  }

  try {
    const hashedPassword = await bcryptjs.hash(password, 10);

    db.run(
      'INSERT INTO users (email, password_hash) VALUES (?, ?)',
      [email, hashedPassword],
      (err) => {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.json({ success: false, message: 'Email already registered' });
          }
          return res.json({ success: false, message: 'Registration failed' });
        }
        res.json({ success: true, message: 'Registration successful. Please log in.' });
      }
    );
  } catch (error) {
    res.json({ success: false, message: 'Server error' });
  }
});

// Handle login
app.post('/api/login', (req, res) => {
  const { email, password, privateComputer } = req.body;

  if (!email || !password) {
    return res.json({ success: false, message: 'Email and password required' });
  }

  db.get(
    'SELECT id, email, password_hash FROM users WHERE email = ?',
    [email],
    async (err, user) => {
      if (err) {
        return res.json({ success: false, message: 'Server error' });
      }

      if (!user) {
        return res.json({ success: false, message: 'Invalid email or password' });
      }

      try {
        const passwordMatch = await bcryptjs.compare(password, user.password_hash);

        if (!passwordMatch) {
          return res.json({ success: false, message: 'Invalid email or password' });
        }

        // Set session
        req.session.userId = user.id;
        req.session.email = user.email;

        // Set session timeout based on computer type
        if (privateComputer) {
          req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 7; // 7 days for private computer
        }

        res.json({ success: true, message: 'Login successful' });
      } catch (error) {
        res.json({ success: false, message: 'Server error' });
      }
    }
  );
});

// Dashboard (protected route)
app.get('/dashboard', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/');
  }
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Get user messages
app.get('/api/messages', (req, res) => {
  if (!req.session.userId) {
    return res.json({ success: false, message: 'Not authenticated' });
  }

  db.all(
    `SELECT m.id, m.subject, m.body, m.is_read, m.created_at, u.email as sender_email
     FROM messages m
     JOIN users u ON m.sender_id = u.id
     WHERE m.receiver_id = ?
     ORDER BY m.created_at DESC`,
    [req.session.userId],
    (err, messages) => {
      if (err) {
        return res.json({ success: false, message: 'Error fetching messages' });
      }
      res.json({ success: true, messages: messages || [] });
    }
  );
});

// Mark message as read
app.post('/api/messages/:id/read', (req, res) => {
  if (!req.session.userId) {
    return res.json({ success: false, message: 'Not authenticated' });
  }

  db.run(
    'UPDATE messages SET is_read = 1 WHERE id = ? AND receiver_id = ?',
    [req.params.id, req.session.userId],
    (err) => {
      if (err) {
        return res.json({ success: false, message: 'Error updating message' });
      }
      res.json({ success: true, message: 'Message marked as read' });
    }
  );
});

// Get all users for sending messages
app.get('/api/users', (req, res) => {
  if (!req.session.userId) {
    return res.json({ success: false, message: 'Not authenticated' });
  }

  db.all(
    'SELECT id, email FROM users WHERE id != ? ORDER BY email',
    [req.session.userId],
    (err, users) => {
      if (err) {
        return res.json({ success: false, message: 'Error fetching users' });
      }
      res.json({ success: true, users: users || [] });
    }
  );
});

// Send message
app.post('/api/messages', (req, res) => {
  if (!req.session.userId) {
    return res.json({ success: false, message: 'Not authenticated' });
  }

  const { receiver_id, subject, body } = req.body;

  if (!receiver_id || !body) {
    return res.json({ success: false, message: 'Receiver and message body required' });
  }

  db.run(
    'INSERT INTO messages (sender_id, receiver_id, subject, body) VALUES (?, ?, ?, ?)',
    [req.session.userId, receiver_id, subject || 'No subject', body],
    (err) => {
      if (err) {
        return res.json({ success: false, message: 'Error sending message' });
      }
      res.json({ success: true, message: 'Message sent successfully' });
    }
  );
});

// Get current user info
app.get('/api/user', (req, res) => {
  if (!req.session.userId) {
    return res.json({ success: false, message: 'Not authenticated' });
  }

  res.json({
    success: true,
    email: req.session.email
  });
});

// Logout
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.json({ success: false, message: 'Logout failed' });
    }
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log('Press Ctrl+C to stop the server');
});
