const express = require('express');
const router = express.Router();

const { register, login } = require('../controllers/authController');

const {
    validateUser,
    validateLogin,
} = require('../middleware/validationMiddleware');

router.post('/register', validateUser, register);
router.post('/login', validateLogin, login);

module.exports = router;

