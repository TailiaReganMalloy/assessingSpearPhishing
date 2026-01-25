const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const messageController = require('./messageController');

// Get all messages
router.get('/', authMiddleware, messageController.getMessages);

// Create a new message
router.post('/', authMiddleware, messageController.createMessage);

module.exports = router;