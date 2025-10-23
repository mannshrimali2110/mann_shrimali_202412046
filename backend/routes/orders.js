const express = require('express');
const router = express.Router();
const { checkout } = require('../controllers/orderController');
const { verifyToken } = require('../middleware/authMiddleware');
const { validateCheckout } = require('../middleware/validationMiddleware');

const normalizeCart = (req, res, next) => {
	if (Array.isArray(req.body)) {
		req.body = { cart: req.body };
	}
	next();
};

router.post('/checkout', [verifyToken, normalizeCart, validateCheckout], checkout);

module.exports = router;

