// In-memory storage for demonstration purposes
// In a real application, you would use a database like MongoDB or PostgreSQL
let messages = [];
let messageIdCounter = 1;

class Message {
  constructor(fromUserId, toUserId, content, createdAt) {
    this.id = messageIdCounter++;
    this.fromUserId = fromUserId;
    this.toUserId = toUserId;
    this.content = content;
    this.createdAt = createdAt || new Date();
  }

  // Save message to "database"
  save() {
    messages.push(this);
    return this;
  }

  // Find messages for a specific user
  static findByUserId(userId) {
    return messages.filter(message => 
      message.toUserId === userId || message.fromUserId === userId
    ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // Find messages sent to a specific user
  static findMessagesForUser(userId) {
    return messages.filter(message => message.toUserId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
}

module.exports = Message;