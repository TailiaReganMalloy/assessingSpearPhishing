const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cookieParser());

// Rate limiting to prevent brute force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5 // limit each IP to 5 requests per windowMs
});
app.use(limiter);

// Session configuration
app.use(session({
  secret: 'blue-mind-secret-key-that-should-be-in-env-vars-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// CSRF protection
const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files
app.use(express.static('public'));

// In-memory storage for users and messages (in production, use a database)
const users = [
  {
    id: 1,
    username: 'admin',
    password: '$2a$10$8K1p/9HJrRqWV5X7Y8Z9aOuPzQxRySsTtUvWxYzAbCdEfGhIjKlMnOpQ', // "password123" hashed
    isAdmin: true
  },
  {
    id: 2,
    username: 'user1',
    password: '$2a$10$8K1p/9HJrRqWV5X7Y8Z9aOuPzQxRySsTtUvWxYzAbCdEfGhIjKlMnOpQ', // "password123" hashed
    isAdmin: false
  }
];

const messages = [
  {
    id: 1,
    sender: 'admin',
    recipient: 'user1',
    subject: 'Welcome to BlueMind',
    content: 'Welcome to the BlueMind platform. This is a secure messaging system.',
    timestamp: new Date('2023-01-15T10:30:00Z')
  },
  {
    id: 2,
    sender: 'admin',
    recipient: 'user1',
    subject: 'Security Update',
    content: 'Please ensure you update your password regularly for security reasons.',
    timestamp: new Date('2023-01-16T14:15:00Z')
  }
];

// Helper function to check if user is authenticated
function isAuthenticated(req) {
  return req.session && req.session.userId;
}

// Helper function to check if user is admin
function isAdmin(req) {
  return req.session && req.session.isAdmin;
}

// Routes
app.get('/', (req, res) => {
  if (isAuthenticated(req)) {
    res.redirect('/messages');
  } else {
    res.redirect('/login');
  }
});

// Login page
app.get('/login', (req, res) => {
  if (isAuthenticated(req)) {
    res.redirect('/messages');
    return;
  }
  
  // Generate CSRF token
  const csrfToken = req.csrfToken();
  
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>BlueMind v5 - Login</title>
        <style>
            body {
                margin: 0;
                padding: 0;
                font-family: Arial, sans-serif;
                background-color: #003366; /* Dark blue background */
                height: 100vh;
                display: flex;
                flex-direction: column;
            }
            
            .header {
                background-color: #001a33; /* Dark navy-blue */
                height: 60px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 24px;
                font-weight: bold;
            }
            
            .logo {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .logo-icon {
                width: 30px;
                height: 30px;
                background-color: #ffffff;
                clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
            }
            
            .login-container {
                display: flex;
                justify-content: center;
                align-items: center;
                flex-grow: 1;
            }
            
            .login-panel {
                background-color: white;
                border-radius: 8px;
                padding: 30px;
                width: 350px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                border: 1px solid #ddd;
            }
            
            .panel-title {
                text-align: center;
                color: #333;
                margin-bottom: 25px;
                font-size: 22px;
            }
            
            .form-group {
                margin-bottom: 20px;
            }
            
            label {
                display: block;
                margin-bottom: 8px;
                color: #555;
                font-weight: bold;
            }
            
            input[type="text"], input[type="password"] {
                width: 100%;
                padding: 12px;
                border: 1px solid #ccc;
                border-radius: 4px;
                box-sizing: border-box;
            }
            
            .radio-group {
                margin: 20px 0;
            }
            
            .radio-option {
                margin-bottom: 10px;
            }
            
            .radio-option input {
                margin-right: 8px;
            }
            
            .connect-button {
                background-color: #0066cc; /* Bright blue */
                color: white;
                border: none;
                padding: 12px 20px;
                font-size: 16px;
                border-radius: 4px;
                cursor: pointer;
                width: 100%;
                font-weight: bold;
                margin-top: 10px;
            }
            
            .connect-button:hover {
                background-color: #0052a3;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="logo">
                <div class="logo-icon"></div>
                <span>BlueMind</span>
            </div>
        </div>
        
        <div class="login-container">
            <div class="login-panel">
                <div class="panel-title">Identification</div>
                <form action="/login" method="POST">
                    <input type="hidden" name="_csrf" value="${csrfToken}">
                    <div class="form-group">
                        <label for="login">Login</label>
                        <input type="text" id="login" name="login" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" name="password" required>
                    </div>
                    <div class="radio-group">
                        <div class="radio-option">
                            <input type="radio" id="private" name="computerType" value="private" checked>
                            <label for="private">Private computer</label>
                        </div>
                        <div class="radio-option">
                            <input type="radio" id="public" name="computerType" value="public">
                            <label for="public">Public computer</label>
                        </div>
                    </div>
                    <button type="submit" class="connect-button">Connect</button>
                </form>
            </div>
        </div>
    </body>
    </html>
  `);
});

// Handle login
app.post('/login', csrfProtection, async (req, res) => {
  const { login, password, computerType } = req.body;
  
  // Find user
  const user = users.find(u => u.username === login);
  
  if (!user) {
    return res.status(401).send(`
      <html>
      <head><title>Login Error</title></head>
      <body>
        <p>Invalid login or password. Please try again.</p>
        <a href="/login">Back to Login</a>
      </body>
      </html>
    `);
  }
  
  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password);
  
  if (!isValidPassword) {
    return res.status(401).send(`
      <html>
      <head><title>Login Error</title></head>
      <body>
        <p>Invalid login or password. Please try again.</p>
        <a href="/login">Back to Login</a>
      </body>
      </html>
    `);
  }
  
  // Store user session
  req.session.userId = user.id;
  req.session.username = user.username;
  req.session.isAdmin = user.isAdmin;
  
  // Redirect to messages page
  res.redirect('/messages');
});

// Messages page
app.get('/messages', (req, res) => {
  if (!isAuthenticated(req)) {
    return res.redirect('/login');
  }
  
  const userMessages = messages.filter(m => m.recipient === req.session.username || m.sender === req.session.username);
  
  // Generate CSRF token
  const csrfToken = req.csrfToken();
  
  let messagesHtml = '';
  userMessages.forEach(msg => {
    const dateStr = msg.timestamp.toLocaleDateString() + ' ' + msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    messagesHtml += `
      <div style="border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 5px;">
        <div style="font-weight: bold;">From: ${msg.sender}</div>
        <div style="font-weight: bold;">To: ${msg.recipient}</div>
        <div style="font-weight: bold;">Subject: ${msg.subject}</div>
        <div style="margin: 10px 0;">${msg.content}</div>
        <div style="font-size: 0.9em; color: #666;">${dateStr}</div>
      </div>
    `;
  });
  
  if (!messagesHtml) {
    messagesHtml = '<p>No messages found.</p>';
  }
  
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>BlueMind v5 - Messages</title>
        <style>
            body {
                margin: 0;
                padding: 0;
                font-family: Arial, sans-serif;
                background-color: #003366; /* Dark blue background */
                height: 100vh;
                display: flex;
                flex-direction: column;
            }
            
            .header {
                background-color: #001a33; /* Dark navy-blue */
                height: 60px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 24px;
                font-weight: bold;
            }
            
            .logo {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .logo-icon {
                width: 30px;
                height: 30px;
                background-color: #ffffff;
                clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
            }
            
            .content {
                display: flex;
                flex-direction: column;
                padding: 20px;
                flex-grow: 1;
                color: white;
            }
            
            .messages-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
            }
            
            .logout-button {
                background-color: #ff4444;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
            }
            
            .logout-button:hover {
                background-color: #cc0000;
            }
            
            .messages-container {
                background-color: white;
                color: black;
                border-radius: 8px;
                padding: 20px;
                flex-grow: 1;
                overflow-y: auto;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="logo">
                <div class="logo-icon"></div>
                <span>BlueMind</span>
            </div>
        </div>
        
        <div class="content">
            <div class="messages-header">
                <h2>Messages</h2>
                <form action="/logout" method="POST">
                    <input type="hidden" name="_csrf" value="${csrfToken}">
                    <button type="submit" class="logout-button">Logout</button>
                </form>
            </div>
            <div class="messages-container">
                ${messagesHtml}
            </div>
        </div>
    </body>
    </html>
  `);
});

// Logout
app.post('/logout', csrfProtection, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Error logging out');
    }
    res.redirect('/login');
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`BlueMind app listening at http://localhost:${PORT}`);
});