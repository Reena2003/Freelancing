const express = require('express');
const router = express.Router();

// ============ IMPORT CONTROLLERS ============
const {
    createReview,
    getGigReviews,
    getUserReviews,
} = require('../controller/reviewController');

// ============ IMPORT MIDDLEWARE ============
const authMiddleware = require('../middleware/auth');

// ============ REVIEW ROUTES ============

// @route   POST /api/reviews
// @desc    Create a review (Client)
// @access  Private
router.post('/', authMiddleware, createReview);

// @route   GET /api/reviews/gig/:gigId
// @desc    Get all reviews for a gig
// @access  Public
router.get('/gig/:gigId', getGigReviews);

// @route   GET /api/reviews/user/:userId
// @desc    Get all reviews for a user
// @access  Public
router.get('/user/:userId', getUserReviews);

module.exports = router;
