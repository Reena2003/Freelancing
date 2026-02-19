const Order = require('../models/Order');
const Gig = require('../models/Gig');
const User = require('../models/User');

// ============ CREATE ORDER ============
// @desc    Client creates a new order
// @route   POST /api/orders
// @access  Private (Client only)
exports.createOrder = async (req, res, next) => {
    try {
        const { gigId, requirements } = req.body;

        // Check if user is client
        const user = await User.findById(req.userId);
        if (!user || user.userType !== 'client') {
            return res.status(403).json({
                success: false,
                message: 'Only clients can place orders',
            });
        }

        // Find the gig
        const gig = await Gig.findById(gigId);
        if (!gig) {
            return res.status(404).json({
                success: false,
                message: 'Gig not found',
            });
        }

        // Check gig is active
        if (gig.status !== 'active') {
            return res.status(400).json({
                success: false,
                message: 'This gig is not available',
            });
        }

        // Client cannot order their own gig
        if (gig.freelancerId.toString() === req.userId) {
            return res.status(400).json({
                success: false,
                message: 'You cannot order your own gig',
            });
        }

        // Create order
        const order = await Order.create({
            clientId: req.userId,
            freelancerId: gig.freelancerId,
            gigId: gig._id,
            requirements,
            price: gig.price,
        });

        // Populate order details
        const populatedOrder = await Order.findById(order._id)
            .populate('gigId', 'title price')
            .populate('freelancerId', 'name email');

        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            order: populatedOrder,
        });

    } catch (error) {
        next(error);
    }
};

// ============ GET MY ORDERS (Client) ============
// @desc    Get orders placed by client
// @route   GET /api/orders/my
// @access  Private
exports.getMyOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ clientId: req.userId })
            .populate('gigId', 'title images price')
            .populate('freelancerId', 'name profilePicture')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: orders.length,
            orders,
        });

    } catch (error) {
        next(error);
    }
};

// ============ GET RECEIVED ORDERS (Freelancer) ============
// @desc    Get orders received by freelancer
// @route   GET /api/orders/received
// @access  Private
exports.getReceivedOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ freelancerId: req.userId })
            .populate('gigId', 'title images price')
            .populate('clientId', 'name profilePicture email')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: orders.length,
            orders,
        });

    } catch (error) {
        next(error);
    }
};

// ============ GET ORDER BY ID ============
// @desc    Get single order details
// @route   GET /api/orders/:id
// @access  Private (Only client or freelancer of order)
exports.getOrderById = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('gigId', 'title description images price deliveryDays')
            .populate('clientId', 'name profilePicture email')
            .populate('freelancerId', 'name profilePicture email');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }

        // Check access - only client or freelancer can view
        if (
            order.clientId._id.toString() !== req.userId &&
            order.freelancerId._id.toString() !== req.userId
        ) {
            return res.status(403).json({
                success: false,
                message: 'You do not have access to this order',
            });
        }

        res.json({
            success: true,
            order,
        });

    } catch (error) {
        next(error);
    }
};

// ============ UPDATE ORDER STATUS (Freelancer) ============
// @desc    Freelancer accepts/starts/delivers order
// @route   PUT /api/orders/:id/status
// @access  Private (Freelancer only)
exports.updateOrderStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }

        // Only freelancer can update status
        if (order.freelancerId.toString() !== req.userId) {
            return res.status(403).json({
                success: false,
                message: 'Only the freelancer can update order status',
            });
        }

        // Allowed status transitions
        const allowedStatuses = ['accepted', 'in_progress', 'delivered'];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status',
            });
        }

        order.status = status;
        await order.save();

        res.json({
            success: true,
            message: `Order ${status}`,
            order,
        });

    } catch (error) {
        next(error);
    }
};

// ============ COMPLETE ORDER (Client) ============
// @desc    Client marks order as complete
// @route   PUT /api/orders/:id/complete
// @access  Private (Client only)
exports.completeOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }

        // Only client can complete
        if (order.clientId.toString() !== req.userId) {
            return res.status(403).json({
                success: false,
                message: 'Only the client can complete the order',
            });
        }

        // Order must be delivered first
        if (order.status !== 'delivered') {
            return res.status(400).json({
                success: false,
                message: 'Order must be delivered before completing',
            });
        }

        // Mark as completed
        order.status = 'completed';
        order.completedAt = Date.now();
        await order.save();

        // Update gig orders count
        await Gig.findByIdAndUpdate(order.gigId, {
            $inc: { orders: 1 }
        });

        // Update freelancer wallet
        await User.findByIdAndUpdate(order.freelancerId, {
            $inc: { walletBalance: order.price }
        });

        res.json({
            success: true,
            message: 'Order completed successfully',
            order,
        });

    } catch (error) {
        next(error);
    }
};

// ============ CANCEL ORDER ============
// @desc    Cancel order (before accepted)
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }

        // Only client or freelancer can cancel
        if (
            order.clientId.toString() !== req.userId &&
            order.freelancerId.toString() !== req.userId
        ) {
            return res.status(403).json({
                success: false,
                message: 'You cannot cancel this order',
            });
        }

        // Can only cancel if pending
        if (order.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Can only cancel pending orders',
            });
        }

        order.status = 'cancelled';
        await order.save();

        res.json({
            success: true,
            message: 'Order cancelled',
            order,
        });

    } catch (error) {
        next(error);
    }
};
