const { Pool } = require('pg');

const pool = new Pool({
  user: 'your_db_user', // Replace with your DB user
  host: 'localhost',
  database: 'your_db_name', // Replace with your DB name
  password: 'your_db_password', // Replace with your DB password
  port: 5432,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  connect: () => pool.connect(), // Expose connect for initial setup if needed
};
