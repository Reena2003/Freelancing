const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  // -------- ORDER REFERENCE --------
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    unique: true,
    // Ek order mein sirf ek review
  },

  // -------- REVIEWER & REVIEWEE --------
  reviewerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    // Kaunse ne review likha
  },

  revieweeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    // Kiskay liye review likha
  },

  // -------- RATING --------
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },

  // -------- REVIEW MESSAGE --------
  message: {
    type: String,
    required: true,
    maxlength: 1000,
  },

  // -------- ANONYMITY --------
  anonymous: {
    type: Boolean,
    default: false,
    // Anonymous review?
  },

  // -------- TIMESTAMP --------
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Review', reviewSchema);