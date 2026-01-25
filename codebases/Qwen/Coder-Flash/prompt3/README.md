# BlueMind v5 - Secure Authentication System

This is a reference implementation of a secure web application with authentication and user-to-user messaging capabilities.

## Features

- Secure user authentication with password hashing
- Session management
- User-to-user messaging system
- Responsive UI with clean corporate design
- Password protection for sensitive operations

## Technologies Used

- **Node.js** with Express.js for the backend
- **bcryptjs** for secure password hashing
- **jsonwebtoken** for JWT token generation
- **express-session** for session management
- **HTML/CSS/JavaScript** for frontend

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (usually comes with Node.js)

### Installation

1. Clone or download this repository
2. Navigate to the project directory:
   ```bash
   cd blue-mind-v5
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

#### Development Mode
```bash
npm run dev
```
This will start the server with nodemon for auto-restart on code changes.

#### Production Mode
```bash
npm start
```
This will start the server in production mode.

### Accessing the Application

Once the server is running, open your browser and go to:
```
http://localhost:3000
```

## Default Users

The application comes with two pre-configured users:

1. **Admin User**
   - Username: `admin`
   - Password: `password123`

2. **Regular User**
   - Username: `user1`
   - Password: `password123`

## Security Features

1. **Password Hashing**: All passwords are securely hashed using bcrypt before storage
2. **Session Management**: User sessions are managed securely with express-session
3. **JWT Tokens**: Authentication tokens are generated and validated using JSON Web Tokens
4. **Input Validation**: Basic input validation is performed on login

## Project Structure

```
blue-mind-v5/
├── src/
│   ├── server.js          # Main application server
│   ├── views/             # HTML templates
│   │   ├── login.html     # Login page
│   │   └── dashboard.html # Dashboard with messaging
│   └── public/            # Static assets (if any)
├── package.json           # Dependencies and scripts
└── README.md              # This file
```

## Usage Instructions

1. Start the application using `npm run dev`
2. Open your browser and navigate to `http://localhost:3000`
3. Log in with one of the default users
4. Once logged in, you'll see the dashboard with:
   - Inbox with messages
   - Ability to send new messages
   - Navigation menu
5. You can send messages to other users in the system

## Educational Value

This implementation demonstrates:
- Secure password handling with bcrypt
- JWT-based authentication
- Session management
- RESTful API design
- Frontend-backend integration
- User interface design principles