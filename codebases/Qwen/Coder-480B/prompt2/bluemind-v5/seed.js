const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Message = require('./models/Message');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bluemind')
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Sample data
const users = [
  { login: 'admin', password: 'admin123' },
  { login: 'user1', password: 'password1' },
  { login: 'user2', password: 'password2' },
  { login: 'alice', password: 'alice123' },
  { login: 'bob', password: 'bob123' }
];

const messages = [
  {
    sender: 'admin',
    recipient: 'user1',
    subject: 'Welcome to BlueMind v5',
    content: 'Welcome to our secure messaging platform. Feel free to explore the features.'
  },
  {
    sender: 'user2',
    recipient: 'user1',
    subject: 'Meeting tomorrow',
    content: 'Hi, just confirming our meeting scheduled for tomorrow at 10am. Looking forward to it!'
  },
  {
    sender: 'alice',
    recipient: 'bob',
    subject: 'Project Update',
    content: 'The project is progressing well. I\'ll send you the detailed report by Friday.'
  },
  {
    sender: 'bob',
    recipient: 'alice',
    subject: 'Re: Project Update',
    content: 'Thanks for the update. I\'ve completed my part and uploaded the files to the shared folder.'
  }
];

async function seedDatabase() {
  try {
    // Clear existing data
    await User.collection.drop();
    await Message.collection.drop();
  } catch (err) {
    // Collections might not exist yet, that's okay
    console.log('Collections cleared or did not exist');
  }
  
  try {
    
    // Create users with hashed passwords
    const createdUsers = [];
    for (const userData of users) {
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      const user = new User({
        login: userData.login,
        password: hashedPassword
      });
      
      const savedUser = await user.save();
      createdUsers.push(savedUser);
      console.log(`Created user: ${userData.login}`);
    }
    
    // Create messages
    for (const messageData of messages) {
      // Find sender and recipient by login
      const sender = createdUsers.find(u => u.login === messageData.sender);
      const recipient = createdUsers.find(u => u.login === messageData.recipient);
      
      if (sender && recipient) {
        const message = new Message({
          sender: sender._id,
          recipient: recipient._id,
          subject: messageData.subject,
          content: messageData.content
        });
        
        await message.save();
        console.log(`Created message from ${messageData.sender} to ${messageData.recipient}`);
      }
    }
    
    console.log('Database seeding completed!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();