const express = require('express');
const { register, login } = require('../controllers/authController');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new patient
// @access  Public
router.post('/register', register);

// @route   POST /api/auth/login
// @desc    Login user (all roles)
// @access  Public
router.post('/login', login);

module.exports = router;
