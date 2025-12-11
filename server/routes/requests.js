const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { auth, checkRole, isLoggedIn } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');

// @route   GET /api/requests
// @desc    Get all requests (with filters)
router.get('/', requestController.getRequests);

// @route   GET /api/requests/featured
// @desc    Get featured requests
router.get('/featured', requestController.getFeaturedRequests);

// @route   GET /api/requests/:id
// @desc    Get request by ID
router.get('/:id', requestController.getRequestById);

// @route   POST /api/requests
// @desc    Create a new request
router.post('/', isLoggedIn, checkRole(['client']), validateRequest, requestController.createRequest);

// @route   PUT /api/requests/:id
// @desc    Update request
router.put('/:id', isLoggedIn, checkRole(['client', 'admin']), requestController.updateRequest);

// @route   DELETE /api/requests/:id
// @desc    Delete request
router.delete('/:id', isLoggedIn, checkRole(['client', 'admin']), requestController.deleteRequest);

// @route   POST /api/requests/:id/close
// @desc    Close a request
router.post('/:id/close', isLoggedIn, checkRole(['client', 'admin']), requestController.closeRequest);

// @route   POST /api/requests/:id/reopen
// @desc    Reopen a request
router.post('/:id/reopen', isLoggedIn, checkRole(['client', 'admin']), requestController.reopenRequest);

// @route   GET /api/requests/:id/proposals
// @desc    Get proposals for a request
router.get('/:id/proposals', isLoggedIn, requestController.getRequestProposals);

module.exports = router;