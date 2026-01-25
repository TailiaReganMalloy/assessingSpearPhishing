const database = require('../models/database');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

async function initializeDatabase() {
    try {
        console.log('Initializing database...');
        
        // Connect to database
        await database.connect();
        
        // Create tables
        await database.initTables();
        
        // Wait a moment for tables to be fully created
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Create demo users for educational purposes
        const userModel = new User();
        
        const demoUsers = [
            {
                email: 'alice@bluemind.net',
                password: 'SecurePass123!',
                firstName: 'Alice',
                lastName: 'Johnson'
            },
            {
                email: 'bob@bluemind.net',
                password: 'SecurePass456!',
                firstName: 'Bob',
                lastName: 'Smith'
            },
            {
                email: 'carol@bluemind.net',
                password: 'SecurePass789!',
                firstName: 'Carol',
                lastName: 'Davis'
            },
            {
                email: 'demo@bluemind.net',
                password: 'DemoUser2024!',
                firstName: 'Demo',
                lastName: 'User'
            }
        ];

        console.log('Creating demo users...');
        
        for (const userData of demoUsers) {
            try {
                // Check if user already exists
                const existingUser = await userModel.findByEmail(userData.email);
                if (!existingUser) {
                    await userModel.create(userData);
                    console.log(`Created user: ${userData.email}`);
                } else {
                    console.log(`User already exists: ${userData.email}`);
                }
            } catch (error) {
                if (error.code === 'SQLITE_CONSTRAINT') {
                    console.log(`User already exists: ${userData.email}`);
                } else {
                    console.error(`Error creating user ${userData.email}:`, error.message);
                }
            }
        }

        console.log('Database initialization completed successfully!');
        console.log('\nDemo Users Created:');
        console.log('==================');
        demoUsers.forEach(user => {
            console.log(`Email: ${user.email} | Password: ${user.password}`);
        });
        console.log('\nYou can use these credentials to test the secure login functionality.');
        
        await database.close();
        
    } catch (error) {
        console.error('Database initialization failed:', error);
        process.exit(1);
    }
}

// Run initialization if this file is executed directly
if (require.main === module) {
    initializeDatabase();
}

module.exports = initializeDatabase;