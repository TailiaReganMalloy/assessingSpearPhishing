# BlueMind - Secure Messaging Platform

## Overview
BlueMind is a secure messaging platform designed for educational purposes. It demonstrates secure user authentication and messaging functionality using Node.js, Express.js, MongoDB, and EJS.

## Features
- User registration and login with secure password storage.
- Messaging system for sending and receiving messages.
- Responsive UI for a seamless user experience.

## Prerequisites
- Node.js
- MongoDB

## Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```bash
   cd bluemind
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Set up environment variables:
   - Create a `.env` file in the root directory.
   - Add the following variables:
     ```env
     MONGODB_URI=mongodb://localhost:27017/bluemind
     JWT_SECRET=your_jwt_secret_here
     ```
5. Start the server:
   ```bash
   npm start
   ```

## Usage
- Register a new user or log in with an existing account.
- Send and receive messages securely.

## License
This project is licensed under the MIT License.