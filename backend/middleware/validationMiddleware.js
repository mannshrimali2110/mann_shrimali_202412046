const { body, validationResult, param } = require('express-validator');
const AppError = require('./appError');

/**
 * @desc    Middleware to handle the result of express-validator
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map(err => ({
            msg: err.msg,
            message: err.msg,
            path: err.param || err.path,
        }));
        return res.status(400).json({
            status: 'fail',
            errors: formattedErrors,
        });
    }
    next();
};

/**
 * @desc    Validation rules for user registration
 */
exports.validateUser = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required.'),
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required.')
        .isEmail()
        .withMessage('Please provide a valid email address.')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Password is required.')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long.'),
    handleValidationErrors,
];

/**
 * @desc    Validation rules for user login
 */
exports.validateLogin = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required.')
        .isEmail()
        .withMessage('Please provide a valid email address.')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Password is required.'),
    handleValidationErrors,
];

/**
 * @desc    Validation rules for creating/updating a product
 */
exports.validateProduct = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Product name is required.'),
    body('sku')
        .trim()
        .notEmpty()
        .withMessage('SKU is required.'),
    body('price')
        .isFloat({ gt: 0 })
        .withMessage('Price must be a number greater than 0.'),
    body('category')
        .trim()
        .notEmpty()
        .withMessage('Category is required.'),
    handleValidationErrors,
];

/**
 * @desc    Validation rules for updating a product
 *          All fields are optional but when present must be valid
 */
exports.validateProductUpdate = [
    body('name').optional().trim().notEmpty().withMessage('Product name cannot be empty.'),
    body('price').optional().isFloat({ gt: 0 }).withMessage('Price must be a number greater than 0.'),
    body('category').optional().trim().notEmpty().withMessage('Category cannot be empty.'),
    body('sku').optional().custom(() => {
        throw new Error('SKU cannot be updated.');
    }),
    handleValidationErrors,
];

/**
 * @desc    Validation for route params (e.g., :id)
 */
exports.validateParams = [
    param('id').trim().notEmpty().withMessage('ID parameter is required.').isMongoId().withMessage('Invalid ID format.'),
    handleValidationErrors,
];

/**
 * @desc    Validation rules for checkout
 */
exports.validateCheckout = [
    body('cart')
        .custom((value, { req }) => {
            if (!value || !Array.isArray(value) || value.length === 0) {
                throw new Error('Cart must be a non-empty array.');
            }
            return true;
        }),
    body('cart.*.productId')
        .trim()
        .notEmpty()
        .withMessage('Each cart item must have a productId.'),
    body('cart.*.productId').custom((val) => {
        if (!/^[a-fA-F0-9]{24}$/.test(val)) {
            throw new Error('Invalid product ID format');
        }
        return true;
    }),
    body('cart.*.quantity')
        .isInt({ gt: 0 })
        .withMessage('Item quantity must be a number greater than 0.'),
    handleValidationErrors,
];

