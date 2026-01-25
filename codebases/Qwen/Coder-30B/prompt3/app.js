const express = require('express');
const bcrypt = require('bcrypt');
const session = require('express-session');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.use(session({
  secret: 'blue-mind-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// In-memory storage (in production, use a database)
const users = new Map();
const messages = [];

// Helper function to hash passwords
async function hashPassword(password) {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

// Helper function to verify passwords
async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/login', async (req, res) => {
  const { login, password, computerType } = req.body;
  
  // Find user
  const user = Array.from(users.values()).find(u => u.login === login);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid login or password' });
  }
  
  // Verify password
  const isValid = await verifyPassword(password, user.passwordHash);
  
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid login or password' });
  }
  
  // Set session
  req.session.userId = user.id;
  req.session.login = user.login;
  req.session.computerType = computerType;
  
  res.json({ success: true, redirect: '/dashboard' });
});

app.get('/dashboard', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/');
  }
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/messages', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Return messages for this user
  const userMessages = messages.filter(msg => msg.to === req.session.login);
  res.json(userMessages);
});

app.post('/send-message', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const { to, content } = req.body;
  
  // Validate message content
  if (!to || !content.trim()) {
    return res.status(400).json({ error: 'Recipient and message content are required' });
  }
  
  // Create new message
  const newMessage = {
    id: messages.length + 1,
    from: req.session.login,
    to: to,
    content: content.trim(),
    timestamp: new Date()
  };
  
  messages.push(newMessage);
  res.json({ success: true, message: newMessage });
});

// Registration endpoint
app.post('/register', async (req, res) => {
  const { login, password } = req.body;
  
  // Validate input
  if (!login || !password) {
    return res.status(400).json({ error: 'Login and password are required' });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }
  
  // Check if user already exists
  if (users.has(login)) {
    return res.status(400).json({ error: 'User already exists' });
  }
  
  // Hash password
  const passwordHash = await hashPassword(password);
  
  // Create user
  const newUser = {
    id: users.size + 1,
    login: login,
    passwordHash: passwordHash
  };
  
  users.set(login, newUser);
  
  res.json({ success: true, message: 'User registered successfully' });
});

// Logout endpoint
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Could not log out' });
    }
    res.json({ success: true });
  });
});

app.listen(PORT, () => {
  console.log(`BlueMind v5 server running on http://localhost:${PORT}`);
});