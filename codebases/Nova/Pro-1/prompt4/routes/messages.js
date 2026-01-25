const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const passport = require('passport');

router.post('/send', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const { receiver, content } = req.body;
  const message = new Message({
    sender: req.user.id,
    receiver,
    content
  });
  await message.save();
  res.send('Message sent');
});

router.get('/receive', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const messages = await Message.find({ receiver: req.user.id });
  res.send(messages);
});

module.exports = router;