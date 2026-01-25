const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: 'blue-mind-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true in production with HTTPS
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// In-memory user storage (replace with database in production)
const users = [
  {
    id: 1,
    username: 'admin',
    password: '$2a$10$8K1pIlOuJqVIvVjZQ5BzQOJY5K5K5K5K5K5K5K5K5K5K5K5K5K5K5', // Hashed password for 'password123'
    email: 'admin@bluemind.com'
  },
  {
    id: 2,
    username: 'user1',
    password: '$2a$10$8K1pIlOuJqVIvVjZQ5BzQOJY5K5K5K5K5K5K5K5K5K5K5K5K5K5K5', // Hashed password for 'password123'
    email: 'user1@bluemind.com'
  }
];

// In-memory message storage (replace with database in production)
let messages = [
  {
    id: 1,
    from: 'admin',
    to: 'user1',
    subject: 'Welcome to BlueMind',
    content: 'Welcome to the BlueMind platform! We hope you enjoy using our services.',
    timestamp: new Date()
  },
  {
    id: 2,
    from: 'user1',
    to: 'admin',
    subject: 'Thank you',
    content: 'Thank you for the great service!',
    timestamp: new Date()
  }
];

// Routes
app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.post('/login', async (req, res) => {
  const { username, password, computerType } = req.body;
  
  // Find user
  const user = users.find(u => u.username === username);
  
  if (!user) {
    return res.status(401).send('Invalid credentials');
  }
  
  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password);
  
  if (!isValidPassword) {
    return res.status(401).send('Invalid credentials');
  }
  
  // Create JWT token
  const token = jwt.sign(
    { userId: user.id, username: user.username },
    'blue-mind-secret-key',
    { expiresIn: '1h' }
  );
  
  // Store session
  req.session.userId = user.id;
  req.session.username = user.username;
  
  // Redirect to dashboard
  res.redirect('/dashboard');
});

app.get('/dashboard', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  
  res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});

app.get('/messages', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).send('Unauthorized');
  }
  
  // Get messages for the logged-in user
  const userMessages = messages.filter(msg => msg.to === req.session.username);
  
  res.json(userMessages);
});

app.post('/send-message', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).send('Unauthorized');
  }
  
  const { to, subject, content } = req.body;
  
  // Create new message
  const newMessage = {
    id: messages.length + 1,
    from: req.session.username,
    to: to,
    subject: subject,
    content: content,
    timestamp: new Date()
  };
  
  messages.push(newMessage);
  
  res.json({ success: true, message: 'Message sent successfully' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});