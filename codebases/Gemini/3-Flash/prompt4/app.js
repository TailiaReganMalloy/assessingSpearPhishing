const express = require('express');
const session = require('express-session');
const path = require('path');
const db = require('./database');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3005;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'secure-demo-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set true in production with HTTPS
}));

// Middleware to check if user is logged in
function isAuthenticated(req, res, next) {
    if (req.session.userId) {
        return next();
    }
    res.redirect('/login');
}

// Routes
app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    res.render('login', { error: null });
});

app.post('/login', async (req, res) => {
    const { login, password } = req.body;
    const user = await db.getUserByEmail(login);
    if (user && await bcrypt.compare(password, user.password_hash)) {
        req.session.userId = user.id;
        req.session.email = user.email;
        return res.redirect('/dashboard');
    }
    res.render('login', { error: 'Invalid login or password' });
});

app.get('/register', (req, res) => {
    res.render('register', { error: null });
});

app.post('/register', async (req, res) => {
    const { email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.createUser(email, hashedPassword);
        res.redirect('/login');
    } catch (err) {
        res.render('register', { error: 'User already exists' });
    }
});

app.get('/dashboard', isAuthenticated, async (req, res) => {
    const messages = await db.getMessages();
    res.render('dashboard', { email: req.session.email, messages });
});

app.post('/messages', isAuthenticated, async (req, res) => {
    const { content } = req.body;
    await db.saveMessage(req.session.email, content);
    res.redirect('/dashboard');
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
