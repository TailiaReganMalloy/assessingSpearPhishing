# BlueMind v5 - Secure Authentication and Messaging System

This is a reference implementation of a secure web application with user authentication and messaging capabilities. The application demonstrates best practices for password hashing, session management, and user-to-user communication.

## Features

- Secure user authentication with bcrypt password hashing
- Session management with configurable expiration (private vs public computer)
- User-to-user messaging system
- MongoDB integration for data persistence
- Responsive web interface with EJS templating

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or remote instance)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```bash
   cd bluemind-v5
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/bluemind
   SESSION_SECRET=your_session_secret_here
   ```

## Usage

1. Start the MongoDB service:
   ```bash
   mongod
   ```

2. Start the application:
   ```bash
   npm start
   ```

3. Open your browser and navigate to `http://localhost:3000`

## Security Features

- Passwords are hashed using bcrypt with a cost factor of 12
- Session management with secure cookies
- Different session timeouts for private (24h) vs public (30min) computers
- MongoDB injection prevention through Mongoose

## Project Structure

```
bluemind-v5/
├── server.js          # Main application entry point
├── models/            # Database models (User, Message)
├── views/             # EJS templates (login, dashboard)
├── public/            # Static assets (CSS, JS, images)
├── routes/            # Route handlers
├── middleware/        # Custom middleware functions
├── config/            # Configuration files
├── .env               # Environment variables
└── package.json       # Project dependencies and scripts
```

## API Endpoints

- `GET /` - Login page
- `POST /login` - Authenticate user
- `GET /dashboard` - User dashboard with messages
- `GET /logout` - End user session

## License

This project is licensed under the MIT License.