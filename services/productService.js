const { PrismaClient } = require('@prisma/client');
const { validateCreateProduct, validateUpdateProduct, validateProductBusinessLogic } = require('../validators/productValidator');
const { calculateCurrentStock } = require('./stockService');

const prisma = new PrismaClient();

/**
 * Create a new product
 * @param {Object} productData - Product data to create
 * @param {Object} user - User creating the product
 * @returns {Promise<Object>} Created product
 */
async function createProduct(productData, user) {
  // Validate input data
  const validation = validateCreateProduct(productData);
  if (!validation.isValid) {
    throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
  }

  const validatedData = validation.data;

  // Check if SKU already exists
  const existingProduct = await prisma.product.findUnique({
    where: { sku: validatedData.sku }
  });

  if (existingProduct) {
    throw new Error('Product with this SKU already exists');
  }

  // Validate business logic
  const businessValidation = validateProductBusinessLogic(validatedData);
  if (!businessValidation.isValid) {
    throw new Error(`Business validation failed: ${businessValidation.errors.map(e => e.message).join(', ')}`);
  }

  // Create product within a database transaction
  const result = await prisma.$transaction(async (tx) => {
    const product = await tx.product.create({
      data: {
        ...validatedData,
        isActive: true
      }
    });

    // Create audit log entry
    await tx.auditLog.create({
      data: {
        userId: user.userId || user.id,
        action: 'CREATE',
        entityType: 'PRODUCT',
        entityId: product.id,
        changes: {
          ...validatedData,
          createdBy: user.username
        }
      }
    });

    return product;
  });

  return result;
}

/**
 * Get all products with filtering and pagination
 * @param {Object} filters - Filter and pagination options
 * @returns {Promise<Object>} Products with pagination info
 */
async function getProducts(filters = {}) {
  const {
    page = 1,
    limit = 20,
    category,
    search,
    isActive = true,
    sortBy = 'name',
    sortOrder = 'asc'
  } = filters;

  const skip = (page - 1) * limit;
  const whereClause = {};

  // Build where clause
  if (isActive !== undefined) {
    whereClause.isActive = isActive;
  }

  if (category) {
    whereClause.category = category;
  }

  if (search) {
    whereClause.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { sku: { contains: search, mode: 'insensitive' } },
      { variant: { contains: search, mode: 'insensitive' } }
    ];
  }

  // Get total count for pagination
  const totalCount = await prisma.product.count({ where: whereClause });

  // Get products with current stock
  const products = await prisma.product.findMany({
    where: whereClause,
    select: {
      id: true,
      sku: true,
      name: true,
      category: true,
      size: true,
      variant: true,
      wholesaleCost: true,
      retailPrice: true,
      reorderThreshold: true,
      leadTimeDays: true,
      isActive: true,
      createdAt: true,
      updatedAt: true
    },
    orderBy: {
      [sortBy]: sortOrder
    },
    skip,
    take: limit
  });

  // Calculate current stock for each product
  const productIds = products.map(p => p.id);
  const stockPromises = productIds.map(async (productId) => {
    const stock = await calculateCurrentStock(productId);
    return { productId, stock };
  });

  const stockResults = await Promise.all(stockPromises);
  const stockMap = new Map(stockResults.map(r => [r.productId, r.stock]));

  // Add stock to products
  const productsWithStock = products.map(product => ({
    ...product,
    currentStock: stockMap.get(product.id) || 0,
    isLowStock: (stockMap.get(product.id) || 0) <= product.reorderThreshold
  }));

  return {
    products: productsWithStock,
    pagination: {
      page,
      limit,
      total: totalCount,
      pages: Math.ceil(totalCount / limit),
      hasNext: page * limit < totalCount,
      hasPrev: page > 1
    }
  };
}

/**
 * Get a single product by ID
 * @param {string} productId - Product ID
 * @returns {Promise<Object>} Product with current stock
 */
async function getProductById(productId) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      sku: true,
      name: true,
      category: true,
      size: true,
      variant: true,
      wholesaleCost: true,
      retailPrice: true,
      reorderThreshold: true,
      leadTimeDays: true,
      isActive: true,
      createdAt: true,
      updatedAt: true
    }
  });

  if (!product) {
    throw new Error('Product not found');
  }

  // Calculate current stock
  const currentStock = await calculateCurrentStock(productId);

  return {
    ...product,
    currentStock,
    isLowStock: currentStock <= product.reorderThreshold
  };
}

/**
 * Update a product
 * @param {string} productId - Product ID to update
 * @param {Object} updateData - Data to update
 * @param {Object} user - User updating the product
 * @returns {Promise<Object>} Updated product
 */
async function updateProduct(productId, updateData, user) {
  // Validate input data
  const validation = validateUpdateProduct(updateData);
  if (!validation.isValid) {
    throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
  }

  const validatedData = validation.data;

  // Check if product exists
  const existingProduct = await prisma.product.findUnique({
    where: { id: productId }
  });

  if (!existingProduct) {
    throw new Error('Product not found');
  }

  // Check if SKU is being changed and if it already exists
  if (validatedData.sku && validatedData.sku !== existingProduct.sku) {
    const skuExists = await prisma.product.findUnique({
      where: { sku: validatedData.sku }
    });

    if (skuExists) {
      throw new Error('Product with this SKU already exists');
    }
  }

  // Validate business logic
  const businessValidation = validateProductBusinessLogic(
    { ...existingProduct, ...validatedData, id: productId }
  );
  if (!businessValidation.isValid) {
    throw new Error(`Business validation failed: ${businessValidation.errors.map(e => e.message).join(', ')}`);
  }

  // Update product within a database transaction
  const result = await prisma.$transaction(async (tx) => {
    const updatedProduct = await tx.product.update({
      where: { id: productId },
      data: validatedData
    });

    // Create audit log entry
    await tx.auditLog.create({
      data: {
        userId: user.userId || user.id,
        action: 'UPDATE',
        entityType: 'PRODUCT',
        entityId: productId,
        changes: {
          oldData: existingProduct,
          newData: validatedData,
          updatedBy: user.username
        }
      }
    });

    return updatedProduct;
  });

  return result;
}

/**
 * Soft delete a product (set isActive to false)
 * @param {string} productId - Product ID to delete
 * @param {Object} user - User deleting the product
 * @returns {Promise<Object>} Updated product
 */
async function deleteProduct(productId, user) {
  // Check if product exists
  const existingProduct = await prisma.product.findUnique({
    where: { id: productId }
  });

  if (!existingProduct) {
    throw new Error('Product not found');
  }

  if (!existingProduct.isActive) {
    throw new Error('Product is already inactive');
  }

  // Soft delete product within a database transaction
  const result = await prisma.$transaction(async (tx) => {
    const deletedProduct = await tx.product.update({
      where: { id: productId },
      data: { isActive: false }
    });

    // Create audit log entry
    await tx.auditLog.create({
      data: {
        userId: user.userId || user.id,
        action: 'DELETE',
        entityType: 'PRODUCT',
        entityId: productId,
        changes: {
          productData: existingProduct,
          deletedBy: user.username,
          deletedAt: new Date().toISOString()
        }
      }
    });

    return deletedProduct;
  });

  return result;
}

/**
 * Restore a soft deleted product
 * @param {string} productId - Product ID to restore
 * @param {Object} user - User restoring the product
 * @returns {Promise<Object>} Restored product
 */
async function restoreProduct(productId, user) {
  // Check if product exists
  const existingProduct = await prisma.product.findUnique({
    where: { id: productId }
  });

  if (!existingProduct) {
    throw new Error('Product not found');
  }

  if (existingProduct.isActive) {
    throw new Error('Product is already active');
  }

  // Restore product within a database transaction
  const result = await prisma.$transaction(async (tx) => {
    const restoredProduct = await tx.product.update({
      where: { id: productId },
      data: { isActive: true }
    });

    // Create audit log entry
    await tx.auditLog.create({
      data: {
        userId: user.userId || user.id,
        action: 'CREATE', // Using CREATE for restoration
        entityType: 'PRODUCT',
        entityId: productId,
        changes: {
          productData: existingProduct,
          restoredBy: user.username,
          restoredAt: new Date().toISOString()
        }
      }
    });

    return restoredProduct;
  });

  return result;
}

/**
 * Get product categories
 * @returns {Promise<Array>} List of unique categories
 */
async function getProductCategories() {
  const categories = await prisma.product.findMany({
    where: { isActive: true },
    select: { category: true },
    distinct: ['category'],
    orderBy: { category: 'asc' }
  });

  return categories.map(c => c.category);
}

/**
 * Get product statistics
 * @returns {Promise<Object>} Product statistics
 */
async function getProductStatistics() {
  const [totalProducts, activeProducts, inactiveProducts, lowStockProducts] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.product.count({ where: { isActive: false } }),
    prisma.product.findMany({
      where: { isActive: true },
      select: { id: true, reorderThreshold: true }
    })
  ]);

  // Calculate low stock products
  const stockPromises = lowStockProducts.map(async (product) => {
    const stock = await calculateCurrentStock(product.id);
    return { productId: product.id, stock, threshold: product.reorderThreshold };
  });

  const stockResults = await Promise.all(stockPromises);
  const lowStockCount = stockResults.filter(r => r.stock <= r.threshold).length;

  return {
    totalProducts,
    activeProducts,
    inactiveProducts,
    lowStockProducts: lowStockCount
  };
}

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  restoreProduct,
  getProductCategories,
  getProductStatistics
};
