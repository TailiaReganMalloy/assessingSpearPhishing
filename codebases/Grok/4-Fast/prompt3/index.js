const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const db = require('./db');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public')); // For serving static files like HTML/CSS

// Session configuration (enhanced for security)
app.use(session({
  secret: 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false, // Changed to false for security
  cookie: { 
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Registration route
app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // Password length validation
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long' });
  }

  // Check if user already exists
  db.get('SELECT id FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (user) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert new user
    db.run('INSERT INTO users (email, password_hash) VALUES (?, ?)', [email, passwordHash], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to register user' });
      }
      res.status(201).json({ message: 'User registered successfully', userId: this.lastID });
    });
  });
});

// Login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    req.session.userId = user.id;
    res.json({ message: 'Login successful', userId: user.id });
  });
});

// Logout route
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ message: 'Logout successful' });
  });
});

// Authentication middleware
function isAuthenticated(req, res, next) {
  if (req.session.userId) {
    return next();
  }
  res.status(401).json({ error: 'Not authenticated' });
}

// Send message route
app.post('/send-message', isAuthenticated, (req, res) => {
  const { toEmail, content } = req.body;

  if (!toEmail || !content) {
    return res.status(400).json({ error: 'Recipient email and content are required' });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(toEmail)) {
    return res.status(400).json({ error: 'Invalid recipient email format' });
  }

  // Content length validation
  if (content.length > 1000) {
    return res.status(400).json({ error: 'Message content too long (max 1000 characters)' });
  }

  db.get('SELECT id FROM users WHERE email = ?', [toEmail], (err, recipient) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    db.run('INSERT INTO messages (from_id, to_id, content) VALUES (?, ?, ?)', 
           [req.session.userId, recipient.id, content], 
           function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to send message' });
      }
      res.json({ message: 'Message sent successfully', messageId: this.lastID });
    });
  });
});

// View messages route (changed to /api/messages)
app.get('/api/messages', isAuthenticated, (req, res) => {
  db.all(`SELECT m.id, m.content, m.timestamp, u.email as from_email 
          FROM messages m 
          JOIN users u ON m.from_id = u.id 
          WHERE m.to_id = ? 
          ORDER BY m.timestamp DESC`, 
         [req.session.userId], 
         (err, messages) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ messages });
  });
});

// Serve login/register page
app.get('/', (req, res) => {
  if (req.session.userId) {
    return res.redirect('/messages');
  }
  res.sendFile(__dirname + '/public/index.html');
});

// Serve messages page
app.get('/messages', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/');
  }
  res.sendFile(__dirname + '/public/messages.html');
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;