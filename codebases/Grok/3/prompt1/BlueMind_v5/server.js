/**
 * BlueMind v5 - Secure Login and Messaging Application
 * Educational Reference Implementation
 * 
 * This server demonstrates best practices for:
 * - Secure user authentication with password hashing
 * - Session management
 * - User messaging system
 */

const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages');
const authMiddleware = require('./middleware/auth');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
  secret: 'your-secret-key-change-in-production', // IMPORTANT: Change this in production
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false, // Set to true if using HTTPS
    httpOnly: true,
    maxAge: 3600000 // 1 hour
  }
}));

// Routes
app.use('/auth', authRoutes);
app.use('/api/messages', messageRoutes);

// Serve login page
app.get('/', (req, res) => {
  if (req.session.userId) {
    return res.redirect('/dashboard.html');
  }
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Serve dashboard (protected route)
app.get('/dashboard.html', authMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Logout route
app.get('/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Error logging out');
    }
    res.redirect('/');
  });
});

// 404 Error handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`BlueMind v5 is running on http://localhost:${PORT}`);
  console.log('Press Ctrl+C to stop the server');
});
