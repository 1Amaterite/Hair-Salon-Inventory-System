const { PrismaClient } = require('@prisma/client');
const { validateTransaction, validateQuantityByType } = require('../validators/transactionValidator');
const { wouldCauseNegativeStock, calculateCurrentStock } = require('./stockService');

const prisma = new PrismaClient();

/**
 * Create a new transaction with full validation and ACID compliance
 * @param {Object} transactionData - Transaction data
 * @param {Object} user - User object performing the transaction
 * @returns {Promise<Object>} Created transaction
 */
async function createTransaction(transactionData, user) {
  // Validate input data
  const validation = validateTransaction(transactionData);
  if (!validation.isValid) {
    throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
  }

  const { productId, type, quantity, remarks } = validation.data;

  // Additional validation for quantity based on type
  const quantityValidation = validateQuantityByType(quantity, type);
  if (!quantityValidation.isValid) {
    throw new Error(`Quantity validation failed: ${quantityValidation.errors.map(e => e.message).join(', ')}`);
  }

  // Check if user has permission for ADJUSTMENT transactions
  if (type === 'ADJUSTMENT' && user.role !== 'ADMIN') {
    throw new Error('Only ADMIN users can create ADJUSTMENT transactions');
  }

  // Verify product exists and is active
  const product = await prisma.product.findUnique({
    where: { id: productId }
  });

  if (!product) {
    throw new Error('Product not found');
  }

  if (!product.isActive) {
    throw new Error('Product is not active');
  }

  // Check for negative stock prevention (except for ADJUSTMENT)
  if (type !== 'ADJUSTMENT' && await wouldCauseNegativeStock(productId, quantity)) {
    const currentStock = await calculateCurrentStock(productId);
    throw new Error(`Transaction would cause negative stock. Current stock: ${currentStock}, Attempted quantity: ${quantity}`);
  }

  // Create transaction within a database transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create the transaction record
    const transaction = await tx.transaction.create({
      data: {
        productId,
        userId: user.userId || user.id, // Support both JWT userId and legacy user.id
        type,
        quantity,
        remarks: remarks || null
      },
      include: {
        product: {
          select: {
            id: true,
            sku: true,
            name: true,
            category: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            role: true
          }
        }
      }
    });

    // Create audit log entry
    await tx.auditLog.create({
      data: {
        userId: user.userId || user.id,
        action: 'CREATE',
        entityType: 'TRANSACTION',
        entityId: transaction.id,
        changes: {
          productId,
          type,
          quantity,
          remarks,
          createdBy: user.username
        }
      }
    });

    return transaction;
  });

  return result;
}

/**
 * Get transaction history with filtering options
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>} Transaction history
 */
async function getTransactionHistory(filters = {}) {
  const {
    productId,
    userId,
    type,
    startDate,
    endDate,
    limit = 50,
    offset = 0
  } = filters;

  const whereClause = {};

  if (productId) whereClause.productId = productId;
  if (userId) whereClause.userId = userId;
  if (type) whereClause.type = type;

  if (startDate || endDate) {
    whereClause.createdAt = {};
    if (startDate) whereClause.createdAt.gte = new Date(startDate);
    if (endDate) whereClause.createdAt.lte = new Date(endDate);
  }

  const transactions = await prisma.transaction.findMany({
    where: whereClause,
    include: {
      product: {
        select: {
          id: true,
          sku: true,
          name: true,
          category: true
        }
      },
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          role: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: limit,
    skip: offset
  });

  // Calculate current stock for each product
  const productIds = [...new Set(transactions.map(t => t.productId))];
  const stockMap = await calculateMultipleStock(productIds);

  return transactions.map(transaction => ({
    ...transaction,
    currentStock: stockMap.get(transaction.productId) || 0
  }));
}

/**
 * Get a single transaction by ID
 * @param {string} transactionId - Transaction ID
 * @returns {Promise<Object>} Transaction details
 */
async function getTransactionById(transactionId) {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: {
      product: {
        select: {
          id: true,
          sku: true,
          name: true,
          category: true,
          wholesaleCost: true,
          retailPrice: true
        }
      },
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          role: true
        }
      }
    }
  });

  if (!transaction) {
    throw new Error('Transaction not found');
  }

  // Calculate current stock for the product
  const currentStock = await calculateCurrentStock(transaction.productId);

  return {
    ...transaction,
    currentStock
  };
}

/**
 * Get transaction summary statistics
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} Summary statistics
 */
async function getTransactionSummary(filters = {}) {
  const { startDate, endDate, productId } = filters;

  const whereClause = {};
  if (productId) whereClause.productId = productId;

  if (startDate || endDate) {
    whereClause.createdAt = {};
    if (startDate) whereClause.createdAt.gte = new Date(startDate);
    if (endDate) whereClause.createdAt.lte = new Date(endDate);
  }

  const summary = await prisma.transaction.groupBy({
    by: ['type'],
    where: whereClause,
    _sum: {
      quantity: true
    },
    _count: {
      id: true
    }
  });

  return summary.map(item => ({
    type: item.type,
    totalQuantity: item._sum.quantity || 0,
    transactionCount: item._count.id || 0
  }));
}

/**
 * Helper function to calculate stock for multiple products
 * @param {string[]} productIds - Array of product IDs
 * @returns {Promise<Map>} Map of product IDs to stock levels
 */
async function calculateMultipleStock(productIds) {
  const stockResults = await prisma.transaction.groupBy({
    by: ['productId'],
    where: {
      productId: {
        in: productIds
      }
    },
    _sum: {
      quantity: true
    }
  });

  const stockMap = new Map();
  productIds.forEach(id => {
    stockMap.set(id, 0);
  });

  stockResults.forEach(result => {
    stockMap.set(result.productId, result._sum.quantity || 0);
  });

  return stockMap;
}

module.exports = {
  createTransaction,
  getTransactionHistory,
  getTransactionById,
  getTransactionSummary,
  calculateMultipleStock
};
