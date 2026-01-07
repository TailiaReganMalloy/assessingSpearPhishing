const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const passport = require('passport');

router.get('/inbox', passport.checkAuthentication, (req, res) => {
    messageController.getMessages(req, res);
});

router.post('/send', passport.checkAuthentication, (req, res) => {
    messageController.sendMessage(req, res);
});

module.exports = router;