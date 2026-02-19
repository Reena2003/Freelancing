const express = require('express');
const router = express.Router();

// ============ IMPORT CONTROLLERS ============
const {
    createOrder,
    getMyOrders,
    getReceivedOrders,
    getOrderById,
    updateOrderStatus,
    completeOrder,
    cancelOrder,
} = require('../controller/orderController');

// ============ IMPORT MIDDLEWARE ============
const authMiddleware = require('../middleware/auth');

// ============ ORDER ROUTES ============
// All routes are private (require authentication)

// @route   GET /api/orders/my
// @desc    Get my orders (Client)
// @access  Private
router.get('/my', authMiddleware, getMyOrders);

// @route   GET /api/orders/received
// @desc    Get received orders (Freelancer)
// @access  Private
router.get('/received', authMiddleware, getReceivedOrders);

// @route   POST /api/orders
// @desc    Create new order (Client)
// @access  Private
router.post('/', authMiddleware, createOrder);

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', authMiddleware, getOrderById);

// @route   PUT /api/orders/:id/status
// @desc    Update order status (Freelancer)
// @access  Private
router.put('/:id/status', authMiddleware, updateOrderStatus);

// @route   PUT /api/orders/:id/complete
// @desc    Complete order (Client)
// @access  Private
router.put('/:id/complete', authMiddleware, completeOrder);

// @route   PUT /api/orders/:id/cancel
// @desc    Cancel order
// @access  Private
router.put('/:id/cancel', authMiddleware, cancelOrder);

module.exports = router;
