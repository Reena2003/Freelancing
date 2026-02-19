const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  // -------- CONVERSATION REFERENCE --------
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    // Konse order mein message hai (Optional for pre-order inquiries)
    required: false,
  },

  gigId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gig',
    // Pre-order query ke liye (Optional)
    required: false,
  },

  // -------- SENDER & RECEIVER --------
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  // -------- MESSAGE CONTENT --------
  message: {
    type: String,
    required: true,
  },

  // -------- ATTACHMENTS --------
  attachments: [String],
  // Files URLs (documents, images)

  // -------- READ STATUS --------
  isRead: {
    type: Boolean,
    default: false,
    // Receiver ne dekha?
  },

  // -------- TIMESTAMP --------
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Message', messageSchema);