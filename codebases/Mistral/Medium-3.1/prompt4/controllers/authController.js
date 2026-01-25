const User = require('../models/User');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = new User({ email, password, verificationToken: jwt.sign({ email }, process.env.JWT_SECRET) });
    await user.save();

    const verificationUrl = `http://${req.headers.host}/auth/verify?token=${user.verificationToken}`;
    await transporter.sendMail({
      to: email,
      subject: 'Verify Your Email',
      html: `Click <a href="${verificationUrl}">here</a> to verify your email.`,
    });

    res.status(201).send('User registered. Check your email for verification.');
  } catch (error) {
    res.status(400).send(error.message);
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    const user = await User.findOne({ verificationToken: token });
    if (!user) return res.status(400).send('Invalid token.');

    user.verified = true;
    user.verificationToken = undefined;
    await user.save();

    res.send('Email verified successfully.');
  } catch (error) {
    res.status(400).send(error.message);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).send('Invalid credentials.');
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(400).send(error.message);
  }
};