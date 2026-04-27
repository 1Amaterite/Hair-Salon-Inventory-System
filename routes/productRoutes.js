const express = require('express');
const router = express.Router();
const {
  createProductHandler,
  getProductsHandler,
  getProductByIdHandler,
  updateProductHandler,
  deleteProductHandler,
  restoreProductHandler,
  getProductCategoriesHandler,
  getProductStatisticsHandler
} = require('../controllers/productController');
const { authenticateToken } = require('../middleware/auth');
const { requireAdmin, requireStaff } = require('../middleware/rbac');

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * GET /api/products
 * Get all products with filtering and pagination
 * Access: All authenticated users
 */
router.get('/', getProductsHandler);

/**
 * GET /api/products/statistics
 * Get product statistics
 * Access: All authenticated users
 */
router.get('/statistics', getProductStatisticsHandler);

/**
 * GET /api/products/categories
 * Get product categories
 * Access: All authenticated users
 */
router.get('/categories', getProductCategoriesHandler);

/**
 * GET /api/products/:id
 * Get a single product by ID
 * Access: All authenticated users
 */
router.get('/:id', getProductByIdHandler);

/**
 * POST /api/products
 * Create a new product
 * Access: ADMIN only
 */
router.post('/', requireAdmin, createProductHandler);

/**
 * PUT /api/products/:id
 * Update a product
 * Access: ADMIN only
 */
router.put('/:id', requireAdmin, updateProductHandler);

/**
 * DELETE /api/products/:id
 * Soft delete a product
 * Access: ADMIN only
 */
router.delete('/:id', requireAdmin, deleteProductHandler);

/**
 * POST /api/products/:id/restore
 * Restore a soft deleted product
 * Access: ADMIN only
 */
router.post('/:id/restore', requireAdmin, restoreProductHandler);

module.exports = router;
