# Secure Messaging App

A **Node.js reference implementation** for a secure authentication system with user-to-user messaging capabilities.

## Features
- User authentication (login/registration) with password hashing.
- Session management for secure login/logout.
- User-to-user messaging functionality.

## Project Structure
```
secure-messaging-app/
├── models/          # Database models (User, Message)
├── routes/          # API routes (auth, messages)
├── controllers/     # Business logic
├── middleware/      # Authentication middleware
├── views/           # Frontend templates (EJS)
├── public/          # Static files (CSS, JS)
├── config/          # Configuration files (DB, session)
├── app.js           # Main server file
└── package.json
```

## Setup Instructions

### Prerequisites
- Node.js
- MongoDB

### Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with the following content:
   ```env
   SESSION_SECRET=your-secret-key
   MONGODB_URI=mongodb://localhost:27017/secure-messaging-app
   ```
4. Start the server:
   ```bash
   npm start
   ```
   or for development with auto-restart:
   ```bash
   npm run dev
   ```

## Running the Application
- Open your browser and navigate to `http://localhost:3000`.
- Register a new account or log in with an existing one.
- Send and receive messages.

## License
This project is licensed under the ISC License.