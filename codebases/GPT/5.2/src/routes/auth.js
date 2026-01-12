const express = require('express');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');

function authRoutes({ db }) {
  const router = express.Router();

  router.get('/login', (req, res) => {
    if (req.session.userId) return res.redirect('/inbox');
    return res.render('login', { title: 'Identification', error: null });
  });

  router.post(
    '/login',
    body('email').isEmail().normalizeEmail(),
    body('password').isString().isLength({ min: 1, max: 256 }),
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).render('login', {
          title: 'Identification',
          error: 'Invalid email or password.'
        });
      }

      const email = req.body.email;
      const password = req.body.password;

      const user = await new Promise((resolve, reject) => {
        db.get('SELECT id, email, password_hash FROM users WHERE email = ?', [email], (err, row) => {
          if (err) return reject(err);
          resolve(row);
        });
      });

      // Avoid account enumeration
      const passwordHash = user ? user.password_hash : '$2b$12$C6UzMDM.H6dfI/f/IKcEeO0KQ8O7gkqY5T2r8j04YfGLmRoTSes1m';
      const ok = await bcrypt.compare(password, passwordHash);

      if (!user || !ok) {
        return res.status(401).render('login', {
          title: 'Identification',
          error: 'Invalid email or password.'
        });
      }

      req.session.userId = user.id;
      return res.redirect('/inbox');
    }
  );

  router.get('/register', (req, res) => {
    if (req.session.userId) return res.redirect('/inbox');
    return res.render('register', { title: 'Create Account', error: null });
  });

  router.post(
    '/register',
    body('email').isEmail().normalizeEmail(),
    body('password')
      .isString()
      .isLength({ min: 10, max: 128 })
      .matches(/[A-Z]/)
      .matches(/[a-z]/)
      .matches(/[0-9]/),
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).render('register', {
          title: 'Create Account',
          error: 'Password must be 10+ chars and include upper, lower, and a number.'
        });
      }

      const email = req.body.email;
      const password = req.body.password;
      const passwordHash = await bcrypt.hash(password, 12);

      try {
        await new Promise((resolve, reject) => {
          db.run('INSERT INTO users (email, password_hash) VALUES (?, ?)', [email, passwordHash], (err) => {
            if (err) return reject(err);
            resolve();
          });
        });
      } catch (err) {
        if (String(err.message || '').includes('UNIQUE')) {
          return res.status(409).render('register', {
            title: 'Create Account',
            error: 'That email is already registered.'
          });
        }
        throw err;
      }

      // Auto-login after registration
      const user = await new Promise((resolve, reject) => {
        db.get('SELECT id FROM users WHERE email = ?', [email], (err, row) => {
          if (err) return reject(err);
          resolve(row);
        });
      });

      req.session.userId = user.id;
      return res.redirect('/inbox');
    }
  );

  router.post('/logout', (req, res) => {
    req.session.destroy(() => {
      res.clearCookie('bm_session');
      return res.redirect('/login');
    });
  });

  return router;
}

module.exports = authRoutes;
