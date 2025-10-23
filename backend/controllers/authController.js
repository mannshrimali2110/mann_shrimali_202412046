const jwt = require('jsonwebtoken'); 
const bcrypt = require('bcryptjs');
const { User } = require('../models/sql');
const AppError = require('../middleware/appError');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * @desc    Sign a JWT token
 * @param   {string} id - The user ID
 * @param   {string} role - The user role
 * @returns {string} A signed JWT token
 */

const signToken = (id, role) => {
    const secret = process.env.JWT_SECRET || 'test_jwt_secret';
    const expiresIn = process.env.JWT_EXPIRES_IN || '1h';
    return jwt.sign({ id, role }, secret, {
        expiresIn,
    });
};

/**
 * @desc    Create a standardized response with a token and user data
 * @param   {object} user - The user object
 * @param   {number} statusCode - The HTTP status code
 * @param   {object} res - The Express response object
 */
const createSendToken = (user, statusCode, res) => {
    const token = signToken(user.id, user.role);

    const userObj = user.toJSON ? user.toJSON() : { ...user };
    delete userObj.passwordHash;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user: userObj,
        },
    });
};

exports.register = asyncHandler(async (req, res, next) => {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
        return next(new AppError('User already exists with this email', 400));
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const newUser = await User.create({
        name,
        email,
        passwordHash,
    });

    createSendToken(newUser, 201, res);
});

exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        return next(new AppError('Invalid credentials', 401));
    }

    createSendToken(user, 200, res);
});

