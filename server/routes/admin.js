const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { auth, checkRole, isLoggedIn } = require('../middleware/auth');

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard stats
router.get('/dashboard', isLoggedIn, checkRole(['admin']), adminController.getDashboardStats);

// @route   GET /api/admin/verification-queue
// @desc    Get verification queue
router.get('/verification-queue', isLoggedIn, checkRole(['admin']), adminController.getVerificationQueue);

// @route   POST /api/admin/verification/:queueId/approve
// @desc    Approve verification
router.post('/verification/:queueId/approve', isLoggedIn, checkRole(['admin']), adminController.approveVerification);

// @route   POST /api/admin/verification/:queueId/reject
// @desc    Reject verification
router.post('/verification/:queueId/reject', isLoggedIn, checkRole(['admin']), adminController.rejectVerification);

// @route   GET /api/admin/users
// @desc    Get all users with filters
router.get('/users', isLoggedIn, checkRole(['admin']), adminController.getAllUsers);

// @route   POST /api/admin/users/:id/verify
// @desc    Manually verify user
router.post('/users/:id/verify', isLoggedIn, checkRole(['admin']), adminController.verifyUser);

// @route   GET /api/admin/requests
// @desc    Get all requests with filters
router.get('/requests', isLoggedIn, checkRole(['admin']), adminController.getAllRequests);

// @route   GET /api/admin/proposals
// @desc    Get all proposals with filters
router.get('/proposals', isLoggedIn, checkRole(['admin']), adminController.getAllProposals);

// @route   GET /api/admin/subscriptions
// @desc    Get all subscriptions
router.get('/subscriptions', isLoggedIn, checkRole(['admin']), adminController.getAllSubscriptions);

// @route   GET /api/admin/analytics
// @desc    Get platform analytics
router.get('/analytics', isLoggedIn, checkRole(['admin']), adminController.getAnalytics);

module.exports = router;