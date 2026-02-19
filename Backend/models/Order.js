const mongoose = require('mongoose');
// Database library

const orderSchema = new mongoose.Schema({
    // ========== KON? (References) ==========

    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        // Order karne wala client
    },

    freelancerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        // Kaam karne wala freelancer
    },

    gigId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gig',
        required: true,
        // Kaunsi gig order hui
    },

    // ========== KYA? (Order Details) ==========

    requirements: {
        type: String,
        required: [true, 'Please provide your requirements'],
        maxlength: 2000,
        // Client ki zarurat/instructions
    },

    price: {
        type: Number,
        required: true,
        // Order ka price (gig se copy hoga)
    },

    // ========== STATUS ==========

    status: {
        type: String,
        enum: ['pending', 'accepted', 'in_progress', 'delivered', 'completed', 'cancelled'],
        default: 'pending',
        // pending     = Freelancer ka wait
        // accepted    = Freelancer ne accept kiya
        // in_progress = Kaam ho raha hai
        // delivered   = Freelancer ne submit kiya
        // completed   = Client ne approve kiya
        // cancelled   = Cancel ho gaya
    },

    // ========== TIMESTAMPS ==========

    createdAt: {
        type: Date,
        default: Date.now,
        // Order kab place hua
    },

    completedAt: {
        type: Date,
        default: null,
        // Kab complete hua (null = abhi pending)
    },

    isReviewed: {
        type: Boolean,
        default: false,
        // Client ne review diya?
    },
});

// ============ EXPORT MODEL ============
module.exports = mongoose.model('Order', orderSchema);
