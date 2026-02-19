const express = require('express');
const router = express.Router();

// ============ IMPORT CONTROLLERS ============
const { signup, login, getCurrentUser } = require('../controller/authcontroller');

// ============ IMPORT MIDDLEWARE ============
const authMiddleware = require('../middleware/auth');

// ============ AUTH ROUTES ============

// @route   POST /api/auth/signup
// @desc    Register new user
// @access  Public
router.post('/signup', signup);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', login);

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private (Token required)
router.get('/me', authMiddleware, getCurrentUser);

module.exports = router;
