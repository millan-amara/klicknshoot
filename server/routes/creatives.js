const express = require('express');
const router = express.Router();
const creativeController = require('../controllers/creativeController');
const { auth, checkRole, isLoggedIn } = require('../middleware/auth');
const upload = require('../middleware/upload');

// @route   GET /api/creatives
// @desc    Get all creatives (with filters)
router.get('/', creativeController.getCreatives);

// @route   GET /api/creatives/featured
// @desc    Get featured creatives
router.get('/featured', creativeController.getFeaturedCreatives);
router.get('/by-user/:userId', isLoggedIn, creativeController.getCreativeByUserId);

// @route   GET /api/creatives/:id
// @desc    Get creative by ID
router.get('/:id', creativeController.getCreativeById);


// @route   PUT /api/creatives/:id
// @desc    Update creative profile
router.put('/:id', isLoggedIn, checkRole(['creative', 'admin']), creativeController.updateCreative);

// @route   POST /api/creatives/:id/portfolio
// @desc    Add portfolio item
router.post('/:id/portfolio', isLoggedIn, checkRole(['creative', 'admin']), upload.single('media'), creativeController.addPortfolioItem);

// @route   DELETE /api/creatives/:id/portfolio/:itemId
// @desc    Remove portfolio item
router.delete('/:id/portfolio/:itemId', isLoggedIn, checkRole(['creative', 'admin']), creativeController.removePortfolioItem);

// @route   POST /api/creatives/:id/verify
// @desc    Submit for verification
router.post('/:id/verify', isLoggedIn, checkRole(['creative']), creativeController.submitForVerification);

// @route   GET /api/creatives/:id/proposals
// @desc    Get creative's proposals
router.get('/:id/proposals', isLoggedIn, creativeController.getCreativeProposals);

module.exports = router;