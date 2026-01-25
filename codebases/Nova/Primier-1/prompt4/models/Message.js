const mongoose = require('mongoose');
const crypto = require('crypto');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  iv: { type: String, required: true },
  encryptedContent: { type: String, required: true }
}, { timestamps: true });

// Encrypt message before saving
messageSchema.pre('save', function(next) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(process.env.ENCRYPTION_KEY, 'hex'), iv);
  let encrypted = cipher.update(this.content, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  this.encryptedContent = encrypted;
  this.iv = iv.toString('hex');
  this.content = undefined;
  next();
});

module.exports = mongoose.model('Message', messageSchema);
