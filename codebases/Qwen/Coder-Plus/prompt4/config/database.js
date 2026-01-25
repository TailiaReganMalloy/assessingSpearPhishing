const { Sequelize } = require('sequelize');

// Initialize SQLite database
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false // Set to console.log to see SQL queries
});

module.exports = sequelize;