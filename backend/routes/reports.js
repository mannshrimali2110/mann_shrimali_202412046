const express = require('express');
const router = express.Router();
const {
    getDailyRevenue,
    getCategorySales,
} = require('../controllers/reportController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.use(verifyToken, isAdmin);

router.get('/daily-revenue', getDailyRevenue);

router.get('/category-sales', getCategorySales);

module.exports = router;
