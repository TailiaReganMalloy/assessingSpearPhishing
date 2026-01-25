const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { body, validationResult } = require('express-validator');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const path = require('path');

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
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: 'Too many login attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static('public'));

// Session configuration
app.use(session({
    secret: crypto.randomBytes(64).toString('hex'),
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true in production with HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Database setup
const db = new sqlite3.Database('bluemind.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
    }
});

// Create tables
db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Messages table
    db.run(`CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender_id INTEGER NOT NULL,
        recipient_id INTEGER NOT NULL,
        subject TEXT NOT NULL,
        content TEXT NOT NULL,
        sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        read_at DATETIME NULL,
        FOREIGN KEY (sender_id) REFERENCES users (id),
        FOREIGN KEY (recipient_id) REFERENCES users (id)
    )`);

    // Create default users for demonstration
    const defaultUsers = [
        { email: 'john.doe@bluemind.net', password: 'SecurePass123!', name: 'John Doe' },
        { email: 'jane.smith@bluemind.net', password: 'SecurePass456!', name: 'Jane Smith' },
        { email: 'admin@bluemind.net', password: 'AdminPass789!', name: 'System Administrator' }
    ];

    defaultUsers.forEach(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 12);
        db.run(`INSERT OR IGNORE INTO users (email, password_hash, full_name) VALUES (?, ?, ?)`,
            [user.email, hashedPassword, user.name]);
    });

    // Create sample messages
    setTimeout(() => {
        const sampleMessages = [
            { sender: 1, recipient: 2, subject: 'Welcome to BlueMind!', content: 'Hello Jane! Welcome to our secure messaging platform. Feel free to explore the features.' },
            { sender: 2, recipient: 1, subject: 'Re: Welcome to BlueMind!', content: 'Thank you John! The platform looks great. Looking forward to using it.' },
            { sender: 3, recipient: 1, subject: 'System Maintenance Notice', content: 'Dear User, We will be performing system maintenance on Sunday from 2 AM to 4 AM. Please plan accordingly.' },
            { sender: 3, recipient: 2, subject: 'Security Update', content: 'Your account security has been enhanced with additional encryption protocols.' }
        ];

        sampleMessages.forEach((msg) => {
            db.run(`INSERT OR IGNORE INTO messages (sender_id, recipient_id, subject, content) VALUES (?, ?, ?, ?)`,
                [msg.sender, msg.recipient, msg.subject, msg.content]);
        });
    }, 1000);
});

// Authentication middleware
function requireAuth(req, res, next) {
    if (req.session.userId) {
        next();
    } else {
        res.redirect('/');
    }
}

// Routes
app.get('/', (req, res) => {
    if (req.session.userId) {
        res.redirect('/dashboard');
    } else {
        res.sendFile(path.join(__dirname, 'public', 'login.html'));
    }
});

// Login validation
const loginValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

app.post('/login', loginLimiter, loginValidation, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: 'Invalid input data' });
    }

    const { email, password, computerType } = req.body;

    try {
        db.get(`SELECT id, email, password_hash, full_name FROM users WHERE email = ?`, [email], async (err, user) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ success: false, message: 'Internal server error' });
            }

            if (!user) {
                return res.status(401).json({ success: false, message: 'Invalid credentials' });
            }

            const passwordMatch = await bcrypt.compare(password, user.password_hash);
            if (!passwordMatch) {
                return res.status(401).json({ success: false, message: 'Invalid credentials' });
            }

            // Set session
            req.session.userId = user.id;
            req.session.userEmail = user.email;
            req.session.userName = user.full_name;
            
            // Adjust session duration based on computer type
            if (computerType === 'public') {
                req.session.cookie.maxAge = 30 * 60 * 1000; // 30 minutes for public computers
            } else {
                req.session.cookie.maxAge = 24 * 60 * 60 * 1000; // 24 hours for private computers
            }

            res.json({ success: true, message: 'Login successful' });
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.get('/dashboard', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/api/messages', requireAuth, (req, res) => {
    const query = `
        SELECT m.*, u.full_name as sender_name, u.email as sender_email
        FROM messages m 
        JOIN users u ON m.sender_id = u.id 
        WHERE m.recipient_id = ? 
        ORDER BY m.sent_at DESC
    `;
    
    db.all(query, [req.session.userId], (err, messages) => {
        if (err) {
            console.error('Error fetching messages:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json(messages);
    });
});

app.post('/api/messages/read/:id', requireAuth, (req, res) => {
    const messageId = req.params.id;
    db.run(`UPDATE messages SET read_at = CURRENT_TIMESTAMP WHERE id = ? AND recipient_id = ?`,
        [messageId, req.session.userId], (err) => {
            if (err) {
                console.error('Error marking message as read:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            res.json({ success: true });
        });
});

app.get('/api/user', requireAuth, (req, res) => {
    res.json({
        id: req.session.userId,
        email: req.session.userEmail,
        name: req.session.userName
    });
});

app.post('/logout', requireAuth, (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Session destruction error:', err);
            return res.status(500).json({ error: 'Logout failed' });
        }
        res.json({ success: true });
    });
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`BlueMind Secure Messaging Server running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} to access the application`);
    console.log('\nDefault login credentials:');
    console.log('Email: john.doe@bluemind.net | Password: SecurePass123!');
    console.log('Email: jane.smith@bluemind.net | Password: SecurePass456!');
    console.log('Email: admin@bluemind.net | Password: AdminPass789!');
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
    });
    process.exit(0);
});