const { sequelize, Order, OrderItem } = require('../models/sql');
const Product = require('../models/mongo/product');
const AppError = require('../middleware/appError');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * @desc    Create a new order
 * @route   POST /api/orders/checkout
 * @access  Private (Customers only)
 */
exports.checkout = asyncHandler(async (req, res, next) => {
    const cartItems = req.body.cart || req.body;
    const userId = req.user.id; // From verifyToken middleware

    if (!cartItems || cartItems.length === 0) {
        return next(new AppError('Cart must be a non-empty array.', 400));
    }

    const result = await sequelize.transaction(async (t) => {
        let totalOrderAmount = 0;
        const orderItemsToCreate = [];

        for (const item of cartItems) {
            const product = await Product.findById(item.productId);
            if (!product) {
                throw new AppError(`No product found with ID ${item.productId}`, 404);
            }

            const priceAtPurchase = product.price;
            const quantity = parseInt(item.quantity, 10);

            if (isNaN(quantity) || quantity <= 0) {
                throw new AppError(`Invalid quantity for product: ID ${item.productId}`, 400);
            }

            totalOrderAmount += priceAtPurchase * quantity;

            orderItemsToCreate.push({
                productId: item.productId,
                quantity: quantity,
                priceAtPurchase: priceAtPurchase.toFixed(2),
            });
        }

        const newOrder = await Order.create({
            userId: userId,
            total: totalOrderAmount.toFixed(2),
        }, { transaction: t }); // Pass the transaction object

        const fullOrderItems = orderItemsToCreate.map(item => ({
            ...item,
            orderId: newOrder.id,
        }));

        await OrderItem.bulkCreate(fullOrderItems, { transaction: t });

        return newOrder;
    });

    res.status(201).json({
        status: 'success',
        data: {
            order: {
                id: result.id,
                userId: result.userId,
                total: result.total,
            },
        },
    });
});

