const express = require('express');
const router = express.Router();
const proposalController = require('../controllers/proposalController');
const { auth, checkRole, isLoggedIn } = require('../middleware/auth');
const { validateProposal } = require('../middleware/validation');

// @route   POST /api/proposals
// @desc    Submit a proposal
router.post('/', isLoggedIn, checkRole(['creative']), validateProposal, proposalController.submitProposal);

// @route   GET /api/proposals/:id
// @desc    Get proposal by ID
router.get('/:id', isLoggedIn, proposalController.getProposalById);

// @route   PUT /api/proposals/:id
// @desc    Update proposal
router.put('/:id', isLoggedIn, checkRole(['creative', 'admin']), proposalController.updateProposal);

// @route   POST /api/proposals/:id/accept
// @desc    Accept a proposal
router.post('/:id/accept', isLoggedIn, checkRole(['client', 'admin']), proposalController.acceptProposal);

// @route   POST /api/proposals/:id/reject
// @desc    Reject a proposal
router.post('/:id/reject', isLoggedIn, checkRole(['client', 'admin']), proposalController.rejectProposal);

// @route   POST /api/proposals/:id/withdraw
// @desc    Withdraw a proposal
router.post('/:id/withdraw', isLoggedIn, checkRole(['creative', 'admin']), proposalController.withdrawProposal);

// @route   POST /api/proposals/:id/whatsapp
// @desc    Generate WhatsApp contact link
router.post('/:id/whatsapp', isLoggedIn, proposalController.generateWhatsAppLink);

module.exports = router;