// Import required modules
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

// Set up middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'your-secret-key', // Change this to a secure random value
    resave: false,
    saveUninitialized: true
}));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Connect to SQLite database
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the database.');
});

// Create tables if they don't exist
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender_id INTEGER NOT NULL,
        receiver_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES users(id),
        FOREIGN KEY (receiver_id) REFERENCES users(id)
    )`);
});

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
    if (req.session.userId) {
        next();
    } else {
        res.redirect('/login');
    }
}

// Routes

// Home route (redirect to messages if logged in)
app.get('/', (req, res) => {
    if (req.session.userId) {
        res.redirect('/messages');
    } else {
        res.redirect('/login');
    }
});

// Registration page
app.get('/register', (req, res) => {
    res.render('register', { error: null });
});

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, hashedPassword], function(err) {
        if (err) {
            return res.render('register', { error: 'Username already exists' });
        }
        req.session.userId = this.lastID;
        res.redirect('/messages');
    });
});

// Login page
app.get('/login', (req, res) => {
    res.render('login', { error: null });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user) => {
        if (err || !user) {
            return res.render('login', { error: 'Invalid username or password' });
        }

        const match = await bcrypt.compare(password, user.password);
        if (match) {
            req.session.userId = user.id;
            res.redirect('/messages');
        } else {
            res.render('login', { error: 'Invalid username or password' });
        }
    });
});

// Logout
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

// Messages page
app.get('/messages', isAuthenticated, (req, res) => {
    const userId = req.session.userId;

    // Get all users for sending messages
    db.all(`SELECT id, username FROM users WHERE id != ?`, [userId], (err, users) => {
        if (err) {
            return res.status(500).send('Error fetching users');
        }

        // Get messages received by the user
        db.all(`SELECT m.content, m.timestamp, u.username AS sender 
                FROM messages m 
                JOIN users u ON m.sender_id = u.id 
                WHERE m.receiver_id = ? 
                ORDER BY m.timestamp DESC`, [userId], (err, messages) => {
            if (err) {
                return res.status(500).send('Error fetching messages');
            }
            res.render('messages', { users, messages });
        });
    });
});

// Send message
app.post('/send', isAuthenticated, (req, res) => {
    const { receiver, content } = req.body;
    const sender = req.session.userId;

    db.run(`INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)`, [sender, receiver, content], (err) => {
        if (err) {
            return res.status(500).send('Error sending message');
        }
        res.redirect('/messages');
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
