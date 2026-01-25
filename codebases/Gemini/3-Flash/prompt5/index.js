const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'secure-web-messaging-secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Mock database
const users = [
    {
        id: 1,
        email: 'email@bluemind.net',
        password: bcrypt.hashSync('password123', 10),
        messages: [
            { id: 101, from: 'Admin', subject: 'Welcome', body: 'Welcome to BlueMind Messaging.' },
            { id: 102, from: 'IT Support', subject: 'System Update', body: 'The system will be undergoing maintenance tonight.' }
        ]
    }
];

// Routes
app.get('/', (req, res) => {
    if (req.session.userId) {
        return res.redirect('/dashboard');
    }
    res.render('login', { error: null });
});

app.post('/login', (req, res) => {
    const { login, password } = req.body;
    const user = users.find(u => u.email === login);

    if (user && bcrypt.compareSync(password, user.password)) {
        req.session.userId = user.id;
        res.redirect('/dashboard');
    } else {
        res.render('login', { error: 'Invalid login or password' });
    }
});

app.get('/dashboard', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/');
    }
    const user = users.find(u => u.id === req.session.userId);
    res.render('dashboard', { user });
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
