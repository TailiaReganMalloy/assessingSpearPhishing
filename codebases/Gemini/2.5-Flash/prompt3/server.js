
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Database setup
const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )`);
        db.run(`CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender_id INTEGER NOT NULL,
            receiver_id INTEGER NOT NULL,
            message TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (sender_id) REFERENCES users(id),
            FOREIGN KEY (receiver_id) REFERENCES users(id)
        )`);
    }
});

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'supersecretkey',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true in production with HTTPS
}));

// Routes

// Root redirect to login
app.get('/', (req, res) => {
    res.redirect('/login');
});

// Login page
app.get('/login', (req, res) => {
    const errorMessage = req.session.errorMessage;
    req.session.errorMessage = null; // Clear error message after displaying
    res.render('login', { errorMessage });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
        if (err) {
            console.error('Database error during login:', err.message);
            req.session.errorMessage = 'An internal server error occurred.';
            return res.redirect('/login');
        }

        if (user && await bcrypt.compare(password, user.password)) {
            req.session.userId = user.id;
            req.session.username = user.username;
            return res.redirect('/messages');
        } else {
            req.session.errorMessage = 'Invalid username or password.';
            return res.redirect('/login');
        }
    });
});

// Register page (optional, for demo purposes)
app.get('/register', (req, res) => {
    const errorMessage = req.session.errorMessage;
    req.session.errorMessage = null;
    res.render('register', { errorMessage });
});

app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        req.session.errorMessage = 'Username and password are required.';
        return res.redirect('/register');
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], function(err) {
            if (err) {
                console.error('Database error during registration:', err.message);
                if (err.message.includes('UNIQUE constraint failed')) {
                    req.session.errorMessage = 'Username already exists.';
                } else {
                    req.session.errorMessage = 'An internal server error occurred.';
                }
                return res.redirect('/register');
            }
            req.session.userId = this.lastID;
            req.session.username = username;
            return res.redirect('/messages');
        });
    } catch (hashError) {
        console.error('Error hashing password:', hashError);
        req.session.errorMessage = 'An internal server error occurred during password hashing.';
        return res.redirect('/register');
    }
});

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
    if (req.session.userId) {
        next();
    } else {
        res.redirect('/login');
    }
}

// Messages page
app.get('/messages', isAuthenticated, (req, res) => {
    const currentUserId = req.session.userId;
    let messages = [];
    let users = [];

    db.all('SELECT id, username FROM users WHERE id != ?', [currentUserId], (err, rows) => {
        if (err) {
            console.error('Error fetching users:', err.message);
            return res.render('messages', { username: req.session.username, messages: [], users: [], errorMessage: 'Error fetching users.' });
        }
        users = rows;

        const query = `
            SELECT
                m.message,
                m.timestamp,
                s.username AS sender_username,
                r.username AS receiver_username
            FROM messages m
            JOIN users s ON m.sender_id = s.id
            JOIN users r ON m.receiver_id = r.id
            WHERE m.receiver_id = ? OR m.sender_id = ?
            ORDER BY m.timestamp DESC
        `;
        db.all(query, [currentUserId, currentUserId], (err, rows) => {
            if (err) {
                console.error('Error fetching messages:', err.message);
                return res.render('messages', { username: req.session.username, messages: [], users, errorMessage: 'Error fetching messages.' });
            }
            messages = rows;
            res.render('messages', { username: req.session.username, messages, users, errorMessage: null });
        });
    });
});

// Send message
app.post('/send-message', isAuthenticated, (req, res) => {
    const { receiverUsername, message } = req.body;
    const senderId = req.session.userId;

    if (!receiverUsername || !message) {
        req.session.errorMessage = 'Recipient and message are required.';
        return res.redirect('/messages');
    }

    db.get('SELECT id FROM users WHERE username = ?', [receiverUsername], (err, receiver) => {
        if (err) {
            console.error('Database error finding receiver:', err.message);
            req.session.errorMessage = 'An internal server error occurred.';
            return res.redirect('/messages');
        }

        if (!receiver) {
            req.session.errorMessage = 'Recipient user not found.';
            return res.redirect('/messages');
        }

        db.run('INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)', [senderId, receiver.id, message], (err) => {
            if (err) {
                console.error('Database error sending message:', err.message);
                req.session.errorMessage = 'An internal server error occurred.';
                return res.redirect('/messages');
            }
            req.session.errorMessage = 'Message sent successfully!';
            res.redirect('/messages');
        });
    });
});

// Logout
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        res.redirect('/login');
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
