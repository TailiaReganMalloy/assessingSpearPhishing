const express = require('express');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Set EJS as view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.use(session({
  secret: 'blueMindSecretKey',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// In-memory storage for users and messages (in production, use a database)
const users = [
  {
    id: 1,
    username: 'admin',
    password: '$2a$10$8K1p/9HJG5Q7X8Y9Z0A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3H4I5J6K7L8M9N0O1P2Q3R4S5T6U7V8W9X0Y1Z2A3B4C5D6E7F8G9H0I1J2K3L4M5N6O7P8Q9R0S1T2U3V4W5X6Y7Z8A9B0C1D2E3F4G5H6I7J8K9L0M1N2O3P4Q5R6S7T8U9V0W1X2Y3Z4A5B6C7D8E9F0G1H2I3J4K5L6M7N8O9P0Q1R2S3T4U5V6W7X8Y9Z0A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3H4I5J6K7L8M9N0O1P2Q3R4S5T6U7V8W9X0Y1Z2A3B4C5D6E7F8G9H0I1J2K3L4M5N6O7P8Q9R0S1T2U3V4W5X6Y7Z8A9B0C1D2E3F4G5H6I7J8K9L0M1N2O3P4Q5R6S7T8U9V0W1X2Y3Z4A5B6C7D8E9F0G1H2I3J4K5L6M7N8O9P0Q1R2S3T4U5V6W7X8Y9Z0', // Hashed password for 'password'
    role: 'admin'
  },
  {
    id: 2,
    username: 'user1',
    password: '$2a$10$8K1p/9HJG5Q7X8Y9Z0A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3H4I5J6K7L8M9N0O1P2Q3R4S5T6U7V8W9X0Y1Z2A3B4C5D6E7F8G9H0I1J2K3L4M5N6O7P8Q9R0S1T2U3V4W5X6Y7Z8A9B0C1D2E3F4G5H6I7J8K9L0M1N2O3P4Q5R6S7T8U9V0W1X2Y3Z4A5B6C7D8E9F0G1H2I3J4K5L6M7N8O9P0Q1R2S3T4U5V6W7X8Y9Z0', // Hashed password for 'password'
    role: 'user'
  }
];

const messages = [
  {
    id: 1,
    sender: 'admin',
    recipient: 'user1',
    subject: 'Welcome to BlueMind',
    content: 'Welcome to the BlueMind platform. This is your first message.',
    timestamp: new Date('2023-01-15T10:30:00Z')
  },
  {
    id: 2,
    sender: 'admin',
    recipient: 'user1',
    subject: 'System Update',
    content: 'We have performed a system update today. Please check the new features.',
    timestamp: new Date('2023-01-16T14:15:00Z')
  }
];

// Routes
app.get('/', (req, res) => {
  // If user is logged in, redirect to messages page
  if (req.session.userId) {
    res.redirect('/messages');
  } else {
    // Otherwise, show login page
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
  }
});

// Login route
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
  
  // Set session
  req.session.userId = user.id;
  req.session.username = user.username;
  req.session.role = user.role;
  
  // Redirect to messages page
  res.redirect('/messages');
});

// Messages route
app.get('/messages', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/');
  }
  
  // Filter messages for this user
  const userMessages = messages.filter(msg => 
    msg.recipient === req.session.username || msg.sender === req.session.username
  );
  
  res.render('messages.ejs', { 
    messages: userMessages, 
    username: req.session.username,
    role: req.session.role
  });
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Could not log out');
    }
    res.redirect('/');
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});