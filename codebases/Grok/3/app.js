const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/message');

const app = express();
const PORT = process.env.PORT || 3000;

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', './views');

// Custom layout middleware
app.use((req, res, next) => {
  res.locals.layout = (layout) => {
    return (content) => {
      return res.render(layout, { body: content, title: res.locals.title || 'BlueMind v5', user: req.user || {} });
    };
  };
  next();
});

// Routes
app.use('/', authRoutes);
app.use('/', messageRoutes);

// Default route
app.get('/', (req, res) => {
  if (req.session.token) {
    res.redirect('/dashboard');
  } else {
    res.redirect('/login');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});