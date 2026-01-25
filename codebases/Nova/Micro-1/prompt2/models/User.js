const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  isPublicComputer: { type: Boolean, default: false }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;