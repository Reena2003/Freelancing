const User = require('../models/User');

// ============ GET USER PROFILE ============
// @desc    Get user profile by ID (public view)
// @route   GET /api/users/:id
// @access  Public
exports.getUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Return public profile data
        res.json({
            success: true,
            user: user.getPublicProfile(),
        });

    } catch (error) {
        next(error);
    }
};

// ============ UPDATE MY PROFILE ============
// @desc    Update logged-in user's profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
    try {
        // Allowed fields to update
        const allowedUpdates = [
            'name',
            'description',
            'profilePicture',
            'skills',
            'category'
        ];

        // Filter only allowed fields from request body
        const updates = {};
        Object.keys(req.body).forEach((key) => {
            if (allowedUpdates.includes(key)) {
                updates[key] = req.body[key];
            }
        });

        // Add updatedAt timestamp
        updates.updatedAt = Date.now();

        // Find and update user
        const user = await User.findByIdAndUpdate(
            req.userId,
            updates,
            {
                new: true,           // Return updated document
                runValidators: true, // Run model validators
            }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: user.getPublicProfile(),
        });

    } catch (error) {
        next(error);
    }
};

// ============ GET ALL FREELANCERS ============
// @desc    Get all freelancers (for clients to browse)
// @route   GET /api/users/freelancers
// @access  Public
exports.getAllFreelancers = async (req, res, next) => {
    try {
        // Query parameters for filtering
        const { category, skill, rating, page = 1, limit = 10 } = req.query;

        // Build query object
        const query = { userType: 'freelancer' };

        // Add filters if provided
        if (category) {
            query.category = category;
        }

        if (skill) {
            query.skills = { $in: [skill] };  // Check if skill exists in skills array
        }

        if (rating) {
            query.rating = { $gte: Number(rating) };  // Minimum rating
        }

        // Pagination
        const skip = (page - 1) * limit;

        // Execute query
        const freelancers = await User.find(query)
            .select('-password')
            .skip(skip)
            .limit(Number(limit))
            .sort({ rating: -1 });  // Sort by rating (highest first)

        // Get total count for pagination
        const total = await User.countDocuments(query);

        res.json({
            success: true,
            count: freelancers.length,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / limit),
            freelancers,
        });

    } catch (error) {
        next(error);
    }
};

// ============ DELETE MY ACCOUNT ============
// @desc    Delete logged-in user's account
// @route   DELETE /api/users/profile
// @access  Private
exports.deleteAccount = async (req, res, next) => {
    try {
        const user = await User.findByIdAndDelete(req.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        res.json({
            success: true,
            message: 'Account deleted successfully',
        });

    } catch (error) {
        next(error);
    }
};
