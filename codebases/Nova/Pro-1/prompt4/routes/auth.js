const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');

router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  const user = new User({ email, password });
  await user.save();
  res.send('User registered');
});

router.post('/login', passport.authenticate('local'), (req, res) => {
  res.send('User logged in');
});

module.exports = router;