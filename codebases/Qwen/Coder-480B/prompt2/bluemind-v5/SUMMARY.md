# BlueMind v5 - Secure Authentication and Messaging System

## Overview

BlueMind v5 is a reference implementation of a secure web application demonstrating best practices for user authentication and messaging capabilities. The application features a clean, corporate interface with a dark blue theme as requested.

## Key Features Implemented

1. **Secure Authentication System**
   - Password hashing using bcrypt with salt rounds of 12
   - Session management with configurable expiration times
   - Different session timeouts for private (24h) vs public (30min) computers

2. **User Messaging System**
   - User-to-user messaging capabilities
   - Message storage and retrieval
   - Message sorting by timestamp

3. **Security Measures**
   - MongoDB injection prevention through Mongoose
   - Secure session storage using connect-mongo
   - Environment variable configuration

4. **Interface Design**
   - Clean, centered layout with dark blue background
   - Corporate-style header with BlueMind logo
   - White login panel with "Identification" title
   - Form fields for Login and Password
   - Radio buttons for "Private computer" and "Public computer"
   - Prominent blue "Connect" button

## Technical Implementation

### Backend (Node.js + Express)
- User authentication with secure password hashing
- Session management with express-session
- MongoDB integration with Mongoose ODM
- RESTful API endpoints for login, dashboard, and logout

### Frontend (EJS Templates)
- Responsive design with CSS styling
- Login page with the requested corporate look and feel
- Dashboard for authenticated users to view messages
- Proper error handling and user feedback

### Database (MongoDB)
- User collection with login and hashed password
- Message collection with sender, recipient, subject, and content
- Proper indexing for efficient queries

## How to Use

1. **Installation**
   ```bash
   # Clone the repository
   git clone <repository-url>
   
   # Navigate to the project directory
   cd bluemind-v5
   
   # Install dependencies
   npm install
   ```

2. **Database Setup**
   - Ensure MongoDB is installed and running
   - The application will automatically connect to `mongodb://localhost:27017/bluemind`

3. **Environment Configuration**
   - Create a `.env` file with the following variables:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/bluemind
   SESSION_SECRET=your_session_secret_here
   ```

4. **Seed Sample Data**
   ```bash
   npm run seed
   ```
   This creates sample users (admin, user1, user2, alice, bob) with sample messages.

5. **Start the Application**
   ```bash
   npm start
   ```

6. **Access the Application**
   - Open your browser and navigate to `http://localhost:3000`
   - Use the sample credentials:
     - Username: admin, Password: admin123
     - Username: user1, Password: password1
     - etc.

## Security Features

1. **Password Security**
   - Passwords are hashed using bcrypt with a cost factor of 12
   - Salt is automatically generated for each password
   - Password comparison uses timing-safe bcrypt.compare()

2. **Session Management**
   - Sessions are stored in MongoDB using connect-mongo
   - Private computers: 24-hour session timeout
   - Public computers: 30-minute session timeout
   - Sessions are destroyed on logout

3. **Database Security**
   - Mongoose is used to prevent MongoDB injection attacks
   - Proper validation and sanitization of user inputs
   - Unique constraints on login fields

## Project Structure

```
bluemind-v5/
├── server.js              # Main application entry point
├── seed.js                # Database seeding script
├── models/                # Database models (User, Message)
│   ├── User.js            # User schema and methods
│   └── Message.js         # Message schema
├── views/                 # EJS templates
│   ├── login.ejs          # Login page template
│   └── dashboard.ejs      # User dashboard template
├── public/                # Static assets
│   └── style.css          # CSS styling
├── .env                   # Environment variables
├── package.json           # Project dependencies and scripts
└── README.md              # Project documentation
```

## Available Scripts

- `npm start` - Start the application
- `npm run dev` - Start the application with nodemon (if installed)
- `npm run seed` - Seed the database with sample data

## Conclusion

This implementation provides a solid foundation for a secure web application with authentication and messaging capabilities. The code follows security best practices and can be extended with additional features as needed.