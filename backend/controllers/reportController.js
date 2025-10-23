const { sequelize, Order } = require('../models/sql');
const Product = require('../models/mongo/product');
const { Op } = require('sequelize');

const asyncHandler = require('../middleware/asyncHandler');

/**
 * @desc    Get daily revenue report
 * @route   GET /api/reports/daily-revenue
 * @access  Private/Admin
 */
exports.getDailyRevenue = asyncHandler(async (req, res, next) => {
    const dailyRevenue = await Order.findAll({
        attributes: [
            [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
            [sequelize.fn('SUM', sequelize.col('total')), 'totalRevenue'],
        ],
        group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
        order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'DESC']],
        raw: true, // Return plain JSON objects
    });

    const report = dailyRevenue.map(row => ({
        date: row.date,
        total: (row.totalRevenue === null || row.totalRevenue === undefined)
            ? '0.00'
            : parseFloat(row.totalRevenue).toFixed(2),
    }));

    res.status(200).json({
        status: 'success',
        data: { report },
    });
});

/**
 * @desc    Get sales by category report
 * @route   GET /api/reports/category-sales
 * @access  Private/Admin
 */
exports.getCategorySales = asyncHandler(async (req, res, next) => {
    const categorySales = await Product.aggregate([
        {
            $group: {
                _id: '$category', // group key remains in _id
                count: { $sum: 1 },
            },
        },
        { $sort: { count: -1 } },
    ]);

    const report = categorySales.map(item => ({ _id: item._id, count: item.count }));

    res.status(200).json({
        status: 'success',
        data: { report },
    });
});

