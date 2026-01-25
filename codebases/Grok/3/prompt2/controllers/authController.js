const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.getLogin = (req, res) => {
    res.render('login', { title: 'BlueMind v5 - Login' });
};

exports.postLogin = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.render('login', { error: 'Invalid credentials', title: 'BlueMind v5 - Login' });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.render('login', { error: 'Invalid credentials', title: 'BlueMind v5 - Login' });
        }
        const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
        req.session.token = token;
        res.redirect('/dashboard');
    } catch (err) {
        res.render('login', { error: 'Server error', title: 'BlueMind v5 - Login' });
    }
};

exports.getRegister = (req, res) => {
    res.render('register', { title: 'BlueMind v5 - Register' });
};

exports.postRegister = async (req, res) => {
    const { username, password } = req.body;
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.render('register', { error: 'Username already exists', title: 'BlueMind v5 - Register' });
        }
        const user = new User({ username, password });
        await user.save();
        res.redirect('/login');
    } catch (err) {
        res.render('register', { error: 'Server error', title: 'BlueMind v5 - Register' });
    }
};

exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
};