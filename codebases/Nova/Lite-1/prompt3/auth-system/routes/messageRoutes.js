const express = require('express');
const passport = require('passport');
const messageController = require('../controllers/messageController');

const router = express.Router();

router.get('/messages', passport.checkAuthentication, messageController.getMessages);
router.post('/sendMessage', passport.checkAuthentication, messageController.sendMessage);

module.exports = router;