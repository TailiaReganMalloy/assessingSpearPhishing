const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// Rate limiting for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many login attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// Session configuration
app.use(session({
  secret: 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize SQLite database
const db = new sqlite3.Database('./database.db');

// Create tables if they don't exist
db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Messages table
  db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER,
    recipient_id INTEGER,
    subject TEXT,
    body TEXT,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    read_at DATETIME,
    FOREIGN KEY (sender_id) REFERENCES users (id),
    FOREIGN KEY (recipient_id) REFERENCES users (id)
  )`);

  // Create sample users for demonstration
  const samplePassword = bcrypt.hashSync('password123', 10);
  
  db.run(`INSERT OR IGNORE INTO users (email, password_hash) VALUES (?, ?)`, 
    ['demo@bluemind.net', samplePassword]);
  
  db.run(`INSERT OR IGNORE INTO users (email, password_hash) VALUES (?, ?)`, 
    ['admin@bluemind.net', samplePassword]);

  // Create sample messages
  db.run(`INSERT OR IGNORE INTO messages (sender_id, recipient_id, subject, body) 
    VALUES (2, 1, 'Welcome to BlueMind', 'Welcome to our secure messaging system. Your account has been activated.')`);
  
  db.run(`INSERT OR IGNORE INTO messages (sender_id, recipient_id, subject, body) 
    VALUES (2, 1, 'Security Notice', 'Please remember to use strong passwords and log out when using public computers.')`);
});

// Middleware to check if user is authenticated
function requireAuth(req, res, next) {
  if (req.session.userId) {
    next();
  } else {
    res.redirect('/');
  }
}

// Routes
app.get('/', (req, res) => {
  if (req.session.userId) {
    res.redirect('/dashboard');
  } else {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
});

app.post('/login', loginLimiter, async (req, res) => {
  const { email, password, computerType } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const passwordMatch = await bcrypt.compare(password, user.password_hash);
      
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Set session
      req.session.userId = user.id;
      req.session.userEmail = user.email;
      req.session.computerType = computerType;

      // Adjust session duration based on computer type
      if (computerType === 'public') {
        req.session.cookie.maxAge = 30 * 60 * 1000; // 30 minutes for public computers
      }

      res.json({ success: true, redirect: '/dashboard' });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/dashboard', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/api/messages', requireAuth, (req, res) => {
  const userId = req.session.userId;
  
  db.all(`SELECT m.*, u.email as sender_email 
          FROM messages m 
          JOIN users u ON m.sender_id = u.id 
          WHERE m.recipient_id = ? 
          ORDER BY m.sent_at DESC`, 
    [userId], (err, messages) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch messages' });
    }
    
    res.json(messages);
  });
});

app.post('/api/messages/:id/read', requireAuth, (req, res) => {
  const messageId = req.params.id;
  const userId = req.session.userId;
  
  db.run(`UPDATE messages SET read_at = CURRENT_TIMESTAMP 
          WHERE id = ? AND recipient_id = ? AND read_at IS NULL`, 
    [messageId, userId], (err) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to mark message as read' });
    }
    
    res.json({ success: true });
  });
});

app.post('/api/send-message', requireAuth, (req, res) => {
  const { recipientEmail, subject, body } = req.body;
  const senderId = req.session.userId;

  if (!recipientEmail || !subject || !body) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Find recipient by email
  db.get('SELECT id FROM users WHERE email = ?', [recipientEmail], (err, recipient) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    // Insert message
    db.run(`INSERT INTO messages (sender_id, recipient_id, subject, body) VALUES (?, ?, ?, ?)`,
      [senderId, recipient.id, subject, body], (err) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to send message' });
      }

      res.json({ success: true, message: 'Message sent successfully' });
    });
  });
});

app.get('/api/user', requireAuth, (req, res) => {
  res.json({ 
    email: req.session.userEmail,
    computerType: req.session.computerType 
  });
});

app.post('/logout', requireAuth, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Failed to logout' });
    }
    res.json({ success: true });
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Demo accounts:`);
  console.log(`  Email: demo@bluemind.net`);
  console.log(`  Email: admin@bluemind.net`);
  console.log(`  Password: password123`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  db.close();
  process.exit(0);
});