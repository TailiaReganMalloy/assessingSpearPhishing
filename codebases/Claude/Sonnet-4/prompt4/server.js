const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

// Import models and middleware
const database = require('./models/database');
const { securityHeaders, sanitizeInput, apiLimiter } = require('./middleware/auth');

// Import routes
const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages');
const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database connection
async function initializeApp() {
    try {
        console.log('Connecting to database...');
        await database.connect();
        await database.initTables();
        console.log('Database initialized successfully');
        
        // Configure middleware
        setupMiddleware();
        
        // Configure routes
        setupRoutes();
        
        // Start server
        app.listen(PORT, () => {
            console.log(`\n🚀 Server running on http://localhost:${PORT}`);
            console.log('\n📚 Educational Secure Login Demo');
            console.log('=====================================');
            console.log('This application demonstrates:');
            console.log('• Secure password hashing with bcrypt');
            console.log('• JWT token authentication');
            console.log('• Session management with security best practices');
            console.log('• Input validation and sanitization');
            console.log('• Rate limiting for login attempts');
            console.log('• Inter-user messaging functionality');
            console.log('\n🔗 Access the application:');
            console.log(`Login: http://localhost:${PORT}/`);
            console.log(`Dashboard: http://localhost:${PORT}/dashboard`);
            console.log('\n💡 Demo accounts available (run npm run init-db to create):');
            console.log('• alice@bluemind.net / SecurePass123!');
            console.log('• bob@bluemind.net / SecurePass456!');
            console.log('• carol@bluemind.net / SecurePass789!');
            console.log('• demo@bluemind.net / DemoUser2024!');
            console.log('\n🛡️ Security features implemented:');
            console.log('• Password complexity requirements');
            console.log('• Account lockout after failed attempts');
            console.log('• Secure session cookies');
            console.log('• CSRF protection');
            console.log('• XSS prevention');
            console.log('• SQL injection protection');
            console.log('=====================================\n');
        });
        
    } catch (error) {
        console.error('Failed to initialize application:', error);
        process.exit(1);
    }
}

function setupMiddleware() {
    // Security headers
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'"],
                imgSrc: ["'self'", "data:", "https:"],
                connectSrc: ["'self'"],
                fontSrc: ["'self'"],
                objectSrc: ["'none'"],
                mediaSrc: ["'self'"],
                frameSrc: ["'none'"],
            },
        },
        crossOriginEmbedderPolicy: false,
    }));

    // Custom security headers
    app.use(securityHeaders);

    // CORS configuration
    app.use(cors({
        origin: process.env.NODE_ENV === 'production' 
            ? ['https://yourdomain.com'] // Replace with your domain in production
            : ['http://localhost:3000'],
        credentials: true
    }));

    // Body parsing
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    
    // Cookie parser
    app.use(cookieParser());

    // Session configuration
    app.use(session({
        secret: process.env.SESSION_SECRET || 'your-super-secret-session-key-change-in-production',
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === 'production', // HTTPS only in production
            httpOnly: true, // Prevent XSS attacks
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            sameSite: 'strict' // CSRF protection
        },
        name: 'bluemind_session' // Custom session name
    }));

    // Input sanitization
    app.use(sanitizeInput);

    // Rate limiting for API routes
    app.use('/api', apiLimiter);

    // Static files
    app.use(express.static(path.join(__dirname, 'public')));

    // Request logging
    app.use((req, res, next) => {
        const timestamp = new Date().toISOString();
        console.log(`${timestamp} - ${req.method} ${req.path} - IP: ${req.ip}`);
        next();
    });
}

function setupRoutes() {
    // API routes
    app.use('/api/auth', authRoutes);
    app.use('/api/messages', messageRoutes);
    app.use('/api/users', userRoutes);

    // Serve static HTML files
    app.get('/', (req, res) => {
        // Redirect to dashboard if already authenticated, otherwise show login
        if (req.session && req.session.userId) {
            res.redirect('/dashboard');
        } else {
            res.sendFile(path.join(__dirname, 'public', 'login.html'));
        }
    });

    app.get('/login', (req, res) => {
        if (req.session && req.session.userId) {
            res.redirect('/dashboard');
        } else {
            res.sendFile(path.join(__dirname, 'public', 'login.html'));
        }
    });

    app.get('/dashboard', (req, res) => {
        // Check if user is authenticated
        if (req.session && req.session.userId) {
            res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
        } else {
            res.redirect('/login');
        }
    });

    // Registration page (basic implementation)
    app.get('/register', (req, res) => {
        if (req.session && req.session.userId) {
            res.redirect('/dashboard');
        } else {
            res.send(`
                <html>
                <head>
                    <title>Registration - Educational Demo</title>
                    <link rel="stylesheet" href="/css/styles.css">
                </head>
                <body>
                    <div class="login-container">
                        <div class="login-card">
                            <div class="logo-section">
                                <div class="logo">
                                    <div class="logo-icon">BM</div>
                                    <div>
                                        <div class="logo-text">BlueMind</div>
                                        <div class="logo-version">v5</div>
                                    </div>
                                </div>
                            </div>
                            <h1 class="form-title">Registration</h1>
                            <div style="text-align: center; padding: 20px; background: #f0f9ff; border: 1px solid #bfdbfe; border-radius: 8px; color: #1e40af;">
                                <h3>Demo Environment</h3>
                                <p>Registration is disabled in this educational demo.</p>
                                <p>Please use one of the pre-configured demo accounts:</p>
                                <ul style="text-align: left; margin: 16px 0;">
                                    <li><strong>alice@bluemind.net</strong> / SecurePass123!</li>
                                    <li><strong>bob@bluemind.net</strong> / SecurePass456!</li>
                                    <li><strong>carol@bluemind.net</strong> / SecurePass789!</li>
                                    <li><strong>demo@bluemind.net</strong> / DemoUser2024!</li>
                                </ul>
                            </div>
                            <div class="form-links" style="margin-top: 20px;">
                                <a href="/login" class="form-link">← Back to Login</a>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `);
        }
    });

    // Forgot password page (basic implementation)
    app.get('/forgot-password', (req, res) => {
        res.send(`
            <html>
            <head>
                <title>Password Recovery - Educational Demo</title>
                <link rel="stylesheet" href="/css/styles.css">
            </head>
            <body>
                <div class="login-container">
                    <div class="login-card">
                        <div class="logo-section">
                            <div class="logo">
                                <div class="logo-icon">BM</div>
                                <div>
                                    <div class="logo-text">BlueMind</div>
                                    <div class="logo-version">v5</div>
                                </div>
                            </div>
                        </div>
                        <h1 class="form-title">Password Recovery</h1>
                        <div style="text-align: center; padding: 20px; background: #f0f9ff; border: 1px solid #bfdbfe; border-radius: 8px; color: #1e40af;">
                            <h3>Demo Environment</h3>
                            <p>Password recovery is not implemented in this educational demo.</p>
                            <p>Please use the provided demo account credentials to test the system.</p>
                        </div>
                        <div class="form-links" style="margin-top: 20px;">
                            <a href="/login" class="form-link">← Back to Login</a>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `);
    });

    // Health check endpoint
    app.get('/health', (req, res) => {
        res.json({ 
            status: 'OK', 
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        });
    });

    // 404 handler
    app.use('*', (req, res) => {
        res.status(404).json({ 
            error: 'Page not found',
            requestedPath: req.originalUrl
        });
    });

    // Global error handler
    app.use((error, req, res, next) => {
        console.error('Global error handler:', error);
        
        // Don't leak error details in production
        const isDevelopment = process.env.NODE_ENV !== 'production';
        
        res.status(500).json({
            error: 'Internal server error',
            message: isDevelopment ? error.message : 'Something went wrong',
            ...(isDevelopment && { stack: error.stack })
        });
    });
}

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('Received SIGTERM signal, shutting down gracefully...');
    await database.close();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('Received SIGINT signal, shutting down gracefully...');
    await database.close();
    process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Initialize and start the application
initializeApp();