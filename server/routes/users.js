const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth, checkRole, isLoggedIn } = require('../middleware/auth');

// @route   GET /api/users
// @desc    Get all users (admin only)
router.get('/', isLoggedIn, checkRole(['admin']), userController.getAllUsers);

// @route   GET /api/users/:id
// @desc    Get user by ID
router.get('/:id', isLoggedIn, userController.getUserById);

// @route   PUT /api/users/:id
// @desc    Update user
router.put('/:id', isLoggedIn, userController.updateUser);

// @route   DELETE /api/users/:id
// @desc    Delete user (admin only)
router.delete('/:id', isLoggedIn, checkRole(['admin']), userController.deleteUser);

// @route   GET /api/users/:id/stats
// @desc    Get user statistics
router.get('/:id/stats', isLoggedIn, userController.getUserStats);

module.exports = router;