const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');
const db = require('./database/db');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'super-secret-key-for-demo',
    resave: false,
    saveUninitialized: false
}));
app.set('view engine', 'ejs');

// Authentication Middleware
const requireLogin = (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    next();
};

// Routes

// Landing / Login
app.get('/', (req, res) => {
    if (req.session.userId) {
        return res.redirect('/dashboard');
    }
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    res.render('login', { error: null });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
        if (err) return res.render('login', { error: 'Database error' });
        if (!user) return res.render('login', { error: 'Invalid credentials' });

        if (bcrypt.compareSync(password, user.password)) {
            req.session.userId = user.id;
            req.session.email = user.email;
            return res.redirect('/dashboard');
        } else {
            return res.render('login', { error: 'Invalid credentials' });
        }
    });
});

app.get('/register', (req, res) => {
    res.render('register', { error: null });
});

app.post('/register', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.render('register', { error: 'All fields required' });
    }
    
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    db.run('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE')) {
                return res.render('register', { error: 'Email already exists' });
            }
            return res.render('register', { error: 'Database error' });
        }
        res.redirect('/login');
    });
});

app.get('/dashboard', requireLogin, (req, res) => {
    db.all(`
        SELECT m.*, u.email as sender_email 
        FROM messages m 
        JOIN users u ON m.sender_id = u.id 
        WHERE receiver_id = ? 
        ORDER BY timestamp DESC
    `, [req.session.userId], (err, messages) => {
        if (err) return res.send("Error retrieving messages");
        res.render('dashboard', { user: req.session.email, messages });
    });
});

app.get('/compose', requireLogin, (req, res) => {
    db.all('SELECT email FROM users WHERE id != ?', [req.session.userId], (err, users) => {
         res.render('compose', { user: req.session.email, users, error: null, success: null });
    });
});

app.post('/send', requireLogin, (req, res) => {
    const { recipient_email, content } = req.body;
    
    db.get('SELECT id FROM users WHERE email = ?', [recipient_email], (err, recipient) => {
        if (err || !recipient) {
             // Re-fetch users for the dropdown
             return db.all('SELECT email FROM users WHERE id != ?', [req.session.userId], (e, users) => {
                res.render('compose', { user: req.session.email, users, error: 'Recipient not found', success: null });
             });
        }

        db.run('INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)', 
            [req.session.userId, recipient.id, content], (err) => {
            if (err) {
                 return db.all('SELECT email FROM users WHERE id != ?', [req.session.userId], (e, users) => {
                    res.render('compose', { user: req.session.email, users, error: 'Failed to send', success: null });
                 });
            }
             db.all('SELECT email FROM users WHERE id != ?', [req.session.userId], (e, users) => {
                res.render('compose', { user: req.session.email, users, error: null, success: 'Message sent!' });
             });
        });
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
