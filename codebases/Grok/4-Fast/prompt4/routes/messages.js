// routes/messages.js - Messaging routes
const express = require('express');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const router = express.Router();
const dbPath = path.join(__dirname, '../db/database.db');
const db = new sqlite3.Database(dbPath);

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.redirect('/login');
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.redirect('/login');
    req.user = user;
    next();
  });
};

// Dashboard
router.get('/dashboard', authenticateToken, (req, res) => {
  res.render('dashboard', { user: req.user });
});

// Send message
router.get('/send', authenticateToken, (req, res) => {
  db.all('SELECT id, email FROM users WHERE id != ?', [req.user.id], (err, users) => {
    if (err) return res.send('Error');
    res.render('send', { user: req.user, users });
  });
});

router.post('/send', authenticateToken, (req, res) => {
  const { toUserId, message } = req.body;
  db.run('INSERT INTO messages (from_user_id, to_user_id, message) VALUES (?, ?, ?)', 
    [req.user.id, toUserId, message], (err) => {
      if (err) return res.send('Error sending message');
      res.redirect('/messages/inbox');
    });
});

// Inbox
router.get('/inbox', authenticateToken, (req, res) => {
  db.all(`SELECT m.*, u.email as from_email 
          FROM messages m 
          JOIN users u ON m.from_user_id = u.id 
          WHERE m.to_user_id = ? 
          ORDER BY m.created_at DESC`, [req.user.id], (err, rows) => {
    if (err) {
      console.error(err);
      return res.send('Error loading messages');
    }
    res.render('inbox', { user: req.user, messages: rows });
  });
});

// Educational Note: Parameterized queries prevent SQL injection attacks.

module.exports = router;
