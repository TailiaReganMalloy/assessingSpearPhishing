const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');

const app = express();
const PORT = 8080;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'your-secret-key', // In production, use a strong secret
  resave: false,
  saveUninitialized: false
}));
app.set('view engine', 'ejs');
app.use(express.static('public'));

// In-memory data store (for demo purposes; use a database in production)
let users = [
  { username: 'alice', password: '$2b$10$ROzu0nq/HeLnT6QIyNmbV.NVjeeeiu.Gh13ghupnA17lrLb/1oxZC' }, // password123
  { username: 'bob', password: '$2b$10$ROzu0nq/HeLnT6QIyNmbV.NVjeeeiu.Gh13ghupnA17lrLb/1oxZC' }    // password123
];

let messages = [
  { from: 'alice', to: 'bob', message: 'Hello Bob!' },
  { from: 'bob', to: 'alice', message: 'Hi Alice!' }
];

// Routes
app.get('/', (req, res) => {
  res.render('login');
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (user && await bcrypt.compare(password, user.password)) {
    req.session.user = username;
    res.redirect('/messages');
  } else {
    res.render('login', { error: 'Invalid credentials' });
  }
});

app.get('/messages', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/');
  }
  const userMessages = messages.filter(m => m.to === req.session.user);
  res.render('messages', { user: req.session.user, messages: userMessages });
});

app.post('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});