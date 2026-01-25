const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const passport = require('passport');

// Route to view messages
router.get('/messages', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const messages = await Message.find({ recipient: req.user.id }).populate('sender', 'email');
    res.json(messages);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;