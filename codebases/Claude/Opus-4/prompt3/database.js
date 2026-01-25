// Simple in-memory database for educational purposes
// In production, use a real database like PostgreSQL or MongoDB

const bcrypt = require('bcrypt');

// In-memory storage
const users = new Map();
const messages = new Map();
const loginAttempts = new Map();

// Initialize with demo users
async function initializeDatabase() {
    // Demo users with hashed passwords
    const demoUsers = [
        {
            id: '1',
            email: 'alice@bluemind.net',
            username: 'Alice',
            password: 'SecurePass123!',
        },
        {
            id: '2',
            email: 'bob@bluemind.net',
            username: 'Bob',
            password: 'StrongPass456!',
        },
        {
            id: '3',
            email: 'demo@bluemind.net',
            username: 'Demo User',
            password: 'DemoPass789!',
        }
    ];

    // Hash passwords and store users
    for (const user of demoUsers) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        users.set(user.email, {
            id: user.id,
            email: user.email,
            username: user.username,
            password: hashedPassword,
            createdAt: new Date()
        });
    }

    // Add some demo messages
    const demoMessages = [
        {
            id: '1',
            from: 'alice@bluemind.net',
            to: 'bob@bluemind.net',
            subject: 'Welcome to BlueMind',
            content: 'Hi Bob! Welcome to our secure messaging platform. This is an example of encrypted messaging.',
            read: false,
            createdAt: new Date(Date.now() - 3600000) // 1 hour ago
        },
        {
            id: '2',
            from: 'bob@bluemind.net',
            to: 'alice@bluemind.net',
            subject: 'Re: Welcome to BlueMind',
            content: 'Thanks Alice! This platform looks great. The security features are impressive.',
            read: false,
            createdAt: new Date(Date.now() - 1800000) // 30 minutes ago
        },
        {
            id: '3',
            from: 'demo@bluemind.net',
            to: 'alice@bluemind.net',
            subject: 'Security Best Practices',
            content: 'Remember to always use strong passwords and enable two-factor authentication when available.',
            read: false,
            createdAt: new Date(Date.now() - 7200000) // 2 hours ago
        }
    ];

    demoMessages.forEach(msg => messages.set(msg.id, msg));
}

// User operations
const userDB = {
    findByEmail: (email) => {
        return users.get(email);
    },
    
    findById: (id) => {
        for (const [email, user] of users) {
            if (user.id === id) {
                return user;
            }
        }
        return null;
    },
    
    create: async (userData) => {
        const id = Date.now().toString();
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const user = {
            id,
            email: userData.email,
            username: userData.username,
            password: hashedPassword,
            createdAt: new Date()
        };
        users.set(userData.email, user);
        return { ...user, password: undefined }; // Return user without password
    },
    
    getAllUsers: () => {
        return Array.from(users.values()).map(user => ({
            id: user.id,
            email: user.email,
            username: user.username
        }));
    }
};

// Message operations
const messageDB = {
    getMessagesForUser: (userEmail) => {
        const userMessages = [];
        for (const [id, message] of messages) {
            if (message.to === userEmail || message.from === userEmail) {
                userMessages.push(message);
            }
        }
        return userMessages.sort((a, b) => b.createdAt - a.createdAt);
    },
    
    getInbox: (userEmail) => {
        const inbox = [];
        for (const [id, message] of messages) {
            if (message.to === userEmail) {
                inbox.push(message);
            }
        }
        return inbox.sort((a, b) => b.createdAt - a.createdAt);
    },
    
    getSent: (userEmail) => {
        const sent = [];
        for (const [id, message] of messages) {
            if (message.from === userEmail) {
                sent.push(message);
            }
        }
        return sent.sort((a, b) => b.createdAt - a.createdAt);
    },
    
    create: (messageData) => {
        const id = Date.now().toString();
        const message = {
            id,
            ...messageData,
            read: false,
            createdAt: new Date()
        };
        messages.set(id, message);
        return message;
    },
    
    markAsRead: (messageId, userEmail) => {
        const message = messages.get(messageId);
        if (message && message.to === userEmail) {
            message.read = true;
            return true;
        }
        return false;
    },
    
    delete: (messageId, userEmail) => {
        const message = messages.get(messageId);
        if (message && (message.to === userEmail || message.from === userEmail)) {
            messages.delete(messageId);
            return true;
        }
        return false;
    }
};

// Login attempt tracking for security
const loginAttemptsDB = {
    recordAttempt: (email, success) => {
        const key = email.toLowerCase();
        const attempts = loginAttempts.get(key) || {
            count: 0,
            lastAttempt: null,
            lockedUntil: null
        };
        
        if (success) {
            loginAttempts.delete(key);
        } else {
            attempts.count++;
            attempts.lastAttempt = new Date();
            
            // Lock account after max attempts
            if (attempts.count >= parseInt(process.env.MAX_LOGIN_ATTEMPTS || 5)) {
                attempts.lockedUntil = new Date(
                    Date.now() + (parseInt(process.env.LOGIN_LOCKOUT_DURATION || 15) * 60 * 1000)
                );
            }
            
            loginAttempts.set(key, attempts);
        }
    },
    
    isLocked: (email) => {
        const attempts = loginAttempts.get(email.toLowerCase());
        if (attempts && attempts.lockedUntil) {
            if (attempts.lockedUntil > new Date()) {
                return true;
            } else {
                // Unlock if lockout period has expired
                attempts.lockedUntil = null;
                attempts.count = 0;
            }
        }
        return false;
    },
    
    getAttemptsInfo: (email) => {
        return loginAttempts.get(email.toLowerCase());
    }
};

// Initialize database
initializeDatabase();

module.exports = {
    userDB,
    messageDB,
    loginAttemptsDB
};