const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Session middleware
app.use(session({
  secret: 'your-secret-key-for-education-only', // In production, use env var
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Database setup
const db = new sqlite3.Database('users.db');

db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Messages table
  db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_user_id INTEGER NOT NULL,
    to_user_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (from_user_id) REFERENCES users (id),
    FOREIGN KEY (to_user_id) REFERENCES users (id)
  )`);

  // Insert demo users if not exist (for educational purposes)
  const demoEmail1 = 'student1@example.com';
  const demoPassword1 = 'password123';
  bcrypt.hash(demoPassword1, 10, (err, hash1) => {
    if (err) return console.error(err);
    db.get('SELECT id FROM users WHERE email = ?', [demoEmail1], (err, row) => {
      if (!row) {
        db.run('INSERT INTO users (email, password) VALUES (?, ?)', [demoEmail1, hash1]);
      }
    });
  });

  const demoEmail2 = 'student2@example.com';
  const demoPassword2 = 'password456';
  bcrypt.hash(demoPassword2, 10, (err, hash2) => {
    if (err) return console.error(err);
    db.get('SELECT id FROM users WHERE email = ?', [demoEmail2], (err, row) => {
      if (!row) {
        db.run('INSERT INTO users (email, password) VALUES (?, ?)', [demoEmail2, hash2]);
      }
    });
  });

  // Insert demo messages
  db.get('SELECT id FROM users WHERE email = ?', [demoEmail1], (err, user1) => {
    db.get('SELECT id FROM users WHERE email = ?', [demoEmail2], (err, user2) => {
      if (user1 && user2) {
        // Message from student2 to student1
        db.run('INSERT OR IGNORE INTO messages (from_user_id, to_user_id, message) VALUES (?, ?, ?)',
          [user2.id, user1.id, 'Hello from student2! This is a secure message.']);
      }
    });
  });
});

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
  if (req.session.userId) {
    return next();
  } else {
    res.redirect('/login');
  }
}

// Routes

// Login page
app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

// Register page
app.get('/register', (req, res) => {
  res.render('register', { error: null });
});

// Handle registration
app.post('/register', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.render('register', { error: 'Email and password are required.' });
  }

  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      return res.render('register', { error: 'Error processing registration.' });
    }

    db.run('INSERT INTO users (email, password) VALUES (?, ?)', [email, hash], function(err) {
      if (err) {
        return res.render('register', { error: 'Email already exists.' });
      }
      res.redirect('/login');
    });
  });
});

// Handle login
app.post('/login', (req, res) => {
  const { email, password, computerType } = req.body; // computerType for demo, public/private

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err || !user) {
      return res.render('login', { error: 'Invalid email or password.' });
    }

    bcrypt.compare(password, user.password, (err, result) => {
      if (err || !result) {
        return res.render('login', { error: 'Invalid email or password.' });
      }

      req.session.userId = user.id;
      req.session.email = user.email;
      // For demo, store computerType if needed
      res.redirect('/dashboard');
    });
  });
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return console.log(err);
    }
    res.redirect('/login');
  });
});

// Dashboard - Message viewing
app.get('/dashboard', isAuthenticated, (req, res) => {
  const userId = req.session.userId;

  db.all('SELECT m.*, u.email as from_email FROM messages m JOIN users u ON m.from_user_id = u.id WHERE m.to_user_id = ? ORDER BY m.created_at DESC', [userId], (err, messages) => {
    if (err) {
      return res.render('dashboard', { messages: [], error: 'Error fetching messages.' });
    }
    res.render('dashboard', { messages, email: req.session.email });
  });
});

// Send message (simple form for demo)
app.post('/send-message', isAuthenticated, (req, res) => {
  const { toEmail, message } = req.body;
  const fromUserId = req.session.userId;

  db.get('SELECT id FROM users WHERE email = ?', [toEmail], (err, toUser) => {
    if (err || !toUser) {
      return res.redirect('/dashboard'); // Or error handling
    }

    db.run('INSERT INTO messages (from_user_id, to_user_id, message) VALUES (?, ?, ?)', [fromUserId, toUser.id, message], (err) => {
      if (err) {
        console.error(err);
      }
      res.redirect('/dashboard');
    });
  });
});

app.listen(port, () => {
  console.log(`Web Security Example App listening at http://localhost:${port}`);
  console.log('Demo users:');
  console.log('- Email: student1@example.com, Password: password123');
  console.log('- Email: student2@example.com, Password: password456');
  console.log('Register new users at /register');
});