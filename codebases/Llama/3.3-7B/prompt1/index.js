const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send(`
  <html>
    <head>
      <title>BlueMind v5</title>
      <style>
        body {
          background-color: #2f4f7f;
          font-family: Arial, sans-serif;
        }
        .login-panel {
          width: 300px;
          margin: 50px auto;
          background-color: #fff;
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 10px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .login-panel h2 {
          text-align: center;
          margin-bottom: 20px;
        }
        .login-panel form {
          margin-top: 20px;
        }
        .login-panel form label {
          display: block;
          margin-bottom: 10px;
        }
        .login-panel form input[type="text"], .login-panel form input[type="password"] {
          width: 100%;
          height: 40px;
          margin-bottom: 20px;
          padding: 10px;
          border: 1px solid #ccc;
        }
        .login-panel form button[type="submit"] {
          width: 100%;
          height: 40px;
          background-color: #007bff;
          color: #fff;
          padding: 10px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }
      </style>
    </head>
    <body>
      <div class="login-panel">
        <h2>Identification</h2>
        <form>
          <label for="login">Login:</label>
          <input type="text" id="login" name="login"><br><br>
          <label for="password">Password:</label>
          <input type="password" id="password" name="password"><br><br>
          <input type="radio" id="private" name="computer" value="private">
          <label for="private">Private computer</label><br>
          <input type="radio" id="public" name="computer" value="public">
          <label for="public">Public computer</label><br><br>
          <button type="submit">Connect</button>
        </form>
      </div>
    </body>
  </html>
  ");
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});