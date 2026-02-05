/**
 * Authentication Routes
 * 
 * Handles user login and registration with secure password hashing.
 * This demonstrates best practices for authentication.
 */

const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Path to user data file
const USERS_FILE = path.join(__dirname, '../data/users.json');

/**
 * Helper function to read users from file
 */
function readUsers() {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading users file:', err);
  }
  return [];
}

/**
 * Helper function to write users to file
 */
function writeUsers(users) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (err) {
    console.error('Error writing users file:', err);
  }
}

/**
 * POST /auth/register
 * Register a new user with secure password hashing
 */
router.post('/register', async (req, res) => {
  try {
    const { login, password } = req.body;

    // Validate input
    if (!login || !password) {
      return res.status(400).json({ error: 'Login and password are required' });
    }

    const users = readUsers();

    // Check if user already exists
    if (users.find(u => u.login === login)) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password with bcrypt (10 salt rounds)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user object
    const newUser = {
      id: Date.now().toString(),
      login,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    // Add user to array and save
    users.push(newUser);
    writeUsers(users);

    res.json({ success: true, message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

/**
 * POST /auth/login
 * Authenticate user with login and password
 * Demonstrates secure password comparison with bcrypt
 */
router.post('/login', async (req, res) => {
  try {
    const { login, password, computerType } = req.body;

    // Validate input
    if (!login || !password) {
      return res.status(400).json({ error: 'Login and password are required' });
    }

    const users = readUsers();
    const user = users.find(u => u.login === login);

    // User not found
    if (!user) {
      return res.status(401).json({ error: 'Invalid login or password' });
    }

    // Compare provided password with stored hash
    // This is crucial for security - NEVER compare plain passwords
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid login or password' });
    }

    // Set session data
    req.session.userId = user.id;
    req.session.username = user.login;
    req.session.computerType = computerType || 'private';

    // Note: In a real application, if "public computer" is selected,
    // you might want to implement additional security measures
    // such as shorter session timeouts

    res.json({
      success: true,
      message: 'Login successful',
      redirectUrl: '/dashboard.html'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * GET /auth/check
 * Check if user is currently authenticated
 */
router.get('/check', (req, res) => {
  if (req.session.userId) {
    res.json({
      authenticated: true,
      username: req.session.username,
      userId: req.session.userId
    });
  } else {
    res.json({ authenticated: false });
  }
});

module.exports = router;
