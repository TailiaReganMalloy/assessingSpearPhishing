# BlueMind v5 - Secure Messaging Application

A secure web application for user authentication and messaging with the following features:
- User registration and login with secure password hashing
- Session management with MongoDB
- Secure messaging between users
- Responsive UI with a clean, professional design

## Features

1. **User Authentication**
   - Secure login with username/password
   - Password hashing using bcryptjs
   - Session management with express-session
   - Support for private/public computer options

2. **Messaging System**
   - Send messages to other users
   - View received messages
   - Message timestamps

3. **Security**
   - Password encryption
   - Session security
   - CSRF protection (basic implementation)

## Technologies Used

- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: Passport.js with Local Strategy
- **Session Storage**: MongoDB session store (connect-mongo)
- **Frontend**: HTML, CSS, JavaScript (Vanilla JS)
- **Password Security**: bcryptjs

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up MongoDB (ensure it's running locally or update the connection string in `.env`)

4. Create a `.env` file with your configuration (see `.env.example`)

5. Start the application:
   ```bash
   npm start
   ```

## Usage

1. Visit `http://localhost:3000` in your browser
2. Register a new account or login with existing credentials
3. Access the dashboard to view messages and send new ones
4. Navigate to the messages page to see all received messages

## Project Structure

```
.
├── app.js              # Main application file
├── public/
│   ├── login.html      # Login page
│   ├── register.html   # Registration page
│   └── dashboard.html  # Dashboard page
├── .env                # Environment variables
└── README.md           # This file
```

## Security Notes

- Passwords are hashed using bcryptjs with 10 rounds of salting
- Sessions are stored in MongoDB for persistence
- The application uses HTTPS in production (not implemented in this example)
- Session cookies are configured with security settings

## License

This project is licensed under the MIT License.