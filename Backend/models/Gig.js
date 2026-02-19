const mongoose = require('mongoose');
// Database library import

const gigSchema = new mongoose.Schema({
  // -------- GIG CREATOR --------
  freelancerId: {
    type: mongoose.Schema.Types.ObjectId,
    // ObjectId = MongoDB unique ID
    // User model ke ID ko reference

    ref: 'User',
    // 'User' model se link karte hain
    // Populate() se user details get kar sakte hain

    required: true,
  },

  // -------- GIG DETAILS --------
  title: {
    type: String,
    required: [true, 'Please provide a gig title'],
    trim: true,
    maxlength: 120,
    // Maximum 120 characters title
  },

  description: {
    type: String,
    required: [true, 'Please provide a description'],
    maxlength: 5000,
    // Detailed description (5000 chars max)
  },

  category: {
    type: String,
    required: true,
    enum: ['programming', 'design', 'writing', 'marketing', 'business', 'other'],
    // Limited categories
  },

  // -------- PRICING --------
  price: {
    type: Number,
    required: [true, 'Please provide a price'],
    min: 100,
    // Minimum ₹100

    max: 500000,
    // Maximum ₹500,000
  },

  // -------- DELIVERY --------
  deliveryDays: {
    type: Number,
    required: true,
    min: 1,
    max: 30,
    // 1 to 30 days delivery time
  },

  revisions: {
    type: Number,
    required: true,
    min: 0,
    max: 10,
    default: 1,
    // Maximum 10 revisions allowed
  },

  // -------- IMAGES --------
  images: [
    {
      type: String,
      // Image URL (Cloudinary se)

      default: null,
    },
  ],
  // Array of image URLs

  tags: [String],
  // Search keywords

  // -------- STATUS --------
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
    // Active gig dikh payegi browsing mein
  },

  // -------- STATISTICS --------
  views: {
    type: Number,
    default: 0,
    // Kitne users ne dekha
  },

  orders: {
    type: Number,
    default: 0,
    // Kitne orders aaye
  },

  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
    // Average rating
  },

  totalReviews: {
    type: Number,
    default: 0,
  },

  // -------- TIMESTAMPS --------
  createdAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// ============ EXPORT MODEL ============
module.exports = mongoose.model('Gig', gigSchema);