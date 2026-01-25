const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Render login page
router.get('/login', (req, res) => {
  res.render('login', { messages: req.flash() });
});

// Render registration page
router.get('/register', (req, res) => {
  res.render('register', { messages: req.flash() });
});

// Handle registration
router.post('/register', authController.register);

// Handle login
router.post('/login', authController.login);

// Handle logout
router.get('/logout', authController.logout);

module.exports = router;