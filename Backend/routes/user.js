const express = require('express');
const router = express.Router();

// ============ IMPORT CONTROLLERS ============
const {
    getUserProfile,
    updateProfile,
    getAllFreelancers,
    deleteAccount,
} = require('../controller/userController');

// ============ IMPORT MIDDLEWARE ============
const authMiddleware = require('../middleware/auth');

// ============ USER ROUTES ============

// @route   GET /api/users/freelancers
// @desc    Get all freelancers (for clients to browse)
// @access  Public
router.get('/freelancers', getAllFreelancers);

// @route   GET /api/users/profile
// @desc    Update my profile
// @access  Private
router.put('/profile', authMiddleware, updateProfile);

// @route   DELETE /api/users/profile
// @desc    Delete my account
// @access  Private
router.delete('/profile', authMiddleware, deleteAccount);

// @route   GET /api/users/:id
// @desc    Get user profile by ID
// @access  Public
router.get('/:id', getUserProfile);

module.exports = router;
