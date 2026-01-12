const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Register a new user
exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.render('register', { error: 'Username already exists' });
    }

    const user = new User({ username, password });
    await user.save();

    res.redirect('/login');
  } catch (err) {
    res.render('register', { error: 'Registration failed. Please try again.' });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { username, password, computerType } = req.body;
    const user = await User.findOne({ username });

    if (!user || !(await user.comparePassword(password))) {
      return res.render('login', { error: 'Invalid username or password' });
    }

    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
    req.session.token = token;
    req.session.cookie.maxAge = computerType === 'private' ? 30 * 24 * 60 * 60 * 1000 : 60 * 60 * 1000; // 30 days or 1 hour

    res.redirect('/dashboard');
  } catch (err) {
    res.render('login', { error: 'Login failed. Please try again.' });
  }
};

// Logout user
exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
};