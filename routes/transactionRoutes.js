const express = require('express');
const router = express.Router();
const {
  createTransactionHandler,
  getTransactionHistoryHandler,
  getTransactionByIdHandler,
  getTransactionSummaryHandler,
  getLowStockHandler,
  getProductStockHandler,
  validateTransactionHandler
} = require('../controllers/transactionController');
const { authenticateToken } = require('../middleware/auth');
const { requireAdmin, requireStaff } = require('../middleware/rbac');

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * POST /api/transactions
 * Create a new transaction
 * Access: All authenticated users (with restrictions for ADJUSTMENT)
 */
router.post('/', createTransactionHandler);

/**
 * POST /api/transactions/validate
 * Validate transaction data before creation
 * Access: All authenticated users
 */
router.post('/validate', validateTransactionHandler);

/**
 * GET /api/transactions
 * Get transaction history with filtering
 * Access: All authenticated users
 */
router.get('/', getTransactionHistoryHandler);

/**
 * GET /api/transactions/summary
 * Get transaction summary statistics
 * Access: All authenticated users
 */
router.get('/summary', getTransactionSummaryHandler);

/**
 * GET /api/transactions/low-stock
 * Get products with low stock levels
 * Access: All authenticated users
 */
router.get('/low-stock', getLowStockHandler);

/**
 * GET /api/transactions/:id
 * Get a specific transaction by ID
 * Access: All authenticated users
 */
router.get('/:id', getTransactionByIdHandler);

/**
 * GET /api/transactions/product/:productId/stock
 * Get current stock for a specific product
 * Access: All authenticated users
 */
router.get('/product/:productId/stock', getProductStockHandler);

module.exports = router;
