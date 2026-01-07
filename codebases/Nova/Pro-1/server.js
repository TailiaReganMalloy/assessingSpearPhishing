const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const ejs = require('ejs');

const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

mongoose.connect('mongodb://localhost:27017/example-website', { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
 username: String,
 password: String
});

const User = mongoose.model('User', userSchema);

app.get('/', (req, res) => {
 res.render('login');
});

app.post('/login', (req, res) => {
 const username = req.body.username;
 const password = req.body.password;

 User.findOne({ username: username }, (err, foundUser) => {
 if (err) {
 console.log(err);
 } else {
 if (foundUser) {
 bcrypt.compare(password, foundUser.password, (err, result) => {
 if (result) {
 res.render('messages');
 } else {
 res.send('Incorrect password.');
 }
 });
 } else {
 res.send('User not found.');
 }
 }
 });
});

app.listen(3000, () => {
 console.log('Server started on port 3000');
});