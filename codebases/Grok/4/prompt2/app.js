const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const Sequelize = require('sequelize');
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite'
});

const User = require('./models/user')(sequelize);
const Message = require('./models/message')(sequelize);

User.hasMany(Message, { as: 'SentMessages', foreignKey: 'senderId' });
User.hasMany(Message, { as: 'ReceivedMessages', foreignKey: 'receiverId' });
Message.belongsTo(User, { as: 'Sender', foreignKey: 'senderId' });
Message.belongsTo(User, { as: 'Receiver', foreignKey: 'receiverId' });

sequelize.sync();

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true in production with HTTPS
}));

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });
  if (user && await user.validPassword(password)) {
    req.session.userId = user.id;
    res.redirect('/dashboard');
  } else {
    res.redirect('/login');
  }
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  await User.create({ email, password });
  res.redirect('/login');
});

app.get('/dashboard', async (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  const messages = await Message.findAll({
    where: { receiverId: req.session.userId },
    include: [{ model: User, as: 'Sender', attributes: ['email'] }]
  });
  res.render('dashboard', { messages });
});

app.get('/send', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  res.render('send');
});

app.post('/send', async (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  const { receiverEmail, content } = req.body;
  const receiver = await User.findOne({ where: { email: receiverEmail } });
  if (receiver) {
    await Message.create({
      content,
      senderId: req.session.userId,
      receiverId: receiver.id
    });
  }
  res.redirect('/dashboard');
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});