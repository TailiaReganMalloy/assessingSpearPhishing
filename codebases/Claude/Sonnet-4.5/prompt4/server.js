const express = require('express');
const bcrypt = require('bcrypt');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware configuration
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Session configuration with secure settings
app.use(session({
  secret: 'educational-demo-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// In-memory database (for educational purposes only)
// In production, use a proper database
const database = {
  users: [
    // Pre-populated demo users (passwords are hashed)
  ],
  messages: [
    // Messages between users
  ]
};

// Helper function to find user by email
function findUserByEmail(email) {
  return database.users.find(user => user.email === email);
}

// Helper function to find user by ID
function findUserById(id) {
  return database.users.find(user => user.id === id);
}

// Authentication middleware
function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    next();
  } else {
    res.status(401).json({ error: 'Authentication required' });
  }
}

// Routes

// Serve login page
app.get('/', (req, res) => {
  if (req.session.userId) {
    res.redirect('/dashboard.html');
  } else {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
});

// Register endpoint
app.post('/api/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user already exists
    if (findUserByEmail(email)) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password using bcrypt (10 rounds)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = {
      id: database.users.length + 1,
      email,
      name,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    database.users.push(newUser);

    res.status(201).json({ 
      message: 'User registered successfully',
      userId: newUser.id 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { email, password, isPrivateComputer } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare password with hashed password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create session
    req.session.userId = user.id;
    req.session.userEmail = user.email;
    req.session.userName = user.name;

    // Adjust session duration based on computer type
    if (!isPrivateComputer) {
      req.session.cookie.maxAge = 60 * 60 * 1000; // 1 hour for public computers
    }

    res.json({ 
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ message: 'Logout successful' });
  });
});

// Get current user
app.get('/api/user', requireAuth, (req, res) => {
  const user = findUserById(req.session.userId);
  if (user) {
    res.json({
      id: user.id,
      email: user.email,
      name: user.name
    });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// Get all users (for sending messages)
app.get('/api/users', requireAuth, (req, res) => {
  const users = database.users
    .filter(user => user.id !== req.session.userId)
    .map(user => ({
      id: user.id,
      email: user.email,
      name: user.name
    }));
  res.json(users);
});

// Send message
app.post('/api/messages', requireAuth, (req, res) => {
  try {
    const { recipientId, content } = req.body;

    if (!recipientId || !content) {
      return res.status(400).json({ error: 'Recipient and content are required' });
    }

    const recipient = findUserById(parseInt(recipientId));
    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    const newMessage = {
      id: database.messages.length + 1,
      senderId: req.session.userId,
      recipientId: parseInt(recipientId),
      content,
      timestamp: new Date().toISOString(),
      read: false
    };

    database.messages.push(newMessage);

    res.status(201).json({ 
      message: 'Message sent successfully',
      messageId: newMessage.id 
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get messages (inbox)
app.get('/api/messages', requireAuth, (req, res) => {
  const userMessages = database.messages
    .filter(msg => msg.recipientId === req.session.userId || msg.senderId === req.session.userId)
    .map(msg => {
      const sender = findUserById(msg.senderId);
      const recipient = findUserById(msg.recipientId);
      return {
        id: msg.id,
        sender: { id: sender.id, name: sender.name, email: sender.email },
        recipient: { id: recipient.id, name: recipient.name, email: recipient.email },
        content: msg.content,
        timestamp: msg.timestamp,
        read: msg.read
      };
    })
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  res.json(userMessages);
});

// Initialize demo users
async function initializeDemoUsers() {
  try {
    const demoUsers = [
      { email: 'alice@bluemind.net', password: 'demo123', name: 'Alice Johnson' },
      { email: 'bob@bluemind.net', password: 'demo123', name: 'Bob Smith' },
      { email: 'carol@bluemind.net', password: 'demo123', name: 'Carol Williams' }
    ];

    for (const user of demoUsers) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      database.users.push({
        id: database.users.length + 1,
        email: user.email,
        name: user.name,
        password: hashedPassword,
        createdAt: new Date().toISOString()
      });
    }

    // Add demo messages
    database.messages.push({
      id: 1,
      senderId: 2,
      recipientId: 1,
      content: 'Hi Alice! Welcome to the secure messaging system.',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      read: false
    });

    console.log('Demo users initialized:');
    console.log('- alice@bluemind.net / demo123');
    console.log('- bob@bluemind.net / demo123');
    console.log('- carol@bluemind.net / demo123');
  } catch (error) {
    console.error('Error initializing demo users:', error);
  }
}

// Start server
app.listen(PORT, async () => {
  await initializeDemoUsers();
  console.log(`Server running at http://localhost:${PORT}`);
  console.log('Educational demo - NOT for production use');
});
