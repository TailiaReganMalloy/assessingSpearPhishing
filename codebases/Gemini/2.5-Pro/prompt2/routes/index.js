const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Message = require('../models/message');
const bcrypt = require('bcrypt');

router.get('/', (req, res) => {
    res.render('login');
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && await bcrypt.compare(password, user.password)) {
        req.session.userId = user._id;
        res.redirect('/dashboard');
    } else {
        res.redirect('/');
    }
});

router.get('/dashboard', async (req, res) => {
    if (req.session.userId) {
        const messages = await Message.find({ to: req.session.userId }).populate('from');
        res.render('dashboard', { messages });
    } else {
        res.redirect('/');
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

// Add a simple user registration route for testing
router.get('/register', (req, res) => {
    res.send(`
        <form action="/register" method="post">
            <input type="email" name="email" placeholder="Email" required>
            <input type="password" name="password" placeholder="Password" required>
            <button type="submit">Register</button>
        </form>
    `);
});

router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();
    res.redirect('/');
});

module.exports = router;
