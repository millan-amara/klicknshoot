const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middleware/validation');

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', validateRegister, authController.register);

// @route   POST /api/auth/login
// @desc    Login user
router.post('/login', passport.authenticate('local'), validateLogin, authController.login);

// @route   POST /api/auth/logout
// @desc    Logout user
router.post('/logout', authController.logout);

// @route   GET /api/auth/me
// @desc    Get current user
router.get('/me', authController.getCurrentUser);

module.exports = router;