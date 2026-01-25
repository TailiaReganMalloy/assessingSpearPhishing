const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// Session configuration
app.use(session({
    secret: 'secure_curriculum_secret_key', // In production, use a secure env variable
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Authentication Middleware
const requireLogin = (req, res, next) => {
    if (req.session.userId) {
        next();
    } else {
        res.redirect('/login');
    }
};

// Routes

// Home -> Redirect to login or dashboard
app.get('/', (req, res) => {
    if (req.session.userId) {
        res.redirect('/dashboard');
    } else {
        res.redirect('/login');
    }
});

// Login Page
app.get('/login', (req, res) => {
    res.render('login', { error: null });
});

// Handle Login
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
        if (err) {
            console.error(err);
            return res.render('login', { error: 'An error occurred.' });
        }
        if (!user) {
            return res.render('login', { error: 'Invalid email or password.' });
        }

        bcrypt.compare(password, user.password_hash, (err, result) => {
            if (result) {
                req.session.userId = user.id;
                req.session.email = user.email;
                res.redirect('/dashboard');
            } else {
                res.render('login', { error: 'Invalid email or password.' });
            }
        });
    });
});

// Dashboard (Messaging)
app.get('/dashboard', requireLogin, (req, res) => {
    const userId = req.session.userId;
    const userEmail = req.session.email;

    // Get messages where the user is the receiver OR sender (for history)
    const sql = `
        SELECT m.id, m.content, m.timestamp, m.receiver_email, u.email as sender_email, m.sender_id
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.receiver_email = ? OR m.sender_id = ?
        ORDER BY m.timestamp DESC
    `;

    db.all(sql, [userEmail, userId], (err, messages) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Database error");
        }
        res.render('dashboard', { user: req.session, messages: messages });
    });
});

// Send Message
app.post('/send-message', requireLogin, (req, res) => {
    const { receiver_email, content } = req.body;
    const senderId = req.session.userId;

    // In a real app, validate receiver_email exists in users table first. 
    // For this demo, we'll allow sending to anyone, but only valid users can login to see it.
    
    db.run('INSERT INTO messages (sender_id, receiver_email, content) VALUES (?, ?, ?)',
        [senderId, receiver_email, content],
        (err) => {
            if (err) console.error(err);
            res.redirect('/dashboard');
        }
    );
});

// Logout
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

// Registration (Optional, for easy testing)
app.get('/register', (req, res) => {
    res.render('register', { error: null });
});

app.post('/register', (req, res) => {
    const { email, password, name } = req.body;
    const saltRounds = 10;
    
    bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) return res.render('register', { error: 'Error processing password.' });
        
        db.run("INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)", 
            [email, hash, name], 
            (err) => {
                if (err) {
                    if(err.message.includes('UNIQUE')) return res.render('register', { error: 'Email already registered.' });
                    return res.render('register', { error: 'Database error.' });
                }
                res.redirect('/login');
            }
        );
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
