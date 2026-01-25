const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authenticateToken } = require('../middleware/authenticateToken');

router.post('/', authenticateToken, messageController.sendMessage);
router.get('/', authenticateToken, messageController.getMessages);

module.exports = router;