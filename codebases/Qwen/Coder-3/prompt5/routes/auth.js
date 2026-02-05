const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Show login page
router.get('/login', authController.showLogin);

// Handle login form submission
router.post('/login', authController.login);

// Handle logout
router.post('/logout', authController.logout);

// Redirect root to login if not authenticated
router.get('/', authController.redirectToHome);

module.exports = router;