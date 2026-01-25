const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const db = require('./database');
const bcrypt = require('bcrypt');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

app.use(session({
    secret: 'supersecretkeyForBlueMindClone', // In production, this should be in env var
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Middleware to check if user is logged in
const requireLogin = (req, res, next) => {
    if (req.session.userId) {
        next();
    } else {
        res.redirect('/login');
    }
};

app.get('/', (req, res) => {
    if (req.session.userId) {
        res.redirect('/inbox');
    } else {
        res.redirect('/login');
    }
});

app.get('/login', (req, res) => {
    res.render('login', { error: null });
});

app.post('/login', (req, res) => {
    const { login, password } = req.body;
    db.get('SELECT * FROM users WHERE email = ?', [login], (err, user) => {
        if (err) {
            console.error(err);
            return res.render('login', { error: 'An error occurred.' });
        }
        if (!user) {
            return res.render('login', { error: 'Invalid login or password.' });
        }

        if (bcrypt.compareSync(password, user.password)) {
            req.session.userId = user.id;
            req.session.userEmail = user.email;
            res.redirect('/inbox');
        } else {
            res.render('login', { error: 'Invalid login or password.' });
        }
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

app.get('/inbox', requireLogin, (req, res) => {
    db.all('SELECT messages.*, users.email as sender_email FROM messages JOIN users ON messages.sender_id = users.id WHERE recipient_id = ? ORDER BY timestamp DESC', [req.session.userId], (err, messages) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Database error");
        }
        res.render('inbox', { user: req.session.userEmail, messages: messages });
    });
});

app.get('/compose', requireLogin, (req, res) => {
    res.render('compose', { user: req.session.userEmail, error: null, success: null });
});

app.post('/compose', requireLogin, (req, res) => {
    const { recipient, subject, body } = req.body;
    
    db.get('SELECT id FROM users WHERE email = ?', [recipient], (err, user) => {
        if (err) {
             console.error(err);
             return res.render('compose', { user: req.session.userEmail, error: 'Error finding recipient', success: null });
        }
        if (!user) {
            return res.render('compose', { user: req.session.userEmail, error: 'Recipient not found', success: null });
        }

        const stmt = db.prepare('INSERT INTO messages (sender_id, recipient_id, subject, body) VALUES (?, ?, ?, ?)');
        stmt.run(req.session.userId, user.id, subject, body, (err) => {
             if (err) {
                 console.error(err);
                 return res.render('compose', { user: req.session.userEmail, error: 'Error sending message', success: null });
             }
             res.render('compose', { user: req.session.userEmail, error: null, success: 'Message sent successfully!' });
        });
        stmt.finalize();
    });
});

// For demo purposes, route to create a user easily (REMOVE IN PRODUCTION)
app.get('/register', (req, res) => {
    res.render('register', { error: null });
});

app.post('/register', (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    const stmt = db.prepare('INSERT INTO users (email, password) VALUES (?, ?)');
    stmt.run(email, hashedPassword, (err) => {
        if (err) {
            return res.render('register', { error: 'User already exists or error.' });
        }
        res.redirect('/login');
    });
    stmt.finalize();
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
