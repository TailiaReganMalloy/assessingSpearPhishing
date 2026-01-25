const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Render login/registration page
router.get('/', (req, res) => {
  res.render('auth/identification');
});

// Handle registration
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = new User({ email, password });
    await user.save();
    res.redirect('/login');
  } catch (error) {
    console.error(error);
    res.redirect('/register');
  }
});

// Handle login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }); // Find user by email
    if (!user) {
      return res.status(401).send('Invalid credentials');
    }
    
    const isMatch = await user.comparePassword(password); // Compare passwords
    if (!isMatch) {
      return res.status(401).send('Invalid credentials');
    }
    
    // Authentication successful
    req.session.userId = user._id; // Store user ID in session
    res.redirect('/dashboard');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Handle logout
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;