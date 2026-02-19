const Gig = require('../models/Gig');
const User = require('../models/User');

// ============ CREATE GIG ============
// @desc    Create a new gig (Freelancer only)
// @route   POST /api/gigs
// @access  Private
exports.createGig = async (req, res, next) => {
    try {
        // Check if user is freelancer
        const user = await User.findById(req.userId);

        if (!user || user.userType !== 'freelancer') {
            return res.status(403).json({
                success: false,
                message: 'Only freelancers can create gigs',
            });
        }

        // Create gig with freelancer ID
        const gigData = {
            ...req.body,
            freelancerId: req.userId,
        };

        const gig = await Gig.create(gigData);

        res.status(201).json({
            success: true,
            message: 'Gig created successfully',
            gig,
        });

    } catch (error) {
        next(error);
    }
};

// ============ GET ALL GIGS ============
// @desc    Get all active gigs (with filters)
// @route   GET /api/gigs
// @access  Public
exports.getAllGigs = async (req, res, next) => {
    try {
        const {
            category,
            minPrice,
            maxPrice,
            search,
            sortBy = 'createdAt',
            order = 'desc',
            page = 1,
            limit = 10
        } = req.query;

        // Build query
        const query = { status: 'active' };

        // Category filter
        if (category) {
            query.category = category;
        }

        // Price range filter
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        // Search in title and description
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } },
            ];
        }

        // Pagination
        const skip = (page - 1) * limit;

        // Sort options
        const sortOptions = {};
        sortOptions[sortBy] = order === 'asc' ? 1 : -1;

        // Execute query with populate
        const gigs = await Gig.find(query)
            .populate('freelancerId', 'name profilePicture rating')
            .skip(skip)
            .limit(Number(limit))
            .sort(sortOptions);

        // Total count
        const total = await Gig.countDocuments(query);

        res.json({
            success: true,
            count: gigs.length,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / limit),
            gigs,
        });

    } catch (error) {
        next(error);
    }
};

// ============ GET SINGLE GIG ============
// @desc    Get gig by ID
// @route   GET /api/gigs/:id
// @access  Public
exports.getGigById = async (req, res, next) => {
    try {
        const gig = await Gig.findById(req.params.id)
            .populate('freelancerId', 'name profilePicture rating totalReviews description skills');

        if (!gig) {
            return res.status(404).json({
                success: false,
                message: 'Gig not found',
            });
        }

        // Increment views
        gig.views += 1;
        await gig.save();

        res.json({
            success: true,
            gig,
        });

    } catch (error) {
        next(error);
    }
};

// ============ UPDATE GIG ============
// @desc    Update gig (Owner only)
// @route   PUT /api/gigs/:id
// @access  Private
exports.updateGig = async (req, res, next) => {
    try {
        let gig = await Gig.findById(req.params.id);

        if (!gig) {
            return res.status(404).json({
                success: false,
                message: 'Gig not found',
            });
        }

        // Check ownership
        if (gig.freelancerId.toString() !== req.userId) {
            return res.status(403).json({
                success: false,
                message: 'You can only update your own gigs',
            });
        }

        // Allowed fields to update
        const allowedUpdates = [
            'title',
            'description',
            'category',
            'price',
            'deliveryDays',
            'revisions',
            'images',
            'tags',
            'status'
        ];

        // Filter updates
        const updates = {};
        Object.keys(req.body).forEach((key) => {
            if (allowedUpdates.includes(key)) {
                updates[key] = req.body[key];
            }
        });
        updates.updatedAt = Date.now();

        // Update gig
        gig = await Gig.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'Gig updated successfully',
            gig,
        });

    } catch (error) {
        next(error);
    }
};

// ============ DELETE GIG ============
// @desc    Delete gig (Owner only)
// @route   DELETE /api/gigs/:id
// @access  Private
exports.deleteGig = async (req, res, next) => {
    try {
        const gig = await Gig.findById(req.params.id);

        if (!gig) {
            return res.status(404).json({
                success: false,
                message: 'Gig not found',
            });
        }

        // Check ownership
        if (gig.freelancerId.toString() !== req.userId) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own gigs',
            });
        }

        await Gig.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Gig deleted successfully',
        });

    } catch (error) {
        next(error);
    }
};

// ============ GET MY GIGS ============
// @desc    Get logged-in freelancer's gigs
// @route   GET /api/gigs/my
// @access  Private
exports.getMyGigs = async (req, res, next) => {
    try {
        const gigs = await Gig.find({ freelancerId: req.userId })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: gigs.length,
            gigs,
        });

    } catch (error) {
        next(error);
    }
};

// ============ GET GIGS BY FREELANCER ============
// @desc    Get all gigs by a specific freelancer
// @route   GET /api/gigs/freelancer/:freelancerId
// @access  Public
exports.getGigsByFreelancer = async (req, res, next) => {
    try {
        const gigs = await Gig.find({
            freelancerId: req.params.freelancerId,
            status: 'active'
        }).sort({ createdAt: -1 });

        res.json({
            success: true,
            count: gigs.length,
            gigs,
        });

    } catch (error) {
        next(error);
    }
};
