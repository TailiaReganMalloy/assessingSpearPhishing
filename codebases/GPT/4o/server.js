const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

// Database setup
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
    db.run("CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, password TEXT)");
    db.run("CREATE TABLE messages (id INTEGER PRIMARY KEY AUTOINCREMENT, sender_id INTEGER, receiver_id INTEGER, message TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)");
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using https
}));

// Routes
app.get('/', (req, res) => {
    if (req.session.userId) {
        res.redirect('/dashboard');
    } else {
        res.sendFile(path.join(__image_dir, 'views/login.html'));
    }
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__image_dir, 'views/register.html'));
});

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.run("INSERT INTO users (username, password) VALUES (?, ?)", [username, hashedPassword], (err) => {
            if (err) {
                return res.status(400).send("Username already exists");
            }
            res.redirect('/');
        });
    } catch (error) {
        res.status(500).send("Error registering user");
    }
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.get("SELECT * FROM users WHERE username = ?", [username], async (err, user) => {
        if (err || !user) {
            return res.status(400).send("Invalid username or password");
        }
        const match = await bcrypt.compare(password, user.password);
        if (match) {
            req.session.userId = user.id;
            req.session.username = user.username;
            res.redirect('/dashboard');
        } else {
            res.status(400).send("Invalid username or password");
        }
    });
});

app.get('/dashboard', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/');
    }
    res.sendFile(path.join(__image_dir, 'views/dashboard.html'));
});

app.get('/messages', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).send("Unauthorized");
    }
    db.all(`
        SELECT m.*, u.username as sender_name 
        FROM messages m 
        JOIN users u ON m.sender_id = u.id 
        WHERE m.receiver_id = ? 
        ORDER BY m.timestamp DESC`, 
        [req.session.userId], (err, rows) => {
        if (err) {
            return res.status(500).send("Error fetching messages");
        }
        res.json(rows);
    });
});

app.post('/send-message', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).send("Unauthorized");
    }
    const { receiver_username, message } = req.body;
    db.get("SELECT id FROM users WHERE username = ?", [receiver_username], (err, receiver) => {
        if (err || !receiver) {
            return res.status(400).send("Receiver not found");
        }
        db.run("INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)", 
            [req.session.userId, receiver.id, message], (err) => {
            if (err) {
                return res.status(500).send("Error sending message");
            }
            res.redirect('/dashboard');
        });
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

const __image_dir = __dirname;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
