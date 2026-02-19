const Message = require('../models/Message');
const Order = require('../models/Order');
const Gig = require('../models/Gig');

// ============ SEND MESSAGE ============
// @desc    Send a message in order chat or gig inquiry
// @route   POST /api/messages
// @access  Private
exports.sendMessage = async (req, res, next) => {
    try {
        const { orderId, gigId, message, attachments } = req.body;

        let receiverId;

        if (orderId) {
            // Find the order
            const order = await Order.findById(orderId);
            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Order not found',
                });
            }

            // Check if user is part of this order
            const isClient = order.clientId.toString() === req.userId;
            const isFreelancer = order.freelancerId.toString() === req.userId;

            if (!isClient && !isFreelancer) {
                return res.status(403).json({
                    success: false,
                    message: 'You are not part of this order',
                });
            }

            // Determine receiver
            receiverId = isClient ? order.freelancerId : order.clientId;
        } else if (gigId) {
            // Pre-order inquiry
            const gig = await Gig.findById(gigId);
            if (!gig) {
                return res.status(404).json({
                    success: false,
                    message: 'Gig not found',
                });
            }

            // Check if sender is the owner
            if (gig.freelancerId.toString() === req.userId) {
                // Freelancer sending to a client who messaged them?
                // For direct inquiry start, we need to know who the client is.
                // But usually, Contact Seller is initiated by a potential client.
                return res.status(400).json({
                    success: false,
                    message: 'You cannot contact yourself',
                });
            }

            receiverId = gig.freelancerId;
        } else {
            return res.status(400).json({
                success: false,
                message: 'Either orderId or gigId is required',
            });
        }

        // Create message
        const newMessage = await Message.create({
            orderId: orderId || null,
            gigId: gigId || null,
            senderId: req.userId,
            receiverId,
            message,
            attachments: attachments || [],
        });

        // Populate sender info
        const populatedMessage = await Message.findById(newMessage._id)
            .populate('senderId', 'name profilePicture');

        res.status(201).json({
            success: true,
            message: 'Message sent',
            data: populatedMessage,
        });

    } catch (error) {
        next(error);
    }
};

// ============ GET ORDER MESSAGES ============
// @desc    Get all messages for an order
// @route   GET /api/messages/order/:orderId
// @access  Private (Client or Freelancer of order)
exports.getOrderMessages = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }

        // Check if user is part of this order
        const isClient = order.clientId.toString() === req.userId;
        const isFreelancer = order.freelancerId.toString() === req.userId;

        if (!isClient && !isFreelancer) {
            return res.status(403).json({
                success: false,
                message: 'You are not part of this order',
            });
        }

        // Get all messages for this order
        const messages = await Message.find({ orderId: req.params.orderId })
            .populate('senderId', 'name profilePicture')
            .sort({ createdAt: 1 });

        // Mark messages as read (if receiver is viewing)
        await Message.updateMany(
            { orderId: req.params.orderId, receiverId: req.userId, isRead: false },
            { isRead: true }
        );

        res.json({
            success: true,
            count: messages.length,
            messages,
        });

    } catch (error) {
        next(error);
    }
};

// ============ GET GIG INQUIRY MESSAGES ============
// @desc    Get messages for a pre-order inquiry (flexible for specific sender-receiver pair)
// @route   GET /api/messages/gig/:gigId
// @access  Private
exports.getGigMessages = async (req, res, next) => {
    try {
        const gig = await Gig.findById(req.params.gigId);
        if (!gig) {
            return res.status(404).json({ success: false, message: 'Gig not found' });
        }

        // For pre-order inquiries, we look for messages where orderId is null
        // and both users are the sender/receiver.
        // If the viewer is the freelancer, they see conversations with multiple clients.
        // If the viewer is the potential client, they see their conversation with the freelancer.

        // We'll add a 'otherUser' query param to handle the freelancer's view
        const { clientId } = req.query;

        let query = {
            gigId: req.params.gigId,
            orderId: null
        };

        if (gig.freelancerId.toString() === req.userId) {
            // Freelancer viewing: needs to specify which client's inquiry to see
            if (!clientId) {
                return res.status(400).json({ success: false, message: 'ClientId required for freelancers' });
            }
            query.$or = [
                { senderId: req.userId, receiverId: clientId },
                { senderId: clientId, receiverId: req.userId }
            ];
        } else {
            // Potential client viewing: see conversation with freelancer
            query.$or = [
                { senderId: req.userId, receiverId: gig.freelancerId },
                { senderId: gig.freelancerId, receiverId: req.userId }
            ];
        }

        const messages = await Message.find(query)
            .populate('senderId', 'name profilePicture')
            .sort({ createdAt: 1 });

        // Mark as read
        await Message.updateMany(
            { ...query, receiverId: req.userId, isRead: false },
            { isRead: true }
        );

        res.json({
            success: true,
            count: messages.length,
            messages,
        });

    } catch (error) {
        next(error);
    }
};

// ============ MARK MESSAGE AS READ ============
// @desc    Mark a message as read
// @route   PUT /api/messages/:id/read
// @access  Private (Only receiver)
exports.markAsRead = async (req, res, next) => {
    try {
        const message = await Message.findById(req.params.id);

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found',
            });
        }

        // Only receiver can mark as read
        if (message.receiverId.toString() !== req.userId) {
            return res.status(403).json({
                success: false,
                message: 'Only receiver can mark message as read',
            });
        }

        message.isRead = true;
        await message.save();

        res.json({
            success: true,
            message: 'Message marked as read',
        });

    } catch (error) {
        next(error);
    }
};

// ============ GET UNREAD COUNT ============
// @desc    Get count of unread messages
// @route   GET /api/messages/unread
// @access  Private
exports.getUnreadCount = async (req, res, next) => {
    try {
        const count = await Message.countDocuments({
            receiverId: req.userId,
            isRead: false,
        });

        res.json({
            success: true,
            unreadCount: count,
        });

    } catch (error) {
        next(error);
    }
};

// ============ GET MY CONVERSATIONS ============
// @desc    Get list of dialogues (both order-based and inquiries)
// @route   GET /api/messages/conversations
// @access  Private
exports.getMyConversations = async (req, res, next) => {
    try {
        // 1. Get Order-based conversations (Existing logic refined)
        const orders = await Order.find({
            $or: [{ clientId: req.userId }, { freelancerId: req.userId }]
        })
            .populate('clientId', 'name profilePicture')
            .populate('freelancerId', 'name profilePicture')
            .populate('gigId', 'title')
            .sort({ updatedAt: -1 });

        const orderConversations = await Promise.all(
            orders.map(async (order) => {
                const lastMessage = await Message.findOne({ orderId: order._id }).sort({ createdAt: -1 });
                if (!lastMessage) return null;

                const unreadCount = await Message.countDocuments({
                    orderId: order._id, receiverId: req.userId, isRead: false
                });

                return {
                    orderId: order._id,
                    gig: order.gigId,
                    otherUser: order.clientId._id.toString() === req.userId ? order.freelancerId : order.clientId,
                    lastMessage: { message: lastMessage.message, createdAt: lastMessage.createdAt, isRead: lastMessage.isRead },
                    unreadCount,
                    type: 'order'
                };
            })
        );

        // 2. Get Gig-Inquiry conversations
        // We find unique pairs of (sender/receiver) for messages where orderId is null
        const inquiryMessages = await Message.find({
            orderId: null,
            $or: [{ senderId: req.userId }, { receiverId: req.userId }]
        })
            .populate('senderId', 'name profilePicture')
            .populate('receiverId', 'name profilePicture')
            .populate('gigId', 'title')
            .sort({ createdAt: -1 });

        // Group by (otherUser + gigId)
        const inquiryMap = new Map();
        for (const msg of inquiryMessages) {
            const otherUser = msg.senderId._id.toString() === req.userId ? msg.receiverId : msg.senderId;
            const key = `${otherUser._id}-${msg.gigId?._id || 'none'}`;

            if (!inquiryMap.has(key)) {
                // Count unread for this specific pairing
                const unreadCount = await Message.countDocuments({
                    gigId: msg.gigId?._id,
                    orderId: null,
                    receiverId: req.userId,
                    senderId: otherUser._id,
                    isRead: false
                });

                inquiryMap.set(key, {
                    gig: msg.gigId,
                    otherUser,
                    lastMessage: { message: msg.message, createdAt: msg.createdAt, isRead: msg.isRead },
                    unreadCount,
                    type: 'inquiry'
                });
            }
        }

        const activeInquiries = Array.from(inquiryMap.values());
        const activeOrderDocs = orderConversations.filter(c => c !== null);

        // Merge and sort
        const allConversations = [...activeOrderDocs, ...activeInquiries].sort(
            (a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt)
        );

        res.json({
            success: true,
            count: allConversations.length,
            conversations: allConversations,
        });

    } catch (error) {
        next(error);
    }
};
