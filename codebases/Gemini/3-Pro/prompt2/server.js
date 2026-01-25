const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// Session configuration
app.use(session({
    secret: 'secret-key-just-for-demo', // In production, use a secure random string
    resave: false,
    saveUninitialized: true
}));

// Authentication Middleware
const requireLogin = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
};

// Routes

// Root
app.get('/', (req, res) => {
    if (req.session.user) {
        res.redirect('/dashboard');
    } else {
        res.redirect('/login');
    }
});

// Login Page
app.get('/login', (req, res) => {
    res.render('login', { error: null });
});

// Login Action
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    
    db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
        if (err) {
            console.error(err);
            return res.render('login', { error: "An error occurred." });
        }
        if (!user) {
            return res.render('login', { error: "Invalid email or password." }); 
        }

        bcrypt.compare(password, user.password, (err, result) => {
            if (result) {
                req.session.user = { id: user.id, email: user.email };
                res.redirect('/dashboard');
            } else {
                res.render('login', { error: "Invalid email or password." });
            }
        });
    });
});

// Register Page
app.get('/register', (req, res) => {
    res.render('register', { error: null });
});

// Register Action
app.post('/register', (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
         return res.render('register', { error: "Email and password are required." });
    }

    const saltRounds = 10;
    bcrypt.hash(password, saltRounds, function(err, hash) {
        if (err) {
            return res.render('register', { error: "Error processing registration." });
        }
        db.run("INSERT INTO users (email, password) VALUES (?, ?)", [email, hash], function(err) {
            if (err) {
                 if (err.message.includes('UNIQUE constraint failed')) {
                     return res.render('register', { error: "Email already exists." });
                 }
                 return res.render('register', { error: "Error creating user." });
            }
            res.redirect('/login');
        });
    });
});

// Dashboard (Inbox)
app.get('/dashboard', requireLogin, (req, res) => {
    const userEmail = req.session.user.email;
    db.all("SELECT * FROM messages WHERE receiver_email = ? ORDER BY timestamp DESC", [userEmail], (err, rows) => {
        if (err) {
            return res.send("Error retrieving messages");
        }
        res.render('dashboard', { user: req.session.user, messages: rows });
    });
});

// Compose Message
app.get('/compose', requireLogin, (req, res) => {
    res.render('compose', { user: req.session.user, error: null, success: null });
});

app.post('/send', requireLogin, (req, res) => {
    const senderEmail = req.session.user.email;
    const { receiver_email, subject, body } = req.body;
    
    db.run("INSERT INTO messages (sender_email, receiver_email, subject, body) VALUES (?, ?, ?, ?)", 
        [senderEmail, receiver_email, subject, body], 
        (err) => {
            if (err) {
                 return res.render('compose', { user: req.session.user, error: "Error sending message.", success: null });
            }
            res.render('compose', { user: req.session.user, error: null, success: "Message sent successfully!" });
        }
    );
});

// Logout
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
