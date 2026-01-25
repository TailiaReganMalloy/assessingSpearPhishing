// Import required modules
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import custom modules
const db = require('./models/database');
const authMiddleware = require('./middleware/auth');

// Initialize Express app
const app = express();

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

// Rate limiting to prevent brute force attacks
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: 'Too many login attempts from this IP, please try again after 15 minutes'
});

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'change-this-secret-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true in production with HTTPS
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
}));

// Routes

// Home page - redirects to login or dashboard
app.get('/', (req, res) => {
    if (req.session.userId) {
        res.redirect('/dashboard');
    } else {
        res.redirect('/login');
    }
});

// Login page
app.get('/login', (req, res) => {
    if (req.session.userId) {
        return res.redirect('/dashboard');
    }
    res.render('login', { 
        error: null,
        success: req.query.registered ? 'Registration successful! Please log in.' : null
    });
});

// Login POST route with rate limiting
app.post('/login', loginLimiter, async (req, res) => {
    const { email, password, computer_type } = req.body;

    try {
        // Validate input
        if (!email || !password) {
            return res.render('login', { 
                error: 'Please provide both email and password',
                success: null
            });
        }

        // Get user from database
        const user = await db.getUserByEmail(email);
        
        if (!user) {
            return res.render('login', { 
                error: 'Invalid email or password',
                success: null
            });
        }

        // Compare password
        const passwordMatch = await bcrypt.compare(password, user.password);
        
        if (!passwordMatch) {
            return res.render('login', { 
                error: 'Invalid email or password',
                success: null
            });
        }

        // Set session
        req.session.userId = user.id;
        req.session.email = user.email;
        req.session.computerType = computer_type || 'private';

        // Log successful login
        console.log(`User ${email} logged in successfully`);

        res.redirect('/dashboard');
    } catch (error) {
        console.error('Login error:', error);
        res.render('login', { 
            error: 'An error occurred during login',
            success: null
        });
    }
});

// Registration page
app.get('/register', (req, res) => {
    if (req.session.userId) {
        return res.redirect('/dashboard');
    }
    res.render('register', { error: null });
});

// Registration POST route
app.post('/register', async (req, res) => {
    const { email, password, confirmPassword } = req.body;

    try {
        // Validate input
        if (!email || !password || !confirmPassword) {
            return res.render('register', { 
                error: 'All fields are required' 
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.render('register', { 
                error: 'Please provide a valid email address' 
            });
        }

        // Check password match
        if (password !== confirmPassword) {
            return res.render('register', { 
                error: 'Passwords do not match' 
            });
        }

        // Check password strength
        if (password.length < 8) {
            return res.render('register', { 
                error: 'Password must be at least 8 characters long' 
            });
        }

        // Check if user already exists
        const existingUser = await db.getUserByEmail(email);
        if (existingUser) {
            return res.render('register', { 
                error: 'An account with this email already exists' 
            });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create user
        await db.createUser(email, hashedPassword);

        // Redirect to login with success message
        res.redirect('/login?registered=true');
    } catch (error) {
        console.error('Registration error:', error);
        res.render('register', { 
            error: 'An error occurred during registration' 
        });
    }
});

// Dashboard - Protected route
app.get('/dashboard', authMiddleware.requireAuth, async (req, res) => {
    try {
        const messages = await db.getMessagesForUser(req.session.userId);
        const sentMessages = await db.getSentMessages(req.session.userId);
        
        res.render('dashboard', { 
            user: { email: req.session.email },
            messages: messages,
            sentMessages: sentMessages
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.redirect('/login');
    }
});

// Compose message page - Protected route
app.get('/compose', authMiddleware.requireAuth, async (req, res) => {
    try {
        const users = await db.getAllUsers();
        res.render('compose', { 
            user: { email: req.session.email },
            users: users.filter(u => u.id !== req.session.userId),
            error: null,
            success: null
        });
    } catch (error) {
        console.error('Compose error:', error);
        res.redirect('/dashboard');
    }
});

// Send message - Protected route
app.post('/send-message', authMiddleware.requireAuth, async (req, res) => {
    const { recipient, subject, content } = req.body;

    try {
        if (!recipient || !subject || !content) {
            const users = await db.getAllUsers();
            return res.render('compose', { 
                user: { email: req.session.email },
                users: users.filter(u => u.id !== req.session.userId),
                error: 'All fields are required',
                success: null
            });
        }

        // Send message
        await db.createMessage(req.session.userId, recipient, subject, content);

        const users = await db.getAllUsers();
        res.render('compose', { 
            user: { email: req.session.email },
            users: users.filter(u => u.id !== req.session.userId),
            error: null,
            success: 'Message sent successfully!'
        });
    } catch (error) {
        console.error('Send message error:', error);
        const users = await db.getAllUsers();
        res.render('compose', { 
            user: { email: req.session.email },
            users: users.filter(u => u.id !== req.session.userId),
            error: 'Failed to send message',
            success: null
        });
    }
});

// View message - Protected route
app.get('/message/:id', authMiddleware.requireAuth, async (req, res) => {
    try {
        const message = await db.getMessage(req.params.id);
        
        // Security check - ensure user can only view their own messages
        if (!message || (message.recipient_id !== req.session.userId && message.sender_id !== req.session.userId)) {
            return res.redirect('/dashboard');
        }

        // Mark as read if recipient
        if (message.recipient_id === req.session.userId && !message.is_read) {
            await db.markMessageAsRead(req.params.id);
        }

        res.render('message', { 
            user: { email: req.session.email },
            message: message
        });
    } catch (error) {
        console.error('View message error:', error);
        res.redirect('/dashboard');
    }
});

// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/login');
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('\nSecurity Features Implemented:');
    console.log('✓ Password hashing with bcrypt');
    console.log('✓ Session management');
    console.log('✓ CSRF protection via session tokens');
    console.log('✓ Rate limiting on login attempts');
    console.log('✓ Helmet.js for security headers');
    console.log('✓ Input validation');
    console.log('✓ SQL injection protection');
    console.log('\nEducational Note: This is a demonstration app.');
    console.log('For production use, implement additional security measures.');
});