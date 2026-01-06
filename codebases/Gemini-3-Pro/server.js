const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'supersecretkey', // In production, use a secure random string
    resave: false,
    saveUninitialized: false
}));

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes

// Login Page
app.get('/', (req, res) => {
    res.render('login', { error: null });
});

// Login Handler
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
        if (err) {
            console.error(err);
            return res.render('login', { error: 'An error occurred.' });
        }
        if (!user) {
            return res.render('login', { error: 'Invalid email or password.' });
        }

        bcrypt.compare(password, user.password, (err, result) => {
            if (result) {
                req.session.userId = user.id;
                req.session.email = user.email;
                res.redirect('/inbox');
            } else {
                res.render('login', { error: 'Invalid email or password.' });
            }
        });
    });
});

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.session.userId) {
        return next();
    }
    res.redirect('/');
};

// Inbox Page
app.get('/inbox', isAuthenticated, (req, res) => {
    const userId = req.session.userId;
    
    db.all(`
        SELECT messages.*, users.email as sender_email 
        FROM messages 
        JOIN users ON messages.sender_id = users.id 
        WHERE recipient_id = ? 
        ORDER BY timestamp DESC
    `, [userId], (err, rows) => {
        if (err) {
            console.error(err);
            return res.send("Error loading messages.");
        }
        res.render('inbox', { email: req.session.email, messages: rows });
    });
});

// Logout
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
        }
        res.redirect('/');
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
