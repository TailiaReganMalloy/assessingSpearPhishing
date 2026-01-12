const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const db = require('./db');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'secret-bluemind-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
    if (req.session.userId) {
        return next();
    }
    res.redirect('/login');
}

// Routes
app.get('/', (req, res) => {
    if (req.session.userId) {
        res.redirect('/dashboard');
    } else {
        res.redirect('/login');
    }
});

app.get('/login', (req, res) => {
    res.render('login', { error: null });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
        if (user && bcrypt.compareSync(password, user.password)) {
            req.session.userId = user.id;
            req.session.username = user.username;
            res.redirect('/dashboard');
        } else {
            res.render('login', { error: 'Invalid username or password' });
        }
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

app.get('/dashboard', isAuthenticated, (req, res) => {
    db.all(`
        SELECT m.*, u.username as sender_name 
        FROM messages m 
        JOIN users u ON m.sender_id = u.id 
        WHERE m.receiver_id = ? 
        ORDER BY m.timestamp DESC`, 
    [req.session.userId], (err, messages) => {
        res.render('dashboard', { user: req.session.username, messages });
    });
});

app.post('/send-message', isAuthenticated, (req, res) => {
    const { receiver_username, content } = req.body;
    db.get("SELECT id FROM users WHERE username = ?", [receiver_username], (err, receiver) => {
        if (receiver) {
            db.run("INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)", 
                [req.session.userId, receiver.id, content], (err) => {
                    res.redirect('/dashboard');
                });
        } else {
            res.redirect('/dashboard?error=UserNotFound');
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
