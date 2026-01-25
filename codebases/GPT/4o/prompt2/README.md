# Secure Authentication and Messaging System

This project demonstrates secure user authentication, encrypted password storage, and a messaging system between users using Node.js.

## Features

- **User Registration**: Securely register users with encrypted passwords.
- **User Login**: Authenticate users and issue JSON Web Tokens (JWT).
- **Messaging System**: Send and receive messages between users.
- **Secure Storage**: Passwords are hashed using bcrypt.

## Technologies Used

- **Node.js**: Backend framework.
- **Express**: Web server framework.
- **MongoDB**: Database for storing user and message data.
- **Mongoose**: ODM for MongoDB.
- **bcrypt**: Password hashing.
- **jsonwebtoken**: Token-based authentication.

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```bash
   cd secure-auth-messaging
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the server:
   ```bash
   npm start
   ```

5. Access the application at `http://localhost:3000`.

## API Endpoints

### User Authentication

- **POST /register**: Register a new user.
  - Request Body: `{ "email": "user@example.com", "password": "password123" }`

- **POST /login**: Login and receive a JWT.
  - Request Body: `{ "email": "user@example.com", "password": "password123" }`

### Messaging

- **POST /message**: Send a message to another user.
  - Request Body: `{ "token": "JWT_TOKEN", "receiverId": "USER_ID", "content": "Hello!" }`

- **GET /messages**: Retrieve messages received by the logged-in user.
  - Headers: `{ "token": "JWT_TOKEN" }`

## Notes

- Replace `your_secret_key` in `index.js` with a strong secret key.
- Ensure MongoDB is running locally or update the connection string in `index.js`.

## License

This project is licensed under the MIT License.