const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const User = mongoose.model('User', new mongoose.Schema({
  username: String,
  password: String
}));

passport.use(new LocalStrategy({
  usernameField: 'login',
  passwordField: 'password'
}, async (login, password, done) => {
  const user = await User.findOne({ username: login });
  if (!user) {
    return done(null, false, { message: 'Incorrect login.' });
  }
  if (!await bcrypt.compare(password, user.password)) {
    return done(null, false, { message: 'Incorrect password.' });
  }
  return done(null, user);
}));

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/login.html');
});

app.post('/login', passport.authenticate('local', {
  successRedirect: '/messages',
  failureRedirect: '/login',
  failureFlash: true
}));

mongoose.connect('mongodb://localhost:27017/bluemind', { useNewUrlParser: true, useUnifiedTopology: true });

app.listen(3000, () => {
  console.log('Server started on http://localhost:3000');
});