const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const db = require('./database.js');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'super_secret_key',
    resave: false,
    saveUninitialized: true,
}));

const isAuthenticated = (req, res, next) => {
    if (req.session.userId) {
        next();
    } else {
        res.redirect('/login');
    }
};

app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    res.render('login', { error: null });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
        if (err) {
            return res.status(500).send("Server error");
        }
        if (!user) {
            return res.render('login', { error: 'Invalid email or password' });
        }
        bcrypt.compare(password, user.password, (err, result) => {
            if (result) {
                req.session.userId = user.id;
                res.redirect('/dashboard');
            } else {
                res.render('login', { error: 'Invalid email or password' });
            }
        });
    });
});

app.get('/dashboard', isAuthenticated, (req, res) => {
    const userId = req.session.userId;
    db.all(`
        SELECT m.message, u.email as sender_email, m.timestamp 
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.receiver_id = ?
        ORDER BY m.timestamp DESC
    `, [userId], (err, messages) => {
        if (err) {
            return res.status(500).send("Server error");
        }
        db.get('SELECT email FROM users WHERE id = ?', [userId], (err, user) => {
            if (err) {
                return res.status(500).send("Server error");
            }
            res.render('dashboard', { user: user, messages: messages });
        });
    });
});

app.post('/send-message', isAuthenticated, (req, res) => {
    const senderId = req.session.userId;
    const { receiver_email, message } = req.body;

    db.get('SELECT id FROM users WHERE email = ?', [receiver_email], (err, receiver) => {
        if (err) {
            return res.status(500).send("Server error");
        }
        if (!receiver) {
            // Handle case where receiver email doesn't exist
            return res.redirect('/dashboard');
        }
        const receiverId = receiver.id;
        db.run('INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)', [senderId, receiverId, message], (err) => {
            if (err) {
                return res.status(500).send("Server error");
            }
            res.redirect('/dashboard');
        });
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/dashboard');
        }
        res.clearCookie('connect.sid');
        res.redirect('/login');
    });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
