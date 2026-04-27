const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Calculate current stock for a specific product by summing all transactions
 * @param {string} productId - The product ID
 * @returns {Promise<number>} Current stock level
 */
async function calculateCurrentStock(productId) {
  const result = await prisma.transaction.aggregate({
    where: {
      productId: productId
    },
    _sum: {
      quantity: true
    }
  });

  return result._sum.quantity || 0;
}

/**
 * Calculate current stock for multiple products
 * @param {string[]} productIds - Array of product IDs
 * @returns {Promise<Map<string, number>>} Map of product IDs to stock levels
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

/**
 * Check if a transaction would result in negative stock
 * @param {string} productId - The product ID
 * @param {number} quantity - The transaction quantity (negative for outbound)
 * @returns {Promise<boolean>} True if transaction would cause negative stock
 */
async function wouldCauseNegativeStock(productId, quantity) {
  if (quantity >= 0) return false; // Inbound transactions can't cause negative stock

  const currentStock = await calculateCurrentStock(productId);
  return (currentStock + quantity) < 0;
}

/**
 * Get low stock products based on their reorder thresholds
 * @returns {Promise<Array>} Array of products with low stock
 */
async function getLowStockProducts() {
  const products = await prisma.product.findMany({
    where: {
      isActive: true
    },
    select: {
      id: true,
      sku: true,
      name: true,
      reorderThreshold: true
    }
  });

  const productIds = products.map(p => p.id);
  const stockMap = await calculateMultipleStock(productIds);

  const lowStockProducts = products.filter(product => {
    const currentStock = stockMap.get(product.id) || 0;
    return currentStock <= product.reorderThreshold;
  });

  return lowStockProducts.map(product => ({
    ...product,
    currentStock: stockMap.get(product.id) || 0
  }));
}

/**
 * Get transaction history for a product
 * @param {string} productId - The product ID
 * @param {Object} options - Query options (limit, offset, dateRange)
 * @returns {Promise<Array>} Transaction history
 */
async function getProductTransactionHistory(productId, options = {}) {
  const { limit = 50, offset = 0, startDate, endDate } = options;

  const whereClause = {
    productId: productId
  };

  if (startDate || endDate) {
    whereClause.createdAt = {};
    if (startDate) whereClause.createdAt.gte = new Date(startDate);
    if (endDate) whereClause.createdAt.lte = new Date(endDate);
  }

  return await prisma.transaction.findMany({
    where: whereClause,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          username: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: limit,
    skip: offset
  });
}

module.exports = {
  calculateCurrentStock,
  calculateMultipleStock,
  wouldCauseNegativeStock,
  getLowStockProducts,
  getProductTransactionHistory
};
