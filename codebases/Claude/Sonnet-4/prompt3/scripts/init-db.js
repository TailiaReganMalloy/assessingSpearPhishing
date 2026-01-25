#!/usr/bin/env node

/**
 * Database initialization script
 * This script sets up the SQLite database and creates demo users
 */

const bcrypt = require('bcryptjs');
const db = require('../config/database');

async function initDatabase() {
  console.log('Initializing database...');
  
  try {
    // Wait a moment for database to be ready
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create demo users
    const demoUsers = [
      { email: 'alice@bluemind.net', password: 'SecurePass123!' },
      { email: 'bob@bluemind.net', password: 'SecurePass456!' },
      { email: 'charlie@bluemind.net', password: 'SecurePass789!' }
    ];

    console.log('Creating demo users...');
    
    for (const user of demoUsers) {
      // Check if user already exists
      await new Promise((resolve, reject) => {
        db.getUserByEmail(user.email, async (err, existingUser) => {
          if (err) {
            console.error(`Error checking user ${user.email}:`, err);
            return reject(err);
          }
          
          if (existingUser) {
            console.log(`User ${user.email} already exists, skipping...`);
            return resolve();
          }

          // Hash password and create user
          try {
            const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
            const passwordHash = await bcrypt.hash(user.password, saltRounds);
            
            db.createUser(user.email, passwordHash, (err) => {
              if (err) {
                console.error(`Error creating user ${user.email}:`, err);
                return reject(err);
              }
              console.log(`✓ Created user: ${user.email}`);
              resolve();
            });
          } catch (hashError) {
            console.error(`Error hashing password for ${user.email}:`, hashError);
            reject(hashError);
          }
        });
      });
    }

    // Create demo messages
    console.log('Creating demo messages...');
    await createDemoMessages();

    console.log('\n✅ Database initialization completed successfully!');
    console.log('\nDemo Users Created:');
    demoUsers.forEach(user => {
      console.log(`  📧 ${user.email} : ${user.password}`);
    });
    
    console.log('\nYou can now start the application with: npm start');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  } finally {
    db.close();
  }
}

async function createDemoMessages() {
  const messages = [
    {
      from: 'alice@bluemind.net',
      to: 'bob@bluemind.net',
      subject: 'Welcome to BlueMind v5!',
      content: 'Hi Bob,\n\nWelcome to our new messaging system! This is a secure platform where we can communicate safely.\n\nBest regards,\nAlice'
    },
    {
      from: 'bob@bluemind.net',
      to: 'alice@bluemind.net',
      subject: 'Re: Welcome to BlueMind v5!',
      content: 'Hi Alice,\n\nThank you for the welcome message! The interface looks great and I can see the security features are well implemented.\n\nCheers,\nBob'
    },
    {
      from: 'charlie@bluemind.net',
      to: 'alice@bluemind.net',
      subject: 'System Security Features',
      content: 'Hi Alice,\n\nI\'ve been testing the security features of our new system. The password hashing, rate limiting, and CSRF protection all look solid.\n\nGreat work on the implementation!\n\nBest,\nCharlie'
    },
    {
      from: 'alice@bluemind.net',
      to: 'charlie@bluemind.net',
      subject: 'Re: System Security Features',
      content: 'Hi Charlie,\n\nThanks for the security review! The system implements:\n\n- bcrypt password hashing with configurable rounds\n- Account lockout after failed attempts\n- Rate limiting on authentication endpoints\n- CSRF token protection\n- Secure session management\n- SQL injection prevention\n\nFeel free to test more features!\n\nAlice'
    }
  ];

  for (const msg of messages) {
    await new Promise((resolve, reject) => {
      // Get sender ID
      db.getUserByEmail(msg.from, (err, sender) => {
        if (err || !sender) {
          console.warn(`Sender not found: ${msg.from}`);
          return resolve();
        }

        // Get recipient ID
        db.getUserByEmail(msg.to, (err, recipient) => {
          if (err || !recipient) {
            console.warn(`Recipient not found: ${msg.to}`);
            return resolve();
          }

          // Send message
          db.sendMessage(sender.id, recipient.id, msg.subject, msg.content, (err) => {
            if (err) {
              console.error(`Error creating message from ${msg.from} to ${msg.to}:`, err);
              return reject(err);
            }
            console.log(`✓ Created message: ${msg.from} → ${msg.to} : ${msg.subject}`);
            resolve();
          });
        });
      });
    });
  }
}

// Check if this script is being run directly
if (require.main === module) {
  require('dotenv').config();
  initDatabase();
}

module.exports = { initDatabase };