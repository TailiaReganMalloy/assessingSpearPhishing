const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

// Send a message
router.post('/send', messageController.sendMessage);

// Get all messages
router.get('/', messageController.getMessages);

module.exports = router;