const express = require('express');
const router = express.Router();
const User = require('../models/User');
const passport = require('passport');

// Registration route
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });
    user = new User({ email, password });
    await user.save();
    res.json({ msg: 'Registration successful' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Login route
router.post('/login', passport.authenticate('local'), (req, res) => {
  res.json({ msg: 'Login successful' });
});

module.exports = router;