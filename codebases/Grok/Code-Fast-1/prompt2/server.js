const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = 3001;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
  secret: 'bluemind-secret-key', // In production, use a strong secret
  resave: false,
  saveUninitialized: false
}));
app.use(express.static(path.join(__dirname, 'public')));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware to check if user is logged in
function requireLogin(req, res, next) {
  if (req.session.userId) {
    return next();
  } else {
    res.redirect('/');
  }
}

// Routes
app.get('/', (req, res) => {
  if (req.session.userId) {
    res.redirect('/dashboard');
  } else {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = db.getUserByUsername.get(username);
  if (user && await bcrypt.compare(password, user.password_hash)) {
    req.session.userId = user.id;
    req.session.username = user.username;
    res.redirect('/dashboard');
  } else {
    res.send('Invalid credentials');
  }
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    db.insertUser.run(username, hashedPassword);
    res.send('User registered successfully. <a href="/">Login</a>');
  } catch (err) {
    res.send('Username already exists');
  }
});

app.get('/dashboard', requireLogin, (req, res) => {
  const messages = db.getMessagesForUser.all(req.session.userId);
  const users = db.getAllUsers.all();
  res.render('dashboard', { username: req.session.username, messages, users, currentUserId: req.session.userId });
});

app.post('/send-message', requireLogin, (req, res) => {
  const { to_user, message } = req.body;
  db.insertMessage.run(req.session.userId, to_user, message);
  res.redirect('/dashboard');
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

app.listen(PORT, () => {
  console.log(`BlueMind v5 running on http://localhost:${PORT}`);
});