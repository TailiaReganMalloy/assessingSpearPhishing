const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');

/**
 * GET /api/users
 * Retrieve all users (for message recipient selection)
 */
router.get('/', (req, res) => {
  db.all(
    'SELECT id, email, full_name FROM users WHERE id != ? ORDER BY full_name',
    [req.user.id],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch users' });
      }
      res.json(rows);
    }
  );
});

/**
 * GET /api/users/profile/:id
 * Get user profile information
 */
router.get('/profile/:id', (req, res) => {
  db.get(
    'SELECT id, email, full_name, created_at FROM users WHERE id = ?',
    [req.params.id],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch user' });
      }
      if (!row) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(row);
    }
  );
});

module.exports = router;
