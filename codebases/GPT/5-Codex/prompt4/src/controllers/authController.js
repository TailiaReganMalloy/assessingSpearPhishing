const { validationResult } = require('express-validator');
const { hashPassword, verifyPassword } = require('../utils/passwords');
const userModel = require('../models/userModel');

function renderLogin(req, res) {
  res.render('login', {
    title: 'Secure Login',
    errors: [],
    values: { email: '' },
  });
}

function renderRegister(req, res) {
  res.render('register', {
    title: 'Create Account',
    errors: [],
    values: { email: '', displayName: '' },
  });
}

async function handleLogin(req, res) {
  const errors = validationResult(req);
  const { email, password } = req.body;

  if (!errors.isEmpty()) {
    return res.status(422).render('login', {
      title: 'Secure Login',
      errors: errors.array(),
      values: { email },
    });
  }

  const user = userModel.findByEmail(email);

  if (!user) {
    return res.status(401).render('login', {
      title: 'Secure Login',
      errors: [{ msg: 'Invalid email or password.' }],
      values: { email },
    });
  }

  const passwordMatches = await verifyPassword(password, user.password_hash);

  if (!passwordMatches) {
    return res.status(401).render('login', {
      title: 'Secure Login',
      errors: [{ msg: 'Invalid email or password.' }],
      values: { email },
    });
  }

  req.session.userId = user.id;
  req.session.flash = { type: 'success', message: `Welcome back, ${user.display_name}.` };
  return req.session.save(() => res.redirect('/dashboard'));
}

async function handleRegister(req, res) {
  const errors = validationResult(req);
  const { email, password, confirmPassword, displayName } = req.body;

  if (!errors.isEmpty()) {
    return res.status(422).render('register', {
      title: 'Create Account',
      errors: errors.array(),
      values: { email, displayName },
    });
  }

  if (password !== confirmPassword) {
    return res.status(422).render('register', {
      title: 'Create Account',
      errors: [{ msg: 'Passwords must match.' }],
      values: { email, displayName },
    });
  }

  const existing = userModel.findByEmail(email);

  if (existing) {
    return res.status(409).render('register', {
      title: 'Create Account',
      errors: [{ msg: 'An account with that email already exists.' }],
      values: { email, displayName },
    });
  }

  const passwordHash = await hashPassword(password);
  const newUser = userModel.createUser({ email, passwordHash, displayName });

  req.session.userId = newUser.id;
  req.session.flash = { type: 'success', message: 'Account created securely. Welcome!' };
  return req.session.save(() => res.redirect('/dashboard'));
}

function handleLogout(req, res) {
  req.session.destroy(() => {
    res.redirect('/login');
  });
}

module.exports = {
  renderLogin,
  renderRegister,
  handleLogin,
  handleRegister,
  handleLogout,
};
