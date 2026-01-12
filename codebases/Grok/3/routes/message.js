const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authenticateToken = require('../middleware/auth');

router.get('/dashboard', authenticateToken, messageController.viewMessages);
router.post('/send', authenticateToken, messageController.sendMessage);

module.exports = router;