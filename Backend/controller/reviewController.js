const Review = require('../models/Review');
const Order = require('../models/Order');
const User = require('../models/User');
const Gig = require('../models/Gig');

// ============ CREATE REVIEW ============
// @desc    Client creates review after order completion
// @route   POST /api/reviews
// @access  Private (Client only)
exports.createReview = async (req, res, next) => {
    try {
        const { orderId, rating, message, anonymous } = req.body;

        // Find the order
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }

        // Only client can review
        if (order.clientId.toString() !== req.userId) {
            return res.status(403).json({
                success: false,
                message: 'Only the client can review this order',
            });
        }

        // Order must be completed
        if (order.status !== 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Can only review completed orders',
            });
        }

        // Check if already reviewed
        const existingReview = await Review.findOne({ orderId });
        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this order',
            });
        }

        // Create review
        const review = await Review.create({
            orderId,
            reviewerId: req.userId,
            revieweeId: order.freelancerId,
            rating,
            message,
            anonymous: anonymous || false,
        });

        // Update freelancer's average rating
        await updateUserRating(order.freelancerId);

        // Update gig's average rating
        await updateGigRating(order.gigId);

        // Mark order as reviewed
        order.isReviewed = true;
        await order.save();

        // Populate review
        const populatedReview = await Review.findById(review._id)
            .populate('reviewerId', 'name profilePicture');

        res.status(201).json({
            success: true,
            message: 'Review submitted successfully',
            review: populatedReview,
        });

    } catch (error) {
        next(error);
    }
};

// ============ GET REVIEWS FOR GIG ============
// @desc    Get all reviews for a gig
// @route   GET /api/reviews/gig/:gigId
// @access  Public
exports.getGigReviews = async (req, res, next) => {
    try {
        // Find all orders for this gig
        const orders = await Order.find({ gigId: req.params.gigId });
        const orderIds = orders.map(order => order._id);

        // Find reviews for these orders
        const reviews = await Review.find({ orderId: { $in: orderIds } })
            .populate('reviewerId', 'name profilePicture')
            .sort({ createdAt: -1 });

        // Hide reviewer info if anonymous
        const processedReviews = reviews.map(review => {
            if (review.anonymous) {
                return {
                    ...review.toObject(),
                    reviewerId: { name: 'Anonymous', profilePicture: null },
                };
            }
            return review;
        });

        res.json({
            success: true,
            count: reviews.length,
            reviews: processedReviews,
        });

    } catch (error) {
        next(error);
    }
};

// ============ GET REVIEWS FOR USER ============
// @desc    Get all reviews for a user (freelancer)
// @route   GET /api/reviews/user/:userId
// @access  Public
exports.getUserReviews = async (req, res, next) => {
    try {
        const reviews = await Review.find({ revieweeId: req.params.userId })
            .populate('reviewerId', 'name profilePicture')
            .populate('orderId', 'gigId')
            .sort({ createdAt: -1 });

        // Hide reviewer info if anonymous
        const processedReviews = reviews.map(review => {
            if (review.anonymous) {
                return {
                    ...review.toObject(),
                    reviewerId: { name: 'Anonymous', profilePicture: null },
                };
            }
            return review;
        });

        res.json({
            success: true,
            count: reviews.length,
            reviews: processedReviews,
        });

    } catch (error) {
        next(error);
    }
};

// ============ HELPER: Update User Rating ============
async function updateUserRating(userId) {
    const reviews = await Review.find({ revieweeId: userId });

    if (reviews.length === 0) return;

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const avgRating = totalRating / reviews.length;

    await User.findByIdAndUpdate(userId, {
        rating: Math.round(avgRating * 10) / 10,  // Round to 1 decimal
        totalReviews: reviews.length,
    });
}

// ============ HELPER: Update Gig Rating ============
async function updateGigRating(gigId) {
    const orders = await Order.find({ gigId });
    const orderIds = orders.map(order => order._id);

    const reviews = await Review.find({ orderId: { $in: orderIds } });

    if (reviews.length === 0) return;

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const avgRating = totalRating / reviews.length;

    await Gig.findByIdAndUpdate(gigId, {
        rating: Math.round(avgRating * 10) / 10,
        totalReviews: reviews.length,
    });
}
