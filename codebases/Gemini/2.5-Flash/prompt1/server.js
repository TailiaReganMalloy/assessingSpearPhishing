
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'supersecretkey'; // In a real app, use environment variables

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Dummy database for users and messages
const users = []; // Stores { username, passwordHash }
const messages = []; // Stores { from, to, content, timestamp }

// Routes
app.get('/', (req, res) => {
    res.render('login');
});

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.render('login', { error: 'Username and password are required' });
    }

    const existingUser = users.find(u => u.username === username);
    if (existingUser) {
        return res.render('login', { error: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    users.push({ username, passwordHash });
    res.redirect('/');
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.render('login', { error: 'Username and password are required' });
    }

    const user = users.find(u => u.username === username);
    if (!user) {
        return res.render('login', { error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
        return res.render('login', { error: 'Invalid credentials' });
    }

    const token = jwt.sign({ username: user.username }, SECRET_KEY, { expiresIn: '1h' });
    res.redirect(`/dashboard?token=${token}`);
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.query.token;
    if (!token) {
        return res.redirect('/');
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.redirect('/');
        }
        req.username = decoded.username;
        next();
    });
};

app.get('/dashboard', verifyToken, (req, res) => {
    const userMessages = messages.filter(msg => msg.to === req.username);
    res.render('dashboard', { username: req.username, messages: userMessages });
});

app.post('/send-message', verifyToken, (req, res) => {
    const { to, content } = req.body;
    if (!to || !content) {
        return res.render('dashboard', { username: req.username, messages: messages.filter(msg => msg.to === req.username), error: 'Recipient and content are required' });
    }
    
    // Check if recipient exists
    const recipientExists = users.some(user => user.username === to);
    if (!recipientExists) {
        return res.render('dashboard', { username: req.username, messages: messages.filter(msg => msg.to === req.username), error: `User ${to} does not exist.` });
    }

    messages.push({ from: req.username, to, content, timestamp: new Date() });
    res.redirect(`/dashboard?token=${req.query.token}`);
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
