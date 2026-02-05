const bcrypt = require('bcrypt');

// In a real application, this would be stored in a database
const users = [
  {
    id: 1,
    login: 'student',
    // Password is 'password123' hashed with bcrypt
    password: '$2b$10$rOzJqQZ8QxN.6vE6.6Z.6u6Z6Z6Z6Z6Z6Z6Z6Z6Z6Z6Z6Z6Z6Z6Z6'
  },
  {
    id: 2,
    login: 'admin',
    // Password is 'admin123' hashed with bcrypt
    password: '$2b$10$wHjp1EsUJLC././././././././././.Hjp1EsUJLC.EsUJLC.'
  }
];

// In a real application, this would be stored in a database
const messages = [
  {
    id: 1,
    from: 'Admin',
    to: 1, // student
    content: 'Welcome to BlueMind v5! This is a secure messaging platform for educational purposes.',
    date: '2026-01-22 10:30:00'
  },
  {
    id: 2,
    from: 'System',
    to: 1, // student
    content: 'Please remember to logout when using public computers for security reasons.',
    date: '2026-01-22 09:15:00'
  }
];

// Show login page
exports.showLogin = (req, res) => {
  // If user is already logged in, redirect to home
  if (req.session.userId) {
    return res.redirect('/');
  }
  
  res.render('login');
};

// Handle login form submission
exports.login = async (req, res) => {
  const { login, password, computerType } = req.body;
  
  // Find user by login
  const user = users.find(u => u.login === login);
  
  // Check if user exists and password is correct
  if (user && await bcrypt.compare(password, user.password)) {
    // Store user info in session
    req.session.userId = user.id;
    req.session.userLogin = user.login;
    
    // Adjust session expiration based on computer type
    if (computerType === 'public') {
      // Shorter session for public computers (5 minutes)
      req.session.cookie.maxAge = 1000 * 60 * 5;
    } else {
      // Longer session for private computers (30 minutes)
      req.session.cookie.maxAge = 1000 * 60 * 30;
    }
    
    // Redirect to home page
    res.redirect('/');
  } else {
    // Render login page with error message
    res.render('login', { 
      errorMessage: 'Invalid login credentials',
      csrfToken: req.csrfToken()
    });
  }
};

// Handle logout
exports.logout = (req, res) => {
  // Destroy session
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    // Redirect to login page
    res.redirect('/login');
  });
};

// Redirect to home if authenticated, otherwise to login
exports.redirectToHome = (req, res) => {
  if (req.session.userId) {
    // Get user messages
    const userMessages = messages.filter(msg => msg.to === req.session.userId);
    
    res.render('home', {
      user: {
        id: req.session.userId,
        login: req.session.userLogin
      },
      messages: userMessages
    });
  } else {
    res.redirect('/login');
  }
};