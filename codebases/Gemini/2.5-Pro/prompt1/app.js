const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const authRouter = require('./routes/auth');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'a-very-secret-key',
    resave: false,
    saveUninitialized: true
}));

app.use('/', authRouter);

app.get('/dashboard', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    const messages = require('./data/messages.json').filter(m => m.to === req.session.email);
    res.render('dashboard', { email: req.session.email, messages });
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
