const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const { isLoggedIn, checkRole } = require('../middleware/auth');

// @route   GET /api/clients
// @desc    Get all clients (admin only)
router.get('/', isLoggedIn, checkRole(['admin']), clientController.getClients);

// @route   GET /api/clients/:id
// @desc    Get client by ID
router.get('/by-user/:userId', isLoggedIn, clientController.getClientByUserId);
router.get('/:id', isLoggedIn, clientController.getClientById);

// @route   PUT /api/clients/:id
// @desc    Update client profile
router.put('/:id', isLoggedIn, checkRole(['client', 'admin']), clientController.updateClient);

// @route   GET /api/clients/:id/requests
// @desc    Get client's requests
router.get('/:id/requests', isLoggedIn, clientController.getClientRequests);

// @route   GET /api/clients/:id/stats
// @desc    Get client statistics
router.get('/:id/stats', isLoggedIn, clientController.getClientStats);

module.exports = router;