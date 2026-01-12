const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const APP_NAME = 'BlueShell Vault';
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret';
const COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'secure_demo_token';
const IS_PROD = process.env.NODE_ENV === 'production';
const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax',
  secure: IS_PROD,
  maxAge: 1000 * 60 * 60 * 2
};

const DATA_PATH = path.join(__dirname, '..', 'data', 'secure-messages.sqlite');

module.exports = {
  APP_NAME,
  PORT,
  JWT_SECRET,
  COOKIE_NAME,
  COOKIE_OPTIONS,
  DATA_PATH,
  IS_PROD
};
