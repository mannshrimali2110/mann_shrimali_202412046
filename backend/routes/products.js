const express = require('express');
const router = express.Router();
const {
    createProduct,
    updateProduct,
    deleteProduct,
    getAllProducts,
    getProductById,
} = require('../controllers/productController');

const {
    verifyToken,
    isAdmin,
} = require('../middleware/authMiddleware');

const {
    validateProduct,
    validateProductUpdate,
    validateParams,
} = require('../middleware/validationMiddleware');


router.post(
    '/',
    [verifyToken, isAdmin, validateProduct],
    createProduct
);

router.put(
    '/:id',
    [verifyToken, isAdmin, validateParams, validateProductUpdate],
    updateProduct
);

router.delete(
    '/:id',
    [verifyToken, isAdmin, validateParams],
    deleteProduct
);

router.get('/', getAllProducts);

router.get('/:id', validateParams, getProductById);

module.exports = router;

