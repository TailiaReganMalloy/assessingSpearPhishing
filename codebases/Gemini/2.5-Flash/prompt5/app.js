
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();
const port = 3000;

// In-memory user store (for demonstration purposes)
const users = [
    {
        email: 'email@bluemind.net',
        passwordHash: '$2b$10$T85oE5t4dE.GvG4XJ.2B7O3z0h0w7d8g9h0i1j2k3l4m5n6o7p8q9r0s1t2u3v4w5x6y7z'
    } // password: 'password'
];

// Session configuration
app.use(session({
    secret: 'your_secret_key', // Replace with a strong secret in a real application
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true in production with HTTPS
}));

// EJS setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Body parser middleware
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
    res.render('login');
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);

    if (user && await bcrypt.compare(password, user.passwordHash)) {
        req.session.isAuthenticated = true;
        req.session.user = user.email;
        res.redirect('/messages');
    } else {
        res.render('login', { error: 'Invalid credentials' });
    }
});

app.get('/messages', (req, res) => {
    if (!req.session.isAuthenticated) {
        return res.redirect('/');
    }
    // Placeholder for messages
    const messages = [
        { sender: 'Admin', subject: 'Welcome!', body: 'Welcome to the secure messaging system.' },
        { sender: 'Support', subject: 'New Feature', body: 'Check out our new features.' }
    ];
    res.render('messages', { user: req.session.user, messages });
});

// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
