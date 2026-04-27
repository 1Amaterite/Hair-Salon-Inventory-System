const { createTransaction, getTransactionHistory, getTransactionById, getTransactionSummary } = require('../services/transactionService');
const { getLowStockProducts } = require('../services/stockService');
const { validateTransaction, getTransactionHistorySchema } = require('../validators/transactionValidator');

/**
 * Create a new transaction
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function createTransactionHandler(req, res) {
  try {
    const transactionData = req.body;
    const user = req.user; // Assuming user is attached by auth middleware

    const transaction = await createTransaction(transactionData, user);

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: transaction
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create transaction',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

/**
 * Get transaction history with filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getTransactionHistoryHandler(req, res) {
  try {
    // Validate query parameters
    const validation = validateTransaction(req.query, getTransactionHistorySchema);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid query parameters',
        errors: validation.errors
      });
    }

    const filters = validation.data;
    const transactions = await getTransactionHistory(filters);

    res.status(200).json({
      success: true,
      message: 'Transaction history retrieved successfully',
      data: transactions,
      pagination: {
        limit: filters.limit,
        offset: filters.offset,
        total: transactions.length
      }
    });
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch transaction history',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

/**
 * Get a single transaction by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getTransactionByIdHandler(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Transaction ID is required'
      });
    }

    const transaction = await getTransactionById(id);

    res.status(200).json({
      success: true,
      message: 'Transaction retrieved successfully',
      data: transaction
    });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    
    if (error.message === 'Transaction not found') {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch transaction',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

/**
 * Get transaction summary statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getTransactionSummaryHandler(req, res) {
  try {
    const filters = req.query;
    const summary = await getTransactionSummary(filters);

    res.status(200).json({
      success: true,
      message: 'Transaction summary retrieved successfully',
      data: summary
    });
  } catch (error) {
    console.error('Error fetching transaction summary:', error);
    
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch transaction summary',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

/**
 * Get low stock products
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getLowStockHandler(req, res) {
  try {
    const lowStockProducts = await getLowStockProducts();

    res.status(200).json({
      success: true,
      message: 'Low stock products retrieved successfully',
      data: lowStockProducts
    });
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch low stock products',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

/**
 * Get stock level for a specific product
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getProductStockHandler(req, res) {
  try {
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    const { calculateCurrentStock } = require('../services/stockService');
    const currentStock = await calculateCurrentStock(productId);

    res.status(200).json({
      success: true,
      message: 'Product stock retrieved successfully',
      data: {
        productId,
        currentStock
      }
    });
  } catch (error) {
    console.error('Error fetching product stock:', error);
    
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch product stock',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

/**
 * Validate transaction data before creation (for form validation)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function validateTransactionHandler(req, res) {
  try {
    const transactionData = req.body;
    const user = req.user;

    // Basic validation
    const validation = validateTransaction(transactionData);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    // Check admin permission for ADJUSTMENT
    if (validation.data.type === 'ADJUSTMENT' && user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only ADMIN users can create ADJUSTMENT transactions'
      });
    }

    // Check for negative stock (simulation)
    if (validation.data.type !== 'ADJUSTMENT') {
      const { wouldCauseNegativeStock } = require('../services/stockService');
      const wouldBeNegative = await wouldCauseNegativeStock(
        validation.data.productId, 
        validation.data.quantity
      );

      if (wouldBeNegative) {
        return res.status(400).json({
          success: false,
          message: 'Transaction would cause negative stock',
          errors: [{
            field: 'quantity',
            message: 'This transaction would result in negative stock levels'
          }]
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Transaction data is valid',
      data: validation.data
    });
  } catch (error) {
    console.error('Error validating transaction:', error);
    
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to validate transaction',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

module.exports = {
  createTransactionHandler,
  getTransactionHistoryHandler,
  getTransactionByIdHandler,
  getTransactionSummaryHandler,
  getLowStockHandler,
  getProductStockHandler,
  validateTransactionHandler
};