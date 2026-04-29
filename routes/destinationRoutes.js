const express = require('express');
const router = express.Router();
const destinationController = require('../controllers/destinationController');
const { authenticateToken } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/rbac');

// Apply authentication and admin requirement to all routes
router.use(authenticateToken);
router.use(requireAdmin);

// GET /api/destinations - Get all destinations with filtering
router.get('/', destinationController.getAllDestinations);

// GET /api/destinations/:id - Get destination by ID
router.get('/:id', destinationController.getDestinationById);

// POST /api/destinations - Create new destination
router.post('/', destinationController.createDestination);

// PUT /api/destinations/:id - Update destination
router.put('/:id', destinationController.updateDestination);

// DELETE /api/destinations/:id - Delete destination (soft delete)
router.delete('/:id', destinationController.deleteDestination);

module.exports = router;
