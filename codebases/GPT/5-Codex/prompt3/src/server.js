import express from 'express';
import helmet from 'helmet';
import session from 'express-session';
import createSqliteStore from 'better-sqlite3-session-store';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync } from 'fs';
import authRouter from './routes/auth.js';
import messagesRouter from './routes/messages.js';
import { db } from './db/index.js';

const SQLiteStore = createSqliteStore(session);
const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '../data');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

const app = express();
app.set('trust proxy', 1);

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const sessionSecret = process.env.SESSION_SECRET || 'replace-this-secret';
const sessionStore = new SQLiteStore({
  client: db,
  expired: { clear: true, intervalMs: 15 * 60 * 1000 },
  ttl: 60 * 60 * 4
});

app.use(session({
  name: 'sid',
  store: sessionStore,
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 4
  }
}));

app.use(express.static(join(__dirname, '../public')));
app.use('/auth', authRouter);
app.use('/messages', messagesRouter);

app.get('/', (req, res) => {
  if (req.session.user) {
    res.redirect('/inbox.html');
    return;
  }
  res.redirect('/login.html');
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found.' });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Unexpected server error.' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
