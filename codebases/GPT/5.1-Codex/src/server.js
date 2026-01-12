const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { APP_NAME, PORT } = require('./config');
const { bootstrap } = require('./db');
const authRoutes = require('./routes/authRoutes');
const messageRoutes = require('./routes/messageRoutes');

const app = express();
app.set('trust proxy', 1);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.locals.appName = APP_NAME;

app.use(
  helmet({
    contentSecurityPolicy: false
  })
);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '..', 'public'), { maxAge: '1h' }));

app.get('/', (req, res) => res.redirect('/login'));
app.use(authRoutes);
app.use('/inbox', messageRoutes);

app.use((req, res) => {
  res.status(404).render('login', {
    title: `${APP_NAME} | Identification`,
    notice: 'We could not find that page. Sign in again below.',
    formValues: { email: '' },
    errors: []
  });
});

const start = async () => {
  await bootstrap();
  app.listen(PORT, () => {
    console.log(`${APP_NAME} running on http://localhost:${PORT}`);
  });
};

start();
