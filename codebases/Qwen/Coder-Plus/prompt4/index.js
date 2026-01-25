// Main entry point to initialize models and relationships
const sequelize = require('./config/database');
const User = require('./models/User');
const Message = require('./models/Message');

// Define associations
User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
User.hasMany(Message, { foreignKey: 'recipientId', as: 'receivedMessages' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'recipientId', as: 'recipient' });

module.exports = {
  sequelize,
  User,
  Message
};