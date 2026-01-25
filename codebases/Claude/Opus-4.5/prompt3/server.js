const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const { body, validationResult } = require('express-validator');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'educational-demo-secret-change-in-production';

// Educational Notice
console.log('🎓 EDUCATIONAL DEMO - Secure Authentication & Messaging System');
console.log('⚠️  FOR LEARNING PURPOSES ONLY - DO NOT USE IN PRODUCTION WITHOUT PROPER SECURITY REVIEW');

// Security middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Stricter rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per windowMs
  message: 'Too many authentication attempts, please try again later.'
});

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Database setup
const db = new sqlite3.Database(':memory:'); // In-memory database for demo

// Initialize database schema
db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME
  )`);

  // Messages table
  db.run(`CREATE TABLE messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_user_id INTEGER NOT NULL,
    to_user_id INTEGER NOT NULL,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    read_at DATETIME,
    FOREIGN KEY (from_user_id) REFERENCES users (id),
    FOREIGN KEY (to_user_id) REFERENCES users (id)
  )`);

  // Create demo users and messages
  const demoUsers = [
    { email: 'alice@example.com', password: 'securePass123!' },
    { email: 'bob@example.com', password: 'anotherSecurePass456!' },
    { email: 'charlie@example.com', password: 'yetAnotherPass789!' }
  ];

  demoUsers.forEach(async (user, index) => {
    const hashedPassword = await bcrypt.hash(user.password, 12);
    db.run('INSERT INTO users (email, password_hash) VALUES (?, ?)', [user.email, hashedPassword]);
    
    if (index === 0) {
      // Add some demo messages for alice
      setTimeout(() => {
        db.run('INSERT INTO messages (from_user_id, to_user_id, subject, content) VALUES (2, 1, ?, ?)', 
          ['Welcome to the Platform', 'Hi Alice! Welcome to our secure messaging platform. This is a demo message to show how the system works.']);
        db.run('INSERT INTO messages (from_user_id, to_user_id, subject, content) VALUES (3, 1, ?, ?)', 
          ['Security Best Practices', 'Remember to always use strong passwords and enable two-factor authentication when available!']);
      }, 100);
    }
  });
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const token = req.cookies.auth_token;
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid token.' });
  }
};

// Input validation middleware
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
];

const validateMessage = [
  body('to_email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid recipient email address'),
  body('subject')
    .isLength({ min: 1, max: 200 })
    .trim()
    .withMessage('Subject must be between 1 and 200 characters'),
  body('content')
    .isLength({ min: 1, max: 5000 })
    .trim()
    .withMessage('Content must be between 1 and 5000 characters'),
];

// Routes

// Home page
app.get('/', (req, res) => {
  const token = req.cookies.auth_token;
  if (token) {
    try {
      jwt.verify(token, JWT_SECRET);
      return res.redirect('/dashboard');
    } catch (error) {
      // Invalid token, continue to login page
    }
  }
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Login endpoint
app.post('/api/login', authLimiter, validateLogin, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, computer_type } = req.body;

    // Find user by email
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Update last login
      db.run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

      // Create JWT token
      const tokenPayload = { 
        userId: user.id, 
        email: user.email 
      };
      
      // Set token expiration based on computer type
      const expiresIn = computer_type === 'private' ? '7d' : '2h';
      const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn });

      // Set secure cookie
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: computer_type === 'private' ? 7 * 24 * 60 * 60 * 1000 : 2 * 60 * 60 * 1000 // 7 days or 2 hours
      };

      res.cookie('auth_token', token, cookieOptions);
      res.json({ 
        success: true, 
        message: 'Login successful',
        redirect: '/dashboard'
      });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Dashboard page
app.get('/dashboard', authenticateToken, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Get user messages
app.get('/api/messages', authenticateToken, (req, res) => {
  const query = `
    SELECT m.*, u.email as sender_email 
    FROM messages m 
    JOIN users u ON m.from_user_id = u.id 
    WHERE m.to_user_id = ? 
    ORDER BY m.created_at DESC
  `;
  
  db.all(query, [req.user.userId], (err, messages) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to retrieve messages' });
    }
    
    res.json({ messages });
  });
});

// Send message
app.post('/api/messages', authenticateToken, validateMessage, (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { to_email, subject, content } = req.body;

    // Find recipient user
    db.get('SELECT id FROM users WHERE email = ?', [to_email], (err, recipient) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (!recipient) {
        return res.status(404).json({ error: 'Recipient not found' });
      }

      // Insert message
      db.run(
        'INSERT INTO messages (from_user_id, to_user_id, subject, content) VALUES (?, ?, ?, ?)',
        [req.user.userId, recipient.id, subject, content],
        function(err) {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Failed to send message' });
          }

          res.json({ 
            success: true, 
            message: 'Message sent successfully',
            messageId: this.lastID
          });
        }
      );
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark message as read
app.patch('/api/messages/:id/read', authenticateToken, (req, res) => {
  const messageId = req.params.id;
  
  db.run(
    'UPDATE messages SET read_at = CURRENT_TIMESTAMP WHERE id = ? AND to_user_id = ?',
    [messageId, req.user.userId],
    function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to mark message as read' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Message not found' });
      }

      res.json({ success: true, message: 'Message marked as read' });
    }
  );
});

// Get user list (for sending messages)
app.get('/api/users', authenticateToken, (req, res) => {
  db.all('SELECT id, email FROM users WHERE id != ?', [req.user.userId], (err, users) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to retrieve users' });
    }
    
    res.json({ users });
  });
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
  res.clearCookie('auth_token');
  res.json({ success: true, message: 'Logged out successfully' });
});

// Current user info
app.get('/api/user', authenticateToken, (req, res) => {
  res.json({ 
    user: { 
      id: req.user.userId, 
      email: req.user.email 
    } 
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log('📚 Educational demo accounts:');
  console.log('   alice@example.com / securePass123!');
  console.log('   bob@example.com / anotherSecurePass456!');
  console.log('   charlie@example.com / yetAnotherPass789!');
});

module.exports = app;