const express = require('express');
const router = express.Router();

// ============ IMPORT CONTROLLERS ============
const {
    sendMessage,
    getOrderMessages,
    getGigMessages,
    markAsRead,
    getUnreadCount,
    getMyConversations,
} = require('../controller/messageController');

// ============ IMPORT MIDDLEWARE ============
const authMiddleware = require('../middleware/auth');

// ============ MESSAGE ROUTES ============
// All routes are private (require authentication)

// @route   GET /api/messages/unread
// @desc    Get unread messages count
// @access  Private
router.get('/unread', authMiddleware, getUnreadCount);

// @route   GET /api/messages/conversations
// @desc    Get my conversations list
// @access  Private
router.get('/conversations', authMiddleware, getMyConversations);

// @route   GET /api/messages/order/:orderId
// @desc    Get all messages for an order
// @access  Private
router.get('/order/:orderId', authMiddleware, getOrderMessages);

// @route   GET /api/messages/gig/:gigId
// @desc    Get all messages for a gig inquiry
// @access  Private
router.get('/gig/:gigId', authMiddleware, getGigMessages);

// @route   POST /api/messages
// @desc    Send a message
// @access  Private
router.post('/', authMiddleware, sendMessage);

// @route   PUT /api/messages/:id/read
// @desc    Mark message as read
// @access  Private
router.put('/:id/read', authMiddleware, markAsRead);

module.exports = router;
