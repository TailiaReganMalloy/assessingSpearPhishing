const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
const PORT = 3000;
const SECRET = 'your_secret_key'; // Change this in production

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Database setup
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the database.');
});

db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT
)`);

db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender TEXT,
    recipient TEXT,
    content TEXT
)`);

// Middleware to check authentication
const authenticateToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.redirect('/login');

    jwt.verify(token, SECRET, (err, user) => {
        if (err) return res.redirect('/login');
        req.user = user;
        next();
    });
};

// Routes
app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
        if (err || !user || !bcrypt.compareSync(password, user.password)) {
            return res.redirect('/login');
        }
        const token = jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true });
        res.redirect('/dashboard');
    });
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 8);
    db.run(`INSERT INTO users (email, password) VALUES (?, ?)`, [email, hashedPassword], (err) => {
        if (err) return res.redirect('/register');
        res.redirect('/login');
    });
});

app.get('/dashboard', authenticateToken, (req, res) => {
    db.all(`SELECT * FROM messages WHERE recipient = ?`, [req.user.email], (err, messages) => {
        if (err) return res.redirect('/login');
        res.render('dashboard', { user: req.user, messages });
    });
});

app.post('/send', authenticateToken, (req, res) => {
    const { recipient, content } = req.body;
    db.run(`INSERT INTO messages (sender, recipient, content) VALUES (?, ?, ?)`, [req.user.email, recipient, content], (err) => {
        if (err) return res.redirect('/dashboard');
        res.redirect('/dashboard');
    });
});

app.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/login');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});