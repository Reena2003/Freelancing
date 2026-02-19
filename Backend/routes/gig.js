const express = require('express');
const router = express.Router();

// ============ IMPORT CONTROLLERS ============
const {
    createGig,
    getAllGigs,
    getGigById,
    updateGig,
    deleteGig,
    getMyGigs,
    getGigsByFreelancer,
} = require('../controller/gigController');

// ============ IMPORT MIDDLEWARE ============
const authMiddleware = require('../middleware/auth');

// ============ GIG ROUTES ============

// @route   GET /api/gigs/my
// @desc    Get my gigs (logged-in freelancer)
// @access  Private
router.get('/my', authMiddleware, getMyGigs);

// @route   GET /api/gigs/freelancer/:freelancerId
// @desc    Get all gigs by a freelancer
// @access  Public
router.get('/freelancer/:freelancerId', getGigsByFreelancer);

// @route   POST /api/gigs
// @desc    Create new gig
// @access  Private (Freelancer only)
router.post('/', authMiddleware, createGig);

// @route   GET /api/gigs
// @desc    Get all gigs (with filters)
// @access  Public
router.get('/', getAllGigs);

// @route   GET /api/gigs/:id
// @desc    Get single gig
// @access  Public
router.get('/:id', getGigById);

// @route   PUT /api/gigs/:id
// @desc    Update gig
// @access  Private (Owner only)
router.put('/:id', authMiddleware, updateGig);

// @route   DELETE /api/gigs/:id
// @desc    Delete gig
// @access  Private (Owner only)
router.delete('/:id', authMiddleware, deleteGig);

module.exports = router;
