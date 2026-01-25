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

app.use(session({
    secret: 'my-secret-key-123',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Routes
app.get('/', (req, res) => {
    if (req.session.userId) {
        return res.redirect('/dashboard');
    }
    res.redirect('/login');
});

// Login Page
app.get('/login', (req, res) => {
    res.render('login', { error: null });
});

// Register Page (for student testing)
app.get('/register', (req, res) => {
    res.render('register', { error: null });
});

app.post('/register', async (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(`INSERT INTO users (email, password) VALUES (?, ?)`, [email, hashedPassword], (err) => {
        if (err) {
            return res.render('register', { error: 'User already exists' });
        }
        res.redirect('/login');
    });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
        if (err || !user) {
            return res.render('login', { error: 'Invalid email or password' });
        }

        const match = await bcrypt.compare(password, user.password);
        if (match) {
            req.session.userId = user.id;
            req.session.email = user.email;
            res.redirect('/dashboard');
        } else {
            res.render('login', { error: 'Invalid email or password' });
        }
    });
});

// Dashboard (Messages)
app.get('/dashboard', (req, res) => {
    if (!req.session.userId) return res.redirect('/login');

    const userId = req.session.userId;
    // Get messages sent to this user
    db.all(`
        SELECT messages.*, users.email as sender_email 
        FROM messages 
        JOIN users ON messages.sender_id = users.id 
        WHERE receiver_id = ? 
        ORDER BY timestamp DESC`, 
        [userId], (err, messages) => {
            
        // Also get list of other users to send messages to
        db.all(`SELECT id, email FROM users WHERE id != ?`, [userId], (err, users) => {
            res.render('dashboard', { 
                userColor: '#007bff', 
                email: req.session.email, 
                messages: messages,
                usersList: users
            });
        });
    });
});

// Send Message
app.post('/send', (req, res) => {
    if (!req.session.userId) return res.status(401).send('Unauthorized');

    const { receiver_id, content } = req.body;
    const sender_id = req.session.userId;

    db.run(`INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)`, 
        [sender_id, receiver_id, content], (err) => {
        if (err) return res.send('Error sending message');
        res.redirect('/dashboard');
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
