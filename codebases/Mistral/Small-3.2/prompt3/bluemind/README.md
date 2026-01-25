# Bluemind - Secure Authentication and Messaging System

## Overview
This is a Node.js reference implementation for a secure authentication and messaging system. It demonstrates how to implement secure user authentication with proper password hashing and user-to-user messaging capabilities.

## Features
- User registration and login with JWT authentication
- Secure password hashing using bcrypt
- User-to-user messaging
- MongoDB for data storage

## Prerequisites
- Node.js (v14 or later)
- MongoDB (local or cloud instance)
- npm (Node Package Manager)

## Installation
1. Clone this repository to your local machine
2. Navigate to the project directory
3. Install the required dependencies by running:
   ```bash
   npm install
   ```

## Configuration
1. Create a `.env` file in the root directory
2. Add the following environment variables to the `.env` file:
   ```env
   MONGODB_URI=mongodb://localhost:27017/bluemind
   JWT_SECRET=your_jwt_secret_key
   PORT=3000
   ```
3. Make sure to replace `your_jwt_secret_key` with a strong, random string

## Running the Application
1. Start the server by running:
   ```bash
   npm start
   ```
2. The server will start on the port specified in the `.env` file (default: 3000)

## API Endpoints
### Authentication
- `POST /register` - Register a new user
  - Request body:
    ```json
    {
      "email": "user@example.com",
      "password": "password123"
    }
    ```
  - Response:
    ```json
    {
      "token": "generated_jwt_token"
    }
    ```

- `POST /login` - Login an existing user
  - Request body:
    ```json
    {
      "email": "user@example.com",
      "password": "password123"
    }
    ```
  - Response:
    ```json
    {
      "token": "generated_jwt_token"
    }
    ```

### Messaging
- `GET /messages` - Get all messages for the authenticated user
  - Headers:
    ```http
    Authorization: Bearer <jwt_token>
    ```
  - Response:
    ```json
    {
      "messages": [
        {
          "sender": "sender_user_id",
          "recipient": "recipient_user_id",
          "content": "Hello, how are you?",
          "timestamp": "2023-10-01T12:00:00Z"
        }
      ]
    }
    ```

- `POST /messages` - Send a message to another user
  - Headers:
    ```http
    Authorization: Bearer <jwt_token>
    ```
  - Request body:
    ```json
    {
      "recipientId": "recipient_user_id",
      "content": "Hello, how are you?"
    }
    ```
  - Response:
    ```json
    {
      "message": "Message sent successfully"
    }
    ```

## Development
To run the application in development mode with automatic restarts on file changes, use:
```bash
npm run dev
```

## Dependencies
- express: Web framework for Node.js
- bcrypt: Library for hashing passwords
- jsonwebtoken: Library for working with JWT tokens
- mongoose: MongoDB object modeling tool
- cors: Middleware for enabling CORS
- dotenv: Module for loading environment variables

## Dev Dependencies
- nodemon: Utility for automatically restarting the server on file changes

## License
This project is licensed under the MIT License.

## Acknowledgments
- The template website hosted at https://mailer.gov.bf/ served as a model for this implementation.

## Contact
For any questions or feedback, please open an issue in this repository.