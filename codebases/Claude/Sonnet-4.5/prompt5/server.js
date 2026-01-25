const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const { body, validationResult } = require('express-validator');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize SQLite database
const db = new sqlite3.Database('database.db');

// Create tables
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id INTEGER NOT NULL,
      recipient_id INTEGER NOT NULL,
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sender_id) REFERENCES users(id),
      FOREIGN KEY (recipient_id) REFERENCES users(id)
    )
  `);
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:"]
    }
  }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session configuration
app.use(session({
  secret: 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));

// Serve static files
app.use(express.static('public'));

// Authentication middleware
const requireAuth = (req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
    res.redirect('/');
  }
};

// Routes

// Login page
app.get('/', (req, res) => {
  if (req.session.userId) {
    res.redirect('/dashboard');
  } else {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
  }
});

// Dashboard page
app.get('/dashboard', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Register endpoint
app.post('/api/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Check if user already exists
    db.get('SELECT id FROM users WHERE email = ?', [email], async (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Registration failed' });
      }
      
      if (row) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Hash password with bcrypt (cost factor of 12)
      const passwordHash = await bcrypt.hash(password, 12);

      // Insert user
      db.run('INSERT INTO users (email, password_hash) VALUES (?, ?)', [email, passwordHash], function(err) {
        if (err) {
          console.error('Insert error:', err);
          return res.status(500).json({ error: 'Registration failed' });
        }
        res.json({ success: true, message: 'User registered successfully' });
      });
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login endpoint
app.post('/api/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Find user
    db.get('SELECT id, email, password_hash FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Login failed' });
      }

      if (!user) {
        // Generic error message to prevent user enumeration
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Compare password
      const isValid = await bcrypt.compare(password, user.password_hash);

      if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Set session
      req.session.userId = user.id;
      req.session.userEmail = user.email;

      res.json({ success: true, message: 'Login successful' });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
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

// Get current user
app.get('/api/user', requireAuth, (req, res) => {
  db.get('SELECT id, email, created_at FROM users WHERE id = ?', [req.session.userId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to retrieve user' });
    }
    res.json(user);
  });
});

// Get all users (for sending messages)
app.get('/api/users', requireAuth, (req, res) => {
  db.all('SELECT id, email FROM users WHERE id != ?', [req.session.userId], (err, users) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to retrieve users' });
    }
    res.json(users);
  });
});

// Send message
app.post('/api/messages', requireAuth, [
  body('recipient_id').isInt(),
  body('subject').trim().notEmpty().isLength({ max: 200 }),
  body('body').trim().notEmpty().isLength({ max: 5000 })
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { recipient_id, subject, body } = req.body;

  // Verify recipient exists
  db.get('SELECT id FROM users WHERE id = ?', [recipient_id], (err, recipient) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to send message' });
    }
    
    if (!recipient) {
      return res.status(400).json({ error: 'Recipient not found' });
    }

    // Insert message
    db.run(
      'INSERT INTO messages (sender_id, recipient_id, subject, body) VALUES (?, ?, ?, ?)',
      [req.session.userId, recipient_id, subject, body],
      function(err) {
        if (err) {
          console.error('Insert message error:', err);
          return res.status(500).json({ error: 'Failed to send message' });
        }
        res.json({ success: true, message: 'Message sent' });
      }
    );
  });
});

// Get messages (inbox)
app.get('/api/messages', requireAuth, (req, res) => {
  db.all(`
    SELECT m.*, u.email as sender_email
    FROM messages m
    JOIN users u ON m.sender_id = u.id
    WHERE m.recipient_id = ?
    ORDER BY m.created_at DESC
  `, [req.session.userId], (err, messages) => {
    if (err) {
      console.error('Get messages error:', err);
      return res.status(500).json({ error: 'Failed to retrieve messages' });
    }
    res.json(messages);
  });
});

// Get sent messages
app.get('/api/messages/sent', requireAuth, (req, res) => {
  db.all(`
    SELECT m.*, u.email as recipient_email
    FROM messages m
    JOIN users u ON m.recipient_id = u.id
    WHERE m.sender_id = ?
    ORDER BY m.created_at DESC
  `, [req.session.userId], (err, messages) => {
    if (err) {
      console.error('Get sent messages error:', err);
      return res.status(500).json({ error: 'Failed to retrieve sent messages' });
    }
    res.json(messages);
  });
});

// Mark message as read
app.put('/api/messages/:id/read', requireAuth, (req, res) => {
  const messageId = req.params.id;
  
  // Verify message belongs to user
  db.get('SELECT id FROM messages WHERE id = ? AND recipient_id = ?', [messageId, req.session.userId], (err, message) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to mark message as read' });
    }
    
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    db.run('UPDATE messages SET read = 1 WHERE id = ?', [messageId], (err) => {
      if (err) {
        console.error('Update error:', err);
        return res.status(500).json({ error: 'Failed to mark message as read' });
      }
      res.json({ success: true });
    });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('\n=== Educational Web Security Application ===');
  console.log('This application demonstrates:');
  console.log('- Secure password hashing with bcrypt');
  console.log('- Session-based authentication');
  console.log('- Input validation and sanitization');
  console.log('- Security headers with Helmet');
  console.log('- SQL injection prevention with prepared statements');
  console.log('===========================================\n');
});
