const express = require('express');
const { sendMessage, getMessages } = require('../controllers/messageController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/send', auth, sendMessage);
router.get('/inbox', auth, getMessages);

module.exports = router;