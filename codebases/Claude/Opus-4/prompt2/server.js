const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcrypt');
const path = require('path');
const csrf = require('csrf');
const { body, validationResult } = require('express-validator');
const db = require('./database/db');

const app = express();
const PORT = 3000;
const tokens = new csrf();

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:"],
        },
    },
}));

// Rate limiting
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: 'Too many login attempts, please try again later.'
});

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-here-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true in production with HTTPS
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 2 // 2 hours
    }
}));

// CSRF middleware
app.use((req, res, next) => {
    if (!req.session.csrfSecret) {
        req.session.csrfSecret = tokens.secretSync();
    }
    next();
});

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Authentication middleware
const requireAuth = (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    next();
};

// Routes
app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    if (req.session.userId) {
        return res.redirect('/dashboard');
    }
    const csrfToken = tokens.create(req.session.csrfSecret);
    res.render('login', { csrfToken, error: null });
});

app.post('/login', loginLimiter, [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty().trim()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const csrfToken = tokens.create(req.session.csrfSecret);
        return res.render('login', { csrfToken, error: 'Invalid email or password format' });
    }

    const { email, password, _csrf } = req.body;

    // Verify CSRF token
    if (!tokens.verify(req.session.csrfSecret, _csrf)) {
        const csrfToken = tokens.create(req.session.csrfSecret);
        return res.render('login', { csrfToken, error: 'Invalid security token' });
    }

    try {
        const user = await db.getUserByEmail(email);
        
        if (!user) {
            const csrfToken = tokens.create(req.session.csrfSecret);
            return res.render('login', { csrfToken, error: 'Invalid email or password' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        
        if (!validPassword) {
            const csrfToken = tokens.create(req.session.csrfSecret);
            return res.render('login', { csrfToken, error: 'Invalid email or password' });
        }

        // Set session
        req.session.userId = user.id;
        req.session.userEmail = user.email;
        
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Login error:', error);
        const csrfToken = tokens.create(req.session.csrfSecret);
        res.render('login', { csrfToken, error: 'An error occurred. Please try again.' });
    }
});

app.get('/register', (req, res) => {
    const csrfToken = tokens.create(req.session.csrfSecret);
    res.render('register', { csrfToken, error: null });
});

app.post('/register', [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).trim(),
    body('confirmPassword').custom((value, { req }) => value === req.body.password)
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const csrfToken = tokens.create(req.session.csrfSecret);
        return res.render('register', { csrfToken, error: 'Invalid input. Password must be at least 8 characters and passwords must match.' });
    }

    const { email, password, _csrf } = req.body;

    // Verify CSRF token
    if (!tokens.verify(req.session.csrfSecret, _csrf)) {
        const csrfToken = tokens.create(req.session.csrfSecret);
        return res.render('register', { csrfToken, error: 'Invalid security token' });
    }

    try {
        // Check if user already exists
        const existingUser = await db.getUserByEmail(email);
        if (existingUser) {
            const csrfToken = tokens.create(req.session.csrfSecret);
            return res.render('register', { csrfToken, error: 'Email already registered' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        await db.createUser(email, hashedPassword);

        res.redirect('/login');
    } catch (error) {
        console.error('Registration error:', error);
        const csrfToken = tokens.create(req.session.csrfSecret);
        res.render('register', { csrfToken, error: 'An error occurred. Please try again.' });
    }
});

app.get('/dashboard', requireAuth, async (req, res) => {
    try {
        const messages = await db.getMessagesForUser(req.session.userId);
        const csrfToken = tokens.create(req.session.csrfSecret);
        res.render('dashboard', { 
            email: req.session.userEmail, 
            messages,
            csrfToken 
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.redirect('/login');
    }
});

app.get('/compose', requireAuth, (req, res) => {
    const csrfToken = tokens.create(req.session.csrfSecret);
    res.render('compose', { 
        email: req.session.userEmail,
        csrfToken,
        error: null,
        success: null
    });
});

app.post('/send-message', requireAuth, [
    body('recipient').isEmail().normalizeEmail(),
    body('subject').trim().escape().isLength({ min: 1, max: 200 }),
    body('message').trim().escape().isLength({ min: 1, max: 2000 })
], async (req, res) => {
    const errors = validationResult(req);
    const csrfToken = tokens.create(req.session.csrfSecret);
    
    if (!errors.isEmpty()) {
        return res.render('compose', { 
            email: req.session.userEmail,
            csrfToken,
            error: 'Invalid input. Please check your message.',
            success: null
        });
    }

    const { recipient, subject, message, _csrf } = req.body;

    // Verify CSRF token
    if (!tokens.verify(req.session.csrfSecret, _csrf)) {
        return res.render('compose', { 
            email: req.session.userEmail,
            csrfToken,
            error: 'Invalid security token',
            success: null
        });
    }

    try {
        // Get recipient user
        const recipientUser = await db.getUserByEmail(recipient);
        
        if (!recipientUser) {
            return res.render('compose', { 
                email: req.session.userEmail,
                csrfToken,
                error: 'Recipient not found',
                success: null
            });
        }

        // Send message
        await db.createMessage(req.session.userId, recipientUser.id, subject, message);

        res.render('compose', { 
            email: req.session.userEmail,
            csrfToken,
            error: null,
            success: 'Message sent successfully!'
        });
    } catch (error) {
        console.error('Send message error:', error);
        res.render('compose', { 
            email: req.session.userEmail,
            csrfToken,
            error: 'An error occurred. Please try again.',
            success: null
        });
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/login');
    });
});

// Initialize database and start server
db.initialize().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('Failed to initialize database:', err);
});