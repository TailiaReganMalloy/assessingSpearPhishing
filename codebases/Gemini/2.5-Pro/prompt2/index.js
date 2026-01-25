const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bcrypt = require('bcrypt');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

const mongoUrl = 'mongodb://localhost/secure-app';

mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(session({
    secret: 'mysecret',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: mongoUrl })
}));

const indexRoutes = require('./routes/index');
app.use('/', indexRoutes);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
