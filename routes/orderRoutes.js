const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken } = require('../middleware/auth');
const { requireStaff } = require('../middleware/rbac');

// Apply authentication and staff requirement to all routes
router.use(authenticateToken);
router.use(requireStaff);

// GET /api/orders - Get all active orders with filtering
router.get('/', orderController.getAllActiveOrders);

// GET /api/orders/:id - Get order by ID
router.get('/:id', orderController.getOrderById);

// POST /api/orders - Create new order
router.post('/', orderController.createOrder);

// PUT /api/orders/:id - Update order
router.put('/:id', orderController.updateOrder);

// PATCH /api/orders/:id/status - Update order status
router.patch('/:id/status', orderController.updateOrderStatus);

// DELETE /api/orders/:id - Delete order (soft delete)
router.delete('/:id', orderController.deleteOrder);

module.exports = router;
