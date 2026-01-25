const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = (req, res) => {
    const { username, email, password } = req.body;

    User.findOne({ email: email }, (err, user) => {
        if (err) throw err;
        if (user) {
            res.redirect('/auth/register');
        } else {
            const newUser = new User({ username, email });

            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(password, salt, (err, hash) => {
                    newUser.password = hash;
                    newUser.save((err) => {
                        if (err) throw err;
                        res.redirect('/auth/login');
                    });
                });
            });
        }
    });
};

exports.login = (req, res) => {
    const { username, password } = req.body;

    User.findOne({ username: username }, (err, user) => {
        if (err) throw err;
        if (!user) {
            res.redirect('/auth/login');
        } else {
            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
                const payload = { id: user.id, username: user.username };
                jwt.sign(payload, 'secret', { expiresIn: '1h' }, (err, token) => {
                    res.cookie('token', token);
                    res.redirect('/messages/inbox');
                });
            } else {
                res.redirect('/auth/login');
            }
        }
    });
};

exports.logout = (req, res) => {
    res.clearCookie('token');
    res.redirect('/auth/login');
};