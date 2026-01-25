
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
const PORT = 3000;

// In-memory user and message storage (for demonstration purposes)
const users = [];
const messages = [];

// Set up EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Middleware for parsing request bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Session middleware
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true in production with HTTPS
}));

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
    if (req.session.userId) {
        next();
    } else {
        res.redirect('/login');
    }
}

// Routes
app.get('/', (req, res) => {
    res.redirect('/login');
});

// Login Page
app.get('/login', (req, res) => {
    res.render('login', { error: null });
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);

    if (user && await bcrypt.compare(password, user.password)) {
        req.session.userId = user.id;
        return res.redirect('/messages');
    } else {
        return res.render('login', { error: 'Invalid email or password' });
    }
});

// Register Page
app.get('/register', (req, res) => {
    res.render('register', { error: null });
});

app.post('/register', async (req, res) => {
    const { email, password } = req.body;

    if (users.some(u => u.email === email)) {
        return res.render('register', { error: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { id: users.length + 1, email, password: hashedPassword };
    users.push(newUser);
    req.session.userId = newUser.id;
    res.redirect('/messages');
});

// Messages Page (Protected)
app.get('/messages', isAuthenticated, (req, res) => {
    const currentUser = users.find(u => u.id === req.session.userId);
    res.render('messages', { user: currentUser, messages: messages });
});

app.post('/send-message', isAuthenticated, (req, res) => {
    const { recipientEmail, messageContent } = req.body;
    const sender = users.find(u => u.id === req.session.userId);
    const recipient = users.find(u => u.email === recipientEmail);

    if (recipient) {
        messages.push({ sender: sender.email, recipient: recipient.email, content: messageContent, timestamp: new Date() });
        res.redirect('/messages');
    } else {
        // Handle case where recipient is not found
        res.render('messages', { user: sender, messages: messages, error: 'Recipient not found' });
    }
});

// Logout
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/messages');
        }
        res.clearCookie('connect.sid'); // Clear session cookie
        res.redirect('/login');
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
