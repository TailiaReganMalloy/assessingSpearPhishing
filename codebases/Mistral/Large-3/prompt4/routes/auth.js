"use strict";

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { ensureGuest } = require('../middleware/auth');
const { generateToken } = require('../middleware/csrf');

// Login page
router.get('/login', ensureGuest, async (req, res) => {
    const csrfToken = generateToken(res, req);
    res.render('login', {
        title: 'Identification',
        csrfToken,
        email: '',
        errors: req.flash('error')
    });
});

// Login form submission
router.post('/login', ensureGuest, (req, res) => {
    const { email, password, computerType } = req.body;
    
    User.findByEmail(email, (err, user) => {
        if (err) {
            console.error('Login error:', err);
            req.flash('error_msg', 'An error occurred during login');
            return res.redirect('/login');
        }
        
        if (!user) {
            req.flash('error_msg', 'Invalid email or password');
            return res.redirect('/login');
        }
        
        // Verify password
        User.verifyPassword(user, password, (err, isMatch) => {
            if (err) {
                console.error('Password verification error:', err);
                req.flash('error_msg', 'An error occurred during login');
                return res.redirect('/login');
            }
            
            if (!isMatch) {
                req.flash('error_msg', 'Invalid email or password');
                return res.redirect('/login');
            }
            
            // Set session
            req.session.userId = user.id;
            req.session.userEmail = user.email;
            req.session.computerType = computerType; // Store computer type (private/public)
            
            // Redirect to dashboard
            res.redirect('/dashboard');
        });
    });
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        res.redirect('/login');
    });
});

// Registration page
router.get('/register', ensureGuest, async (req, res) => {
    const csrfToken = generateToken(res, req);
    res.render('register', {
        title: 'Register',
        csrfToken,
        errors: req.flash('error')
    });
});

// Registration form submission
router.post('/register', ensureGuest, (req, res) => {
    const { email, password, password2 } = req.body;
    
    // Validate input
    if (!email || !password || !password2) {
        req.flash('error_msg', 'Please fill in all fields');
        return res.redirect('/register');
    }
    
    if (password !== password2) {
        req.flash('error_msg', 'Passwords do not match');
        return res.redirect('/register');
    }
    
    if (password.length < 6) {
        req.flash('error_msg', 'Password must be at least 6 characters');
        return res.redirect('/register');
    }
    
    // Create user
    User.create(email, password, (err, userId) => {
        if (err) {
            console.error('Registration error:', err);
            if (err.message.includes('Email already exists')) {
                req.flash('error_msg', 'Email already registered');
            } else {
                req.flash('error_msg', 'An error occurred during registration');
            }
            return res.redirect('/register');
        }
        
        req.flash('success_msg', 'Registration successful. Please log in.');
        res.redirect('/login');
    });
});

module.exports = router;