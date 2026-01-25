require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Auth check middleware
const isAuthenticated = (req, res, next) => {
    if (req.session.userId) {
        return next();
    }
    res.redirect('/login');
};

// Routes
app.get('/', (req, res) => {
    res.redirect('/dashboard');
});

// Login Page
app.get('/login', (req, res) => {
    res.render('login', { error: null });
});

// CSRF protection would be good here, but for simplicity we'll focus on password hashing
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

    if (user && bcrypt.compareSync(password, user.password)) {
        req.session.userId = user.id;
        req.session.username = user.username;
        res.redirect('/dashboard');
    } else {
        res.render('login', { error: 'Invalid username or password' });
    }
});

// Register (for demo purposes)
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    try {
        db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run(username, hashedPassword);
        res.redirect('/login');
    } catch (e) {
        res.render('login', { error: 'Username already exists' });
    }
});

// Dashboard
app.get('/dashboard', isAuthenticated, (req, res) => {
    const messages = db.prepare(`
        SELECT m.*, u.username as sender_name 
        FROM messages m 
        JOIN users u ON m.sender_id = u.id 
        WHERE receiver_id = ? 
        ORDER BY timestamp DESC
    `).all(req.session.userId);

    const users = db.prepare('SELECT id, username FROM users WHERE id != ?').all(req.session.userId);
    
    res.render('dashboard', { user: req.session.username, messages, users });
});

// Send message
app.post('/send-message', isAuthenticated, (req, res) => {
    const { receiver_id, content } = req.body;
    db.prepare('INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)').run(
        req.session.userId,
        receiver_id,
        content
    );
    res.redirect('/dashboard');
});

// Logout
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
