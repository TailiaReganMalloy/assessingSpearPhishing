const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = 3000;

// Database setup
const db = new sqlite3.Database('./bluemind.db', (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )`);
        db.run(`CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender_id INTEGER,
            receiver_id INTEGER,
            content TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (sender_id) REFERENCES users(id),
            FOREIGN KEY (receiver_id) REFERENCES users(id)
        )`);
    }
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Routes
app.get('/', (req, res) => {
    if (req.session.user) {
        res.redirect('/dashboard');
    } else {
        res.render('login', { title: 'BlueMind v5 - Login' });
    }
});

app.get('/dashboard', (req, res) => {
    if (!req.session.user) {
        res.redirect('/');
    } else {
        db.all('SELECT m.*, u.username as sender FROM messages m JOIN users u ON m.sender_id = u.id WHERE m.receiver_id = ?', [req.session.user.id], (err, messages) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error fetching messages');
            } else {
                res.render('dashboard', { title: 'BlueMind v5 - Dashboard', user: req.session.user, messages });
            }
        });
    }
});

app.post('/login', (req, res) => {
    const { username, password, computerType } = req.body;
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error during login');
        } else if (user && bcrypt.compareSync(password, user.password)) {
            req.session.user = user;
            // Set cookie based on computer type
            req.session.cookie.maxAge = computerType === 'private' ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000; // 30 days or 1 day
            res.redirect('/dashboard');
        } else {
            res.render('login', { title: 'BlueMind v5 - Login', error: 'Invalid credentials' });
        }
    });
});

app.post('/register', (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], function(err) {
        if (err) {
            console.error(err);
            res.status(500).send('Error during registration');
        } else {
            req.session.user = { id: this.lastID, username };
            res.redirect('/dashboard');
        }
    });
});

app.post('/send-message', (req, res) => {
    if (!req.session.user) {
        res.status(401).send('Unauthorized');
    } else {
        const { receiver, content } = req.body;
        db.get('SELECT id FROM users WHERE username = ?', [receiver], (err, receiverUser) => {
            if (err || !receiverUser) {
                res.status(404).send('Receiver not found');
            } else {
                db.run('INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)', 
                    [req.session.user.id, receiverUser.id, content], (err) => {
                        if (err) {
                            console.error(err);
                            res.status(500).send('Error sending message');
                        } else {
                            res.redirect('/dashboard');
                        }
                    });
            }
        });
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

app.listen(port, () => {
    console.log(`BlueMind v5 server running on http://localhost:${port}`);
});
