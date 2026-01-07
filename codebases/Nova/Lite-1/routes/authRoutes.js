const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const passport = require('passport');

router.get('/register', (req, res) => {
    res.render('register');
});

router.post('/register', authController.register);

router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/messages/inbox',
    failureRedirect: '/auth/login',
    failureFlash: true
}));

router.get('/logout', authController.logout);

module.exports = router;