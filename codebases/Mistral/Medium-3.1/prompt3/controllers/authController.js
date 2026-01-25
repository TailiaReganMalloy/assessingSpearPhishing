const User = require('../models/User');

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ username, email, password });
    await user.save();
    res.status(201).redirect('/auth/login');
  } catch (err) {
    res.status(400).render('register', { error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).render('login', { error: 'Invalid credentials' });
    }
    req.session.userId = user._id;
    res.redirect('/messages');
  } catch (err) {
    res.status(500).render('login', { error: err.message });
  }
};

exports.logout = (req, res) => {
  req.session.destroy();
  res.redirect('/auth/login');
};