const bcrypt = require('bcryptjs');

// In-memory storage for demonstration purposes
// In a real application, you would use a database like MongoDB or PostgreSQL
let users = [];

class User {
  constructor(id, username, password, createdAt) {
    this.id = id;
    this.username = username;
    this.password = password;
    this.createdAt = createdAt;
  }

  // Save user to "database"
  save() {
    users.push(this);
    return this;
  }

  // Find user by username
  static findByUsername(username) {
    return users.find(user => user.username === username);
  }

  // Find user by ID
  static findById(id) {
    return users.find(user => user.id === id);
  }

  // Get all users
  static findAll() {
    return users;
  }

  // Validate password
  static async validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User;