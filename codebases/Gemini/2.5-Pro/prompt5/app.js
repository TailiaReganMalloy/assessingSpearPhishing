const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./db/database');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const secretKey = 'your_secret_key';

app.get('/', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
        if (err) {
            return res.status(500).send('Error on the server.');
        }
        if (!user) {
            return res.status(404).send('No user found.');
        }

        bcrypt.compare(password, user.password, (err, result) => {
            if (err || !result) {
                return res.status(401).send('Invalid password.');
            }

            const token = jwt.sign({ id: user.id }, secretKey, {
                expiresIn: 86400 // 24 hours
            });

            res.cookie('token', token, { httpOnly: true });
            res.redirect('/dashboard');
        });
    });
});

app.get('/dashboard', (req, res) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).redirect('/');
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(500).send('Failed to authenticate token.');
        }

        db.all(`SELECT u.email as sender, m.subject, m.message, m.timestamp FROM messages m JOIN users u ON m.sender_id = u.id WHERE m.recipient_id = ? ORDER BY m.timestamp DESC`, [decoded.id], (err, messages) => {
            if (err) {
                return res.status(500).send('Error on the server.');
            }
            res.render('dashboard', { messages });
        });
    });
});

app.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
