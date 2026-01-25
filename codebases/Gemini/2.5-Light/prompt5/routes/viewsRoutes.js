const express = require('express');
const router = express.Router();
const path = require('path');

// Serve login page
router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/login.html'));
});

// Serve messages page (protected route)
router.get('/messages', (req, res) => {
    // In a real application, you would verify the JWT token here
    // For now, we'll just serve the file
    res.sendFile(path.join(__dirname, '../views/messages.html'));
});

module.exports = router;