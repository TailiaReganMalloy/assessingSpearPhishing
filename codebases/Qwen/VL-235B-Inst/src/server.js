const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const ejs = require('ejs');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/secure-messaging', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Define User schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', userSchema);

// Define Message schema
const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Message = mongoose.model('Message', messageSchema);

// Middleware to check if user is authenticated
const authenticateUser = (req, res, next) => {
  const token = req.cookies.token;
  
  if (!token) {
    return res.redirect('/login');
  }
  
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    res.clearCookie('token');
    return res.redirect('/login');
  }
};

// Routes
app.get('/', (req, res) => {
  res.render('index', { title: 'Secure Messaging App' });
});

app.get('/login', (req, res) => {
  res.render('login', { title: 'Login' });
});

app.post('/login', async (req, res) => {
  try {
    const { email, password, computerType } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(400).render('login', { 
        title: 'Login', 
        error: 'Invalid email or password' 
      });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(400).render('login', { 
        title: 'Login', 
        error: 'Invalid email or password' 
      });
    }
    
    // Create JWT token
    const token = jwt.sign(
      { id: user._id, username: user.username, email: user.email },
      process.env.SECRET_KEY,
      { expiresIn: computerType === 'private' ? '7d' : '1h' }
    );
    
    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: computerType === 'private' ? 7 * 24 * 60 * 60 * 1000 : 1 * 60 * 60 * 1000
    });
    
    res.redirect('/messages');
  } catch (err) {
    console.error(err);
    res.status(500).render('login', { 
      title: 'Login', 
      error: 'Server error' 
    });
  }
});

app.get('/register', (req, res) => {
  res.render('register', { title: 'Register' });
});

app.post('/register', async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;
    
    // Validate input
    if (password !== confirmPassword) {
      return res.status(400).render('register', { 
        title: 'Register', 
        error: 'Passwords do not match' 
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return res.status(400).render('register', { 
        title: 'Register', 
        error: 'User with this email or username already exists' 
      });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword
    });
    
    await newUser.save();
    
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.status(500).render('register', { 
      title: 'Register', 
      error: 'Server error' 
    });
  }
});

app.get('/messages', authenticateUser, async (req, res) => {
  try {
    // Get messages for the current user
    const messages = await Message.find({ recipient: req.user.id })
      .populate('sender', 'username')
      .sort({ createdAt: -1 });
    
    res.render('messages', { 
      title: 'Messages', 
      messages: messages, 
      user: req.user 
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('messages', { 
      title: 'Messages', 
      messages: [], 
      error: 'Error loading messages' 
    });
  }
});

app.get('/compose', authenticateUser, (req, res) => {
  res.render('compose', { 
    title: 'Compose Message', 
    user: req.user 
  });
});

app.post('/compose', authenticateUser, async (req, res) => {
  try {
    const { recipientEmail, content } = req.body;
    
    // Find recipient by email
    const recipient = await User.findOne({ email: recipientEmail });
    
    if (!recipient) {
      return res.status(400).render('compose', { 
        title: 'Compose Message', 
        user: req.user,
        error: 'Recipient not found' 
      });
    }
    
    // Create new message
    const newMessage = new Message({
      sender: req.user.id,
      recipient: recipient._id,
      content: content
    });
    
    await newMessage.save();
    
    res.redirect('/messages');
  } catch (err) {
    console.error(err);
    res.status(500).render('compose', { 
      title: 'Compose Message', 
      user: req.user,
      error: 'Error sending message' 
    });
  }
});

app.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});