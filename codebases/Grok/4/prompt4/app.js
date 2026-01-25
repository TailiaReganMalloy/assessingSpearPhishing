const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const port = 3000;
const secret = 'your_jwt_secret'; // Change this to a secure secret

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Database setup
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the SQLite database.');
});

// Educational note: Using SQLite for simplicity in this demo. In production, use a more robust database.

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (receiver_id) REFERENCES users(id)
  )`);
});

// Educational note: Database schema includes users with hashed passwords and messages linked by user IDs.

// Middleware to verify JWT
// Educational note: JWT is used for stateless authentication. Always use HTTPS in production to protect tokens.
function authenticateToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, secret, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Registration route
app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  // Educational note: Hashing passwords with bcrypt prevents storage of plain text passwords.
  const hashedPassword = await bcrypt.hash(password, 10); // Secure password hashing with bcrypt

  db.run(`INSERT INTO users (email, password) VALUES (?, ?)`, [email, hashedPassword], (err) => {
    if (err) {
      return res.status(400).send('User already exists');
    }
    res.redirect('/login');
  });
});

// Login route
app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
    if (err || !user) return res.status(400).send('Invalid credentials');

    // Educational note: Comparing hashed passwords prevents timing attacks and ensures security.
    const match = await bcrypt.compare(password, user.password); // Secure password comparison
    if (!match) return res.status(400).send('Invalid credentials');

    // Educational note: JWT tokens should have short expiration times and be stored securely.
    const token = jwt.sign({ id: user.id, email: user.email }, secret, { expiresIn: '1h' }); // JWT for session management
    res.header('Authorization', token).redirect('/dashboard');
  });
});

// Dashboard route
app.get('/dashboard', authenticateToken, (req, res) => {
  db.all(`SELECT m.*, u.email as sender_email FROM messages m JOIN users u ON m.sender_id = u.id WHERE receiver_id = ? ORDER BY timestamp DESC`, [req.user.id], (err, messages) => {
    if (err) return res.status(500).send('Error fetching messages');
    res.render('dashboard', { user: req.user, messages });
  });
});

// Send message route
app.post('/send', authenticateToken, (req, res) => {
  const { receiver, message } = req.body;

  db.get(`SELECT id FROM users WHERE email = ?`, [receiver], (err, receiverUser) => {
    if (err || !receiverUser) return res.status(400).send('Receiver not found');

    db.run(`INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)`, [req.user.id, receiverUser.id, message], (err) => {
      if (err) return res.status(500).send('Error sending message');
      res.redirect('/dashboard');
    });
  });
});

// Logout route
app.get('/logout', (req, res) => {
  res.clearCookie('Authorization').redirect('/login');
});

// Default route
app.get('/', (req, res) => {
  res.redirect('/login');
});

// Educational note: In a real application, implement CSRF protection, rate limiting, and input validation to enhance security.

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
