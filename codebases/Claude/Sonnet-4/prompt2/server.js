const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { body, validationResult } = require('express-validator');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:"]
        }
    }
}));

// Rate limiting
const authLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_ATTEMPTS) || 5, // limit each IP to 5 requests per windowMs
    message: 'Too many authentication attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Middleware setup
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: parseInt(process.env.SESSION_MAX_AGE) || 30 * 60 * 1000 // 30 minutes
    }
}));

app.use(flash());

// Template engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Database setup
const db = new sqlite3.Database(process.env.DB_PATH || './database/app.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
    }
});

// Database initialization
db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME
    )`);

    // Messages table
    db.run(`CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender_id INTEGER NOT NULL,
        recipient_id INTEGER NOT NULL,
        subject TEXT NOT NULL,
        body TEXT NOT NULL,
        sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        read_at DATETIME,
        FOREIGN KEY (sender_id) REFERENCES users(id),
        FOREIGN KEY (recipient_id) REFERENCES users(id)
    )`);

    // Login attempts table (for security monitoring)
    db.run(`CREATE TABLE IF NOT EXISTS login_attempts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        ip_address TEXT NOT NULL,
        success BOOLEAN NOT NULL,
        attempted_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
    if (req.session.userId) {
        next();
    } else {
        res.redirect('/');
    }
};

// Helper function to get user by email
const getUserByEmail = (email) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

// Helper function to create user
const createUser = (email, passwordHash) => {
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO users (email, password_hash) VALUES (?, ?)', 
               [email, passwordHash], function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
        });
    });
};

// Helper function to get messages for user
const getMessagesForUser = (userId) => {
    return new Promise((resolve, reject) => {
        db.all(`SELECT m.*, u.email as sender_email 
                FROM messages m 
                JOIN users u ON m.sender_id = u.id 
                WHERE m.recipient_id = ? 
                ORDER BY m.sent_at DESC`, 
               [userId], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

// Helper function to send message
const sendMessage = (senderId, recipientEmail, subject, body) => {
    return new Promise(async (resolve, reject) => {
        try {
            const recipient = await getUserByEmail(recipientEmail);
            if (!recipient) {
                reject(new Error('Recipient not found'));
                return;
            }
            
            db.run('INSERT INTO messages (sender_id, recipient_id, subject, body) VALUES (?, ?, ?, ?)',
                   [senderId, recipient.id, subject, body], function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
            });
        } catch (error) {
            reject(error);
        }
    });
};

// Routes
app.get('/', (req, res) => {
    if (req.session.userId) {
        res.redirect('/dashboard');
        return;
    }
    
    res.render('login', { 
        error: req.flash('error')[0],
        success: req.flash('success')[0]
    });
});

app.post('/login', authLimiter, [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 1 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('error', 'Please enter valid credentials');
        return res.redirect('/');
    }

    const { email, password } = req.body;
    const clientIp = req.ip || req.connection.remoteAddress;

    try {
        const user = await getUserByEmail(email);
        
        if (user && await bcrypt.compare(password, user.password_hash)) {
            // Successful login
            req.session.userId = user.id;
            req.session.userEmail = user.email;
            
            // Log successful attempt
            db.run('INSERT INTO login_attempts (email, ip_address, success) VALUES (?, ?, ?)',
                   [email, clientIp, true]);
            
            // Update last login
            db.run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);
            
            res.redirect('/dashboard');
        } else {
            // Failed login
            db.run('INSERT INTO login_attempts (email, ip_address, success) VALUES (?, ?, ?)',
                   [email, clientIp, false]);
            
            req.flash('error', 'Invalid credentials');
            res.redirect('/');
        }
    } catch (error) {
        console.error('Login error:', error);
        req.flash('error', 'An error occurred during login');
        res.redirect('/');
    }
});

app.get('/register', (req, res) => {
    if (req.session.userId) {
        res.redirect('/dashboard');
        return;
    }
    
    res.render('register', { 
        error: req.flash('error')[0],
        success: req.flash('success')[0]
    });
});

app.post('/register', [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('error', errors.array()[0].msg);
        return res.redirect('/register');
    }

    const { email, password } = req.body;

    try {
        // Check if user already exists
        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            req.flash('error', 'User with this email already exists');
            return res.redirect('/register');
        }

        // Hash password
        const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Create user
        await createUser(email, passwordHash);
        
        req.flash('success', 'Account created successfully. Please login.');
        res.redirect('/');
    } catch (error) {
        console.error('Registration error:', error);
        req.flash('error', 'An error occurred during registration');
        res.redirect('/register');
    }
});

app.get('/dashboard', requireAuth, async (req, res) => {
    try {
        const messages = await getMessagesForUser(req.session.userId);
        res.render('dashboard', { 
            userEmail: req.session.userEmail,
            messages: messages,
            error: req.flash('error')[0],
            success: req.flash('success')[0]
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        req.flash('error', 'Error loading messages');
        res.render('dashboard', { 
            userEmail: req.session.userEmail,
            messages: [],
            error: req.flash('error')[0],
            success: req.flash('success')[0]
        });
    }
});

app.get('/compose', requireAuth, (req, res) => {
    res.render('compose', { 
        userEmail: req.session.userEmail,
        error: req.flash('error')[0],
        success: req.flash('success')[0]
    });
});

app.post('/send-message', requireAuth, [
    body('recipient').isEmail().normalizeEmail(),
    body('subject').isLength({ min: 1, max: 200 }),
    body('message').isLength({ min: 1, max: 5000 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('error', 'Please fill all fields correctly');
        return res.redirect('/compose');
    }

    const { recipient, subject, message } = req.body;

    try {
        await sendMessage(req.session.userId, recipient, subject, message);
        req.flash('success', 'Message sent successfully');
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Send message error:', error);
        req.flash('error', error.message || 'Error sending message');
        res.redirect('/compose');
    }
});

app.post('/logout', requireAuth, (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/');
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// 404 handler
app.use((req, res) => {
    res.status(404).render('404', { title: '404 - Page Not Found' });
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down gracefully...');
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        } else {
            console.log('Database connection closed.');
        }
        process.exit(0);
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Environment:', process.env.NODE_ENV || 'development');
});

module.exports = app;