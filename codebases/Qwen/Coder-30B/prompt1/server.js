const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5 // limit each IP to 5 requests per windowMs
});
app.use(limiter);

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'bluemind_v5_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bluemind_v5', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Message Schema
const messageSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  recipient: { type: String, required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  read: { type: Boolean, default: false }
});

const Message = mongoose.model('Message', messageSchema);

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
    res.redirect('/login');
  }
};

// Routes

// Login page
app.get('/login', (req, res) => {
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
                background-color: #001f3f; /* Navy blue header */
                padding: 15px;
                text-align: center;
                color: white;
                font-size: 24px;
                font-weight: bold;
            }
            
            .logo {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
            }
            
            .hexagon {
                width: 30px;
                height: 30px;
                background-color: white;
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
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                width: 350px;
            }
            
            .panel-title {
                text-align: center;
                color: #333;
                margin-bottom: 20px;
                font-size: 20px;
            }
            
            .form-group {
                margin-bottom: 15px;
            }
            
            label {
                display: block;
                margin-bottom: 5px;
                color: #555;
                font-weight: bold;
            }
            
            input[type="text"], input[type="password"] {
                width: 100%;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 4px;
                box-sizing: border-box;
            }
            
            .radio-group {
                margin: 20px 0;
            }
            
            .radio-option {
                margin-bottom: 10px;
            }
            
            .connect-button {
                background-color: #0074D9; /* Bright blue */
                color: white;
                border: none;
                padding: 12px 20px;
                border-radius: 4px;
                cursor: pointer;
                width: 100%;
                font-size: 16px;
                font-weight: bold;
            }
            
            .connect-button:hover {
                background-color: #005fbb;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="logo">
                <div class="hexagon"></div>
                <span>BlueMind</span>
            </div>
        </div>
        
        <div class="login-container">
            <div class="login-panel">
                <div class="panel-title">Identification</div>
                
                <form id="loginForm" action="/login" method="POST">
                    <div class="form-group">
                        <label for="username">Login</label>
                        <input type="text" id="username" name="username" required>
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
app.post('/login', async (req, res) => {
  const { username, password, computerType } = req.body;
  
  try {
    // Find user in database
    const user = await User.findOne({ username });
    
    if (!user) {
      return res.status(401).send('Invalid credentials');
    }
    
    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).send('Invalid credentials');
    }
    
    // Store user session
    req.session.userId = user._id;
    req.session.username = user.username;
    
    // Redirect to dashboard
    res.redirect('/dashboard');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Dashboard page
app.get('/dashboard', isAuthenticated, async (req, res) => {
  try {
    // Get messages for this user
    const messages = await Message.find({ recipient: req.session.username, read: false })
      .sort({ timestamp: -1 });
    
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>BlueMind v5 - Dashboard</title>
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
                  background-color: #001f3f; /* Navy blue header */
                  padding: 15px;
                  text-align: center;
                  color: white;
                  font-size: 24px;
                  font-weight: bold;
              }
              
              .logo {
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  gap: 10px;
              }
              
              .hexagon {
                  width: 30px;
                  height: 30px;
                  background-color: white;
                  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
              }
              
              .dashboard-container {
                  display: flex;
                  flex-direction: column;
                  height: calc(100vh - 60px);
              }
              
              .messages-section {
                  flex: 1;
                  padding: 20px;
                  overflow-y: auto;
              }
              
              .message {
                  background-color: white;
                  padding: 15px;
                  margin-bottom: 10px;
                  border-radius: 8px;
                  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
              }
              
              .message-header {
                  font-weight: bold;
                  margin-bottom: 5px;
                  color: #003366;
              }
              
              .message-content {
                  color: #333;
              }
              
              .message-time {
                  font-size: 12px;
                  color: #666;
                  text-align: right;
                  margin-top: 5px;
              }
              
              .logout-button {
                  background-color: #ff4136;
                  color: white;
                  border: none;
                  padding: 10px 20px;
                  border-radius: 4px;
                  cursor: pointer;
                  margin: 10px;
                  align-self: flex-end;
              }
              
              .logout-button:hover {
                  background-color: #d92215;
              }
          </style>
      </head>
      <body>
          <div class="header">
              <div class="logo">
                  <div class="hexagon"></div>
                  <span>BlueMind</span>
              </div>
          </div>
          
          <div class="dashboard-container">
              <div class="messages-section">
                  <h2>Messages for ${req.session.username}</h2>
                  ${messages.length > 0 ? 
                    messages.map(msg => `
                      <div class="message">
                          <div class="message-header">From: ${msg.sender}</div>
                          <div class="message-content">${msg.content}</div>
                          <div class="message-time">${new Date(msg.timestamp).toLocaleString()}</div>
                      </div>
                    `).join('') : 
                    '<p>No unread messages</p>'
                  }
              </div>
              
              <button class="logout-button" onclick="window.location.href='/logout'">Logout</button>
          </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Could not log out');
    }
    res.redirect('/login');
  });
});

// Create sample users and messages (for demonstration purposes)
app.get('/setup', async (req, res) => {
  try {
    // Create sample users
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    await User.deleteMany({});
    await Message.deleteMany({});
    
    await User.create([
      { username: 'alice', password: hashedPassword },
      { username: 'bob', password: hashedPassword },
      { username: 'charlie', password: hashedPassword }
    ]);
    
    // Create sample messages
    await Message.create([
      { sender: 'alice', recipient: 'bob', content: 'Hello Bob! How are you doing?' },
      { sender: 'bob', recipient: 'alice', content: 'Hi Alice! I am doing great, thanks for asking.' },
      { sender: 'charlie', recipient: 'alice', content: 'Alice, can we meet tomorrow for lunch?' }
    ]);
    
    res.send('Sample data created successfully!');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating sample data');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});