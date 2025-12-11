const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { isLoggedIn, checkRole } = require('../middleware/auth');

// @route   GET /api/subscriptions/plans
// @desc    Get all subscription plans
router.get('/plans', subscriptionController.getPlans);

// @route   GET /api/subscriptions
// @desc    Get user's subscriptions
router.get('/', isLoggedIn, subscriptionController.getUserSubscriptions);

// @route   POST /api/subscriptions
// @desc    Create a new subscription
router.post('/', isLoggedIn, subscriptionController.createSubscription);

// @route   POST /api/subscriptions/:id/paystack-webhook
// @desc    Paystack webhook for payment verification
router.post('/:id/paystack-webhook', subscriptionController.paystackWebhook);

// @route   POST /api/subscriptions/:id/cancel
// @desc    Cancel subscription
router.post('/:id/cancel', isLoggedIn, subscriptionController.cancelSubscription);

// @route   POST /api/subscriptions/:id/upgrade
// @desc    Upgrade subscription
router.post('/:id/upgrade', isLoggedIn, subscriptionController.upgradeSubscription);

// @route   GET /api/subscriptions/:id/limits
// @desc    Get subscription limits
router.get('/:id/limits', isLoggedIn, subscriptionController.getSubscriptionLimits);

module.exports = router;