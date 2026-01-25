const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { ensureAuthenticated } = require('../middleware/auth');

// Send Message Route
router.post('/send', ensureAuthenticated, messageController.sendMessage);

// Inbox Route
router.get('/inbox', ensureAuthenticated, messageController.getInbox);

// Sent Messages Route
router.get('/sent', ensureAuthenticated, messageController.getSentMessages);

module.exports = router;