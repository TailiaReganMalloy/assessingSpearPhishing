const express = require('express');
const bcrypt = require('bcrypt');
const users = require('../data/users.json');

const router = express.Router();

router.get('/login', (req, res) => {
    res.render('login', { error: null });
});

router.post('/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);

    if (user) {
        bcrypt.compare(password, user.password, (err, result) => {
            if (result) {
                req.session.userId = user.id;
                req.session.email = user.email;
                res.redirect('/dashboard');
            } else {
                res.render('login', { error: 'Invalid email or password' });
            }
        });
    } else {
        res.render('login', { error: 'Invalid email or password' });
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

module.exports = router;
