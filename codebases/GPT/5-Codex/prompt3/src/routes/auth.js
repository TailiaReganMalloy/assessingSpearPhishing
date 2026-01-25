import { Router } from 'express';
import bcrypt from 'bcrypt';
import { get, run } from '../db/index.js';

const router = Router();
const SALT_ROUNDS = 12;

router.post('/register', async (req, res) => {
  const { email, displayName, password } = req.body;

  if (!email || !displayName || !password) {
    res.status(400).json({ error: 'Email, displayName, and password are required.' });
    return;
  }

  try {
    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await get('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
    if (existing) {
      res.status(409).json({ error: 'Email already registered.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const { id } = await run(
      'INSERT INTO users (email, display_name, password_hash) VALUES (?, ?, ?)',
      [normalizedEmail, String(displayName).trim(), passwordHash]
    );

    req.session.regenerate((regenErr) => {
      if (regenErr) {
        res.status(500).json({ error: 'Session regeneration failed.' });
        return;
      }
      req.session.user = { id, email: normalizedEmail, displayName: String(displayName).trim() };
      res.status(201).json({ message: 'Registration successful.', user: req.session.user });
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to register user.' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  try {
    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await get('SELECT id, email, display_name, password_hash FROM users WHERE email = ?', [normalizedEmail]);

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials.' });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      res.status(401).json({ error: 'Invalid credentials.' });
      return;
    }

    req.session.regenerate((regenErr) => {
      if (regenErr) {
        res.status(500).json({ error: 'Session regeneration failed.' });
        return;
      }
      req.session.user = {
        id: user.id,
        email: user.email,
        displayName: user.display_name
      };
      res.json({ message: 'Login successful.', user: req.session.user });
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to authenticate user.' });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ error: 'Failed to destroy session.' });
      return;
    }
    res.clearCookie('sid');
    res.json({ message: 'Logged out.' });
  });
});

router.get('/me', (req, res) => {
  if (!req.session.user) {
    res.status(401).json({ error: 'Not authenticated.' });
    return;
  }
  res.json({ user: req.session.user });
});

export default router;
