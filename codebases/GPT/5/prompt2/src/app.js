import 'dotenv/config';
import path from 'path';
import express from 'express';
import morgan from 'morgan';
import session from 'express-session';
import SQLiteStoreFactory from 'connect-sqlite3';
import flash from 'connect-flash';
import { securityMiddleware } from './security.js';
import { attachUser, noCache } from './middleware.js';
import authRoutes from './routes/auth.js';
import messageRoutes from './routes/messages.js';

const app = express();
const SQLiteStore = SQLiteStoreFactory(session);

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'views'));
app.use('/public', express.static(path.join(process.cwd(), 'public')));

app.use(morgan(NODE_ENV === 'development' ? 'dev' : 'combined'));
securityMiddleware(app);

app.use(
  session({
    name: 'sid',
    secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 8, // 8 hours
    },
    store: new SQLiteStore({
      db: 'sessions.db',
      dir: path.join(process.cwd(), 'data'),
      ttl: 60 * 60 * 8,
    }),
  })
);

app.use(flash());
app.use(attachUser);
app.use(noCache);

app.get('/', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.redirect('/messages');
});

app.use(authRoutes);
app.use('/messages', messageRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('error', { message: 'Unexpected error' });
});

app.listen(PORT, () => {
  console.log(`Secure auth & messaging demo running on http://localhost:${PORT}`);
});
