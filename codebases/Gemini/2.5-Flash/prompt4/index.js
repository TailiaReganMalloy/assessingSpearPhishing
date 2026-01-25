const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const app = express();
const port = 3000;

// In-memory user store for demonstration purposes
const users = [];

// In-memory message store: recipientId -> [{ senderId, text, timestamp }]
const messages = {};

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true })); // For parsing form data
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true in production with HTTPS
}));

// Middleware to check if user is authenticated and attach user info to res.locals
async function isAuthenticated(req, res, next) {
  if (req.session.userId) {
    const user = users.find(u => u.id === req.session.userId);
    if (user) {
      res.locals.user = user;
      return next();
    }
  }
  res.redirect('/');
}

app.get('/', (req, res) => {
  res.render('login', { error: null });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Basic validation
  if (!email || !password) {
    return res.render('login', { error: 'Please enter both email and password.' });
  }

  // Find user (case-insensitive email)
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (user && await bcrypt.compare(password, user.passwordHash)) {
    req.session.userId = user.id;
    return res.redirect('/dashboard');
  } else {
    return res.render('login', { error: 'Invalid email or password.' });
  }
});

app.get('/register', (req, res) => {
  res.render('register', { error: null });
});

app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.render('register', { error: 'Please enter both email and password.' });
  }

  if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    return res.render('register', { error: 'User with that email already exists.' });
  }

  const passwordHash = await bcrypt.hash(password, 10); // Hash password with salt rounds = 10
  const newUser = { id: Date.now().toString(), email, passwordHash };
  users.push(newUser);
  console.log('Registered new user:', newUser.email);
  res.redirect('/'); // Redirect to login after successful registration
});

app.get('/dashboard', isAuthenticated, (req, res) => {
  const currentUser = res.locals.user;
  const userMessages = messages[currentUser.id] || [];
  // To display sender's email, we need to map senderId to email
  const enrichedMessages = userMessages.map(msg => {
    const sender = users.find(u => u.id === msg.senderId);
    return { ...msg, senderEmail: sender ? sender.email : 'Unknown' };
  });

  res.render('dashboard', { userEmail: currentUser.email, messages: enrichedMessages });
});

app.post('/send-message', isAuthenticated, (req, res) => {
  const { recipientEmail, messageText } = req.body;
  const sender = res.locals.user;

  const recipient = users.find(u => u.email.toLowerCase() === recipientEmail.toLowerCase());

  if (!recipient) {
    // For a real application, you might want to render the dashboard with an error message
    console.log(`Attempt to send message to non-existent user: ${recipientEmail}`);
    return res.redirect('/dashboard'); // Redirect back to dashboard for now
  }

  if (!messages[recipient.id]) {
    messages[recipient.id] = [];
  }

  messages[recipient.id].push({
    senderId: sender.id,
    text: messageText,
    timestamp: new Date()
  });
  console.log(`Message sent from ${sender.email} to ${recipient.email}`);
  res.redirect('/dashboard');
});

app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.redirect('/dashboard');
    }
    res.clearCookie('connect.sid'); // Clear session cookie
    res.redirect('/');
  });
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});