import mongoose from 'mongoose';
import mongooseFieldEncryption from 'mongoose-field-encryption';

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  encryptedContent: {
    type: String,
    required: true,
    encrypted: true
  },
  iv: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  readAt: Date
});

// Apply encryption plugin
messageSchema.plugin(mongooseFieldEncryption, { 
  fields: ['encryptedContent'], 
  secret: process.env.SESSION_SECRET 
});

const Message = mongoose.model('Message', messageSchema);
export default Message;