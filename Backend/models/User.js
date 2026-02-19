const mongoose = require('mongoose');
// Database library
const bcrypt = require('bcryptjs');
// Password encryption library

// ============ SCHEMA DEFINITION ============
const userSchema = new mongoose.Schema({
  // Schema = Database structure define karte hain

  // -------- BASIC INFO --------
  name: {
    type: String,
    // Data type = Text

    required: [true, 'Please provide a name'],
    // Zaruri field = Nahi to error message

    trim: true,
    // Extra spaces remove kare
  },

  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    // Ye field unique hona chahiye (2 users same email nahi)

    lowercase: true,
    // Email automatically lowercase mein save

    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      // Regular expression = Valid email pattern
      'Invalid email format'
    ],
  },

  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    // Minimum 6 characters

    select: false,
    // Database se read karte time password return na kare
    // Security ke liye (password query default nahi aayega)
  },

  // -------- USER TYPE --------
  userType: {
    type: String,
    enum: ['client', 'freelancer'],
    // Sirf ye 2 values allowed hain

    required: true,
  },

  // -------- PROFILE INFO --------
  profilePicture: {
    type: String,
    // Image URL store hoga

    default: null,
    // Agar na de to null
  },

  description: {
    type: String,
    default: '',
    // Empty string se start

    maxlength: 500,
    // Maximum 500 characters
  },

  skills: [
    // Array of strings = Multiple skills
    {
      type: String,
    },
  ],
  // Example: ["React", "Node.js", "MongoDB"]

  // -------- FREELANCER INFO --------
  category: {
    type: String,
    default: null,
  },

  // -------- RATINGS & REVIEWS --------
  rating: {
    type: Number,
    default: 0,
    // Initially 0 rating

    min: 0,
    max: 5,
    // Rating 0-5 range mein
  },

  totalReviews: {
    type: Number,
    default: 0,
  },

  // -------- WALLET --------
  walletBalance: {
    type: Number,
    default: 0,
    // Initially 0 balance (freelancer ke earnings)
  },

  // -------- TIMESTAMPS --------
  createdAt: {
    type: Date,
    default: Date.now,
    // Current date-time automatically set
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// ============ PRE-SAVE HOOK ============
// Password hash before saving
userSchema.pre('save', async function () {
  // Agar password change nahi hua to skip
  if (!this.isModified('password')) {
    return;
  }

  // Password hash karo (10 rounds)
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// ============ INSTANCE METHODS ============

// Compare password with hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Get public profile (password exclude karke)
userSchema.methods.getPublicProfile = function () {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    userType: this.userType,
    profilePicture: this.profilePicture,
    description: this.description,
    skills: this.skills,
    category: this.category,
    rating: this.rating,
    totalReviews: this.totalReviews,
    createdAt: this.createdAt,
  };
};

// ============ EXPORT MODEL ============
module.exports = mongoose.model('User', userSchema);