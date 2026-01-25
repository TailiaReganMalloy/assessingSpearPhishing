const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const messageController = require('../controllers/messageController');

// Protected routes
router.use(authController.protect);

router.post('/messages', messageController.sendMessage);
router.get('/messages/:userId', messageController.getMessages);

module.exports = router;
