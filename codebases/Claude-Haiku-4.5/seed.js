const bcrypt = require('bcryptjs');
const db = require('./db');

/**
 * SEED DATA
 * 
 * This script populates the database with sample users and messages
 * for testing purposes. Run this after starting the server for the first time.
 * 
 * Sample Users:
 * - alice@example.com / password123
 * - bob@example.com / password456
 * - charlie@example.com / password789
 * 
 * Usage: node seed.js (after server is running)
 */

// Initialize database first
db.initializeDatabase();

// Sample users to create
const sampleUsers = [
  { email: 'alice@example.com', password: 'password123' },
  { email: 'bob@example.com', password: 'password456' },
  { email: 'charlie@example.com', password: 'password789' },
  { email: 'diana@example.com', password: 'password000' }
];

// Sample messages to create (sender_id, recipient_id, subject, body)
const sampleMessages = [
  {
    sender: 'alice@example.com',
    recipient: 'bob@example.com',
    subject: 'Welcome to Secure Mailer!',
    body: 'Hi Bob,\n\nWelcome to the Secure Mailer application! This is a demonstration of a secure messaging system.\n\nBest regards,\nAlice'
  },
  {
    sender: 'bob@example.com',
    recipient: 'alice@example.com',
    subject: 'Re: Welcome to Secure Mailer!',
    body: 'Hi Alice,\n\nThank you for the welcome message! This application is great for learning about web security.\n\nBest regards,\nBob'
  },
  {
    sender: 'charlie@example.com',
    recipient: 'alice@example.com',
    subject: 'Meeting Tomorrow',
    body: 'Hi Alice,\n\nDo you have time to meet tomorrow at 2 PM? I want to discuss the new project.\n\nThanks,\nCharlie'
  },
  {
    sender: 'alice@example.com',
    recipient: 'charlie@example.com',
    subject: 'Re: Meeting Tomorrow',
    body: 'Hi Charlie,\n\nYes, 2 PM works perfectly for me. See you tomorrow!\n\nAlice'
  }
];

const seedDatabase = async () => {
  console.log('Starting database seeding...\n');

  try {
    // Create users
    console.log('Creating sample users...');
    const userIds = {};

    for (const user of sampleUsers) {
      try {
        const hashedPassword = await new Promise((resolve, reject) => {
          bcrypt.hash(user.password, 10, (err, hash) => {
            if (err) reject(err);
            else resolve(hash);
          });
        });

        await new Promise((resolve, reject) => {
          db.createUser(user.email, hashedPassword, (err, userId) => {
            if (err) {
              console.log(`  ⚠️  ${user.email} already exists`);
              // Get the user ID for messages
              db.getUserByEmail(user.email, (err, existingUser) => {
                userIds[user.email] = existingUser.id;
                resolve();
              });
            } else {
              userIds[user.email] = userId;
              console.log(`  ✓ Created ${user.email} (ID: ${userId})`);
              resolve();
            }
          });
        });
      } catch (error) {
        console.error(`  ✗ Error creating ${user.email}:`, error.message);
      }
    }

    // Create sample messages
    console.log('\nCreating sample messages...');

    for (const msg of sampleMessages) {
      try {
        const senderId = userIds[msg.sender];
        const recipientId = userIds[msg.recipient];

        if (!senderId || !recipientId) {
          console.log(`  ⚠️  Skipping message: sender or recipient not found`);
          continue;
        }

        await new Promise((resolve, reject) => {
          db.sendMessage(senderId, recipientId, msg.subject, msg.body, (err) => {
            if (err) {
              console.log(`  ✗ Error sending message: ${err.message}`);
              resolve();
            } else {
              console.log(`  ✓ Message: "${msg.subject}" from ${msg.sender} to ${msg.recipient}`);
              resolve();
            }
          });
        });
      } catch (error) {
        console.error(`  ✗ Error creating message:`, error.message);
      }
    }

    console.log('\n✅ Database seeding completed!\n');
    console.log('Sample Users:');
    sampleUsers.forEach(user => {
      console.log(`  📧 ${user.email} / ${user.password}`);
    });
    console.log('\nYou can now login with any of these credentials.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

// Run the seeder
seedDatabase();
