const express = require('express');
const app = express();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/blueMind', { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
    username: String,
    password: String
});
const User = mongoose.model('User', userSchema);

app.use(express.json());

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    User.findOne({ username }, (err, user) => {
        if (err || !user) {
            res.status(401).send({ message: 'Invalid username or password' });
        } else {
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err || !isMatch) {
                    res.status(401).send({ message: 'Invalid username or password' });
                } else {
                    res.send({ message: 'Login successful' });
                }
            });
        }
    });
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});