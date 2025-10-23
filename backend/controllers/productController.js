const Product = require('../models/mongo/product'); 
const AppError = require('../middleware/appError');
const asyncHandler = require('../middleware/asyncHandler');


/**
 * @desc    Create a new product
 * @route   POST /api/products
 * @access  Private/Admin
 */
exports.createProduct = asyncHandler(async (req, res, next) => {
    const { sku, name, price, category } = req.body;

    const product = await Product.create({
        sku,
        name,
        price,
        category,
    });

    res.status(201).json({
        status: 'success',
        data: {
            product,
        },
    });
});

/**
 * @desc    Update a product
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 */
exports.updateProduct = asyncHandler(async (req, res, next) => {
    const { sku, ...updateData } = req.body;

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        runValidators: true,
    });

    if (!product) {
        return next(new AppError('No product found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            product,
        },
    });
});

/**
 * @desc    Delete a product
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
exports.deleteProduct = asyncHandler(async (req, res, next) => {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
        return next(new AppError('No product found with that ID', 404));
    }

    res.status(204).json({
        status: 'success',
        data: null,
    });
});


/**
 * @desc    Get all products with filtering, sorting, pagination
 * @route   GET /api/products
 * @access  Public
 */
exports.getAllProducts = asyncHandler(async (req, res, next) => {
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    if (queryObj.name) {
        queryObj.name = { $regex: queryObj.name, $options: 'i' }; // 'i' for case-insensitive
    }

    let query = Product.find(queryObj);

    let sortBy = { price: -1 }; // -1 for descending

    if (req.query.sort === 'price_asc') {
        sortBy = { price: 1 }; // 1 for ascending
    }

    query = query.sort(sortBy);

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    const products = await query;

    const totalProducts = await Product.countDocuments(queryObj);

    res.status(200).json({
        status: 'success',
        data: {
            products,
            pagination: {
                page: page,
                totalPages: Math.ceil(totalProducts / limit),
                totalProducts: totalProducts,
            },
        },
    });
});

/**
 * @desc    Get a single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
exports.getProductById = asyncHandler(async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(new AppError('No product found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            product,
        },
    });
});

