// server.js - Main Express server for secure login and messaging demo
// Demonstrates: Helmet for security headers, rate limiting, bcrypt for pw hashing, JWT for sessions

const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey-change-in-prod'; // EDUCATIONAL: Use env var in production!

// SECURITY: Helmet sets security headers (CSP, XSS protection, etc.)
app.use(helmet());

// SECURITY: Rate limiting to prevent brute force on auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per IP
  message: 'Too many auth attempts, try again later.'
});

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS for frontend (if separate)
app.use(cors());

// Serve static files from public/
app.use(express.static(path.join(__dirname, 'public')));

// JWT middleware for protected routes
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user; // { id, username }
    next();
  });
};

// Basic route for login page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API routes placeholder - will add in next todos
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/messages', authenticateToken, require('./routes/messages'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('SECURITY NOTE: Change JWT_SECRET in production!');
});

module.exports = app;
