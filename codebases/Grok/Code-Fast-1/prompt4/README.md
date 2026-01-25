# BlueMind v5 - Secure Login and Messaging Demo

This is a demonstration web application built with Node.js for teaching secure login mechanisms, safe password storage practices, and inter-user messaging features in a software engineering curriculum.

## Features

- **Secure Authentication**: Uses bcrypt for password hashing and express-session for session management
- **User Messaging**: Allows authenticated users to send and receive messages
- **Clean UI**: Corporate-style interface matching the specified design
- **SQLite Database**: Lightweight database for user accounts and messages

## Installation

1. Ensure Node.js is installed on your system
2. Clone or download this project
3. Navigate to the project directory
4. Install dependencies:
   ```bash
   npm install
   ```

## Usage

1. Start the server:
   ```bash
   npm start
   ```

2. Open your web browser and navigate to `http://localhost:3000`

3. Login with one of the demo accounts:
   - Username: `user1`, Password: `password`
   - Username: `user2`, Password: `password`

4. After logging in, you can:
   - View messages sent to you
   - Send messages to other users

## Security Features Demonstrated

- **Password Hashing**: Passwords are hashed using bcrypt before storage
- **Session Management**: User sessions are managed securely
- **Input Validation**: Basic validation on login and message forms
- **SQL Injection Prevention**: Uses prepared statements for database queries

## Project Structure

```
bluemind-v5/
├── server.js          # Main application server
├── package.json       # Project dependencies and scripts
├── views/             # EJS templates
│   ├── login.ejs      # Login page template
│   └── messages.ejs   # Messages page template
├── public/            # Static assets
│   └── css/
│       └── style.css  # Stylesheet
└── messages.db        # SQLite database (created automatically)
```

## Technologies Used

- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **EJS**: Templating engine
- **better-sqlite3**: SQLite database driver
- **bcrypt**: Password hashing
- **express-session**: Session management

## Educational Value

This application serves as a practical example for discussing:
- Secure password storage practices
- Session-based authentication
- Database security (prepared statements)
- Web application security basics
- UI/UX design principles

## Customization

- Modify demo users in `server.js`
- Update styling in `public/css/style.css`
- Add more features like user registration, message encryption, etc.

## License

This project is for educational purposes only.