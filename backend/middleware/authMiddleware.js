const jwt = require('jsonwebtoken');
const { User } = require('../models/sql');

const AppError = require('./appError');
const asyncHandler = require('./asyncHandler');

/**
 * @desc    Verify JWT and attach user to request object
 */
exports.verifyToken = asyncHandler(async (req, res, next) => {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }

    if (!token) {
        return next(
            new AppError('You are not logged in. Please log in to get access.', 401)
        );
    }

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        return next(new AppError('Invalid token. Please log in again.', 401));
    }

    const currentUser = await User.findByPk(decoded.id);
    if (!currentUser) {
        return next(
            new AppError('The user belonging to this token no longer exists.', 401)
        );
    }

    req.user = {
        id: currentUser.id,
        role: currentUser.role,
    };
    next();
});

/**
 * @desc    Middleware to check for Admin role
 * @param   {...string} roles - List of roles allowed
 */
exports.isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    return next(new AppError('You do not have permission to perform this action.', 403));
};

