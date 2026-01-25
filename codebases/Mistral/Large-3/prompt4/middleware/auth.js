"use strict";

// Authentication middleware
const ensureAuthenticated = (req, res, next) => {
    if (req.session && req.session.userId) {
        return next();
    }
    req.flash('error_msg', 'Please log in to view this page');
    res.redirect('/login');
};

// Guest middleware (prevent logged-in users from accessing auth pages)
const ensureGuest = (req, res, next) => {
    if (!req.session || !req.session.userId) {
        return next();
    }
    res.redirect('/dashboard');
};

module.exports = {
    ensureAuthenticated,
    ensureGuest
};