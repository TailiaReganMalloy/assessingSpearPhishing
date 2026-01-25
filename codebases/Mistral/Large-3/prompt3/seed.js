require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      // Options useNewUrlParser and useUnifiedTopology are no longer needed
      // in Mongoose 6.0+ as they are the default behavior
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const Message = require('./models/Message');

const seedUsers = async () => {
  try {
    await User.deleteMany({});
    await Message.deleteMany({});
    
    // Create test users with hashed passwords
    const users = [
      { email: 'user1@bluemind.net', password: 'password123' },
      { email: 'user2@bluemind.net', password: 'password123' },
      { email: 'user3@bluemind.net', password: 'password123' }
    ];
    
    const createdUsers = [];
    for (const user of users) {
      const salt = await bcrypt.genSalt(12);
      user.password = await bcrypt.hash(user.password, salt);
      const createdUser = await User.create(user);
      createdUsers.push(createdUser);
    }
    
    // Create sample messages
    const messages = [
      {
        sender: createdUsers[0]._id,
        recipient: createdUsers[1]._id,
        subject: 'Welcome to BlueMind',
        content: 'Hello! Welcome to our secure messaging platform. This is a sample message.',
        isRead: false
      },
      {
        sender: createdUsers[1]._id,
        recipient: createdUsers[0]._id,
        subject: 'Meeting Tomorrow',
        content: 'Hi, just a reminder about our meeting tomorrow at 10 AM.',
        isRead: true
      },
      {
        sender: createdUsers[2]._id,
        recipient: createdUsers[0]._id,
        subject: 'Project Update',
        content: 'The project is progressing well. We should be ready for the next phase soon.',
        isRead: false
      }
    ];
    
    await Message.insertMany(messages);
    
    console.log('Users and messages seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

connectDB().then(seedUsers);