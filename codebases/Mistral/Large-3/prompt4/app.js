"use strict";

const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const securityConfig = require('./config/security');
const { doubleCsrfProtection } = require('./middleware/csrf');

// Initialize Express app
const app = express();

// Database setup - tables are created in init-db.js, so we just need to connect
const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Database connected successfully');
    }
});

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Session configuration
app.use(session({
    secret: securityConfig.session.secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: securityConfig.session.secure,
        maxAge: securityConfig.session.maxAge
    }
}));

// Flash messages
app.use(flash());

// CSRF protection for all routes
app.use(doubleCsrfProtection);

// Custom middleware
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

// Routes
app.use('/', require('./routes/index'));
app.use('/', require('./routes/auth'));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;