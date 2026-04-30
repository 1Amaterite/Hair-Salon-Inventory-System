const { z } = require('zod');

// Base product schema for common validations
const productBaseSchema = {
  sku: z.string()
    .min(1, 'SKU is required')
    .max(50, 'SKU cannot exceed 50 characters')
    .refine(val => val.trim().length > 0, 'SKU cannot be just whitespace')
    .refine(val => /^[a-zA-Z0-9\-_]+$/.test(val), 'SKU can only contain letters, numbers, hyphens, and underscores')
    .refine(val => val.replace(/[^a-zA-Z0-9]/g, '').length >= 2, 'SKU must contain at least 2 alphanumeric characters'),
  name: z.string()
    .min(1, 'Product name is required')
    .max(200, 'Product name cannot exceed 200 characters')
    .refine(val => val.trim().length > 0, 'Product name cannot be just whitespace')
    .refine(val => val.replace(/[^a-zA-Z0-9]/g, '').length >= 2, 'Product name must contain at least 2 alphanumeric characters'),
  category: z.string().min(1, 'Category is required').max(100, 'Category cannot exceed 100 characters'),
  size: z.string()
    .max(50, 'Size cannot exceed 50 characters')
    .refine(val => !val || val.trim().length > 0, 'Size cannot be just whitespace')
    .optional(),
  variant: z.string()
    .max(100, 'Variant cannot exceed 100 characters')
    .refine(val => !val || val.trim().length > 0, 'Variant cannot be just whitespace')
    .optional(),
  wholesaleCost: z.number().positive('Wholesale cost must be positive').max(99999.99, 'Wholesale cost cannot exceed 99999.99'),
  retailPrice: z.number().positive('Retail price must be positive').max(99999.99, 'Retail price cannot exceed 99999.99'),
  reorderThreshold: z.number().min(0, 'Reorder threshold cannot be negative').max(9999, 'Reorder threshold cannot exceed 9999'),
  leadTimeDays: z.number().min(0, 'Lead time days cannot be negative').max(365, 'Lead time days cannot exceed 365')
};

// Create product schema
const createProductSchema = z.object(productBaseSchema);

// Update product schema (all fields optional)
const updateProductSchema = z.object({
  sku: z.string()
    .min(1, 'SKU is required')
    .max(50, 'SKU cannot exceed 50 characters')
    .refine(val => val.trim().length > 0, 'SKU cannot be just whitespace')
    .refine(val => /^[a-zA-Z0-9\-_]+$/.test(val), 'SKU can only contain letters, numbers, hyphens, and underscores')
    .refine(val => val.replace(/[^a-zA-Z0-9]/g, '').length >= 2, 'SKU must contain at least 2 alphanumeric characters')
    .optional(),
  name: z.string()
    .min(1, 'Product name is required')
    .max(200, 'Product name cannot exceed 200 characters')
    .refine(val => val.trim().length > 0, 'Product name cannot be just whitespace')
    .refine(val => val.replace(/[^a-zA-Z0-9]/g, '').length >= 2, 'Product name must contain at least 2 alphanumeric characters')
    .optional(),
  category: z.string().min(1, 'Category is required').max(100, 'Category cannot exceed 100 characters').optional(),
  size: z.string()
    .max(50, 'Size cannot exceed 50 characters')
    .refine(val => !val || val.trim().length > 0, 'Size cannot be just whitespace')
    .optional(),
  variant: z.string()
    .max(100, 'Variant cannot exceed 100 characters')
    .refine(val => !val || val.trim().length > 0, 'Variant cannot be just whitespace')
    .optional(),
  wholesaleCost: z.number().positive('Wholesale cost must be positive').max(99999.99, 'Wholesale cost cannot exceed 99999.99').optional(),
  retailPrice: z.number().positive('Retail price must be positive').max(99999.99, 'Retail price cannot exceed 99999.99').optional(),
  reorderThreshold: z.number().min(0, 'Reorder threshold cannot be negative').max(9999, 'Reorder threshold cannot exceed 9999').optional(),
  leadTimeDays: z.number().min(0, 'Lead time days cannot be negative').max(365, 'Lead time days cannot exceed 365').optional()
});

// Query parameters schema for getting products
const getProductsQuerySchema = z.object({
  page: z.string().transform(val => parseInt(val) || 1).pipe(z.number().min(1, 'Page must be at least 1')).optional(),
  limit: z.string().transform(val => parseInt(val) || 20).pipe(z.number().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100')).optional(),
  category: z.string().max(100, 'Category filter cannot exceed 100 characters').optional(),
  search: z.string().max(200, 'Search term cannot exceed 200 characters').optional(),
  isActive: z.string().transform(val => val === 'true').pipe(z.boolean()).optional(),
  sortBy: z.enum(['name', 'sku', 'category', 'wholesaleCost', 'retailPrice', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
});

// Product ID parameter schema
const productIdParamSchema = z.object({
  id: z.string().min(1, 'Product ID is required')
});

/**
 * Validate product data for creation
 * @param {Object} data - Product data to validate
 * @returns {Object} Validation result
 */
function validateCreateProduct(data) {
  const result = createProductSchema.safeParse(data);
  
  if (!result.success) {
    const errors = result.error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code
    }));

    return {
      isValid: false,
      errors,
      data: null
    };
  }

  return {
    isValid: true,
    errors: [],
    data: result.data
  };
}

/**
 * Validate product data for update
 * @param {Object} data - Product data to validate
 * @returns {Object} Validation result
 */
function validateUpdateProduct(data) {
  const result = updateProductSchema.safeParse(data);
  
  if (!result.success) {
    const errors = result.error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code
    }));

    return {
      isValid: false,
      errors,
      data: null
    };
  }

  return {
    isValid: true,
    errors: [],
    data: result.data
  };
}

/**
 * Validate query parameters for getting products
 * @param {Object} query - Query parameters
 * @returns {Object} Validation result
 */
function validateGetProductsQuery(query) {
  const result = getProductsQuerySchema.safeParse(query);
  
  if (!result.success) {
    const errors = result.error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code
    }));

    return {
      isValid: false,
      errors,
      data: null
    };
  }

  return {
    isValid: true,
    errors: [],
    data: result.data
  };
}

/**
 * Validate product ID parameter
 * @param {string} productId - Product ID to validate
 * @returns {Object} Validation result
 */
function validateProductId(productId) {
  const result = productIdParamSchema.safeParse({ id: productId });
  
  if (!result.success) {
    const errors = result.error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code
    }));

    return {
      isValid: false,
      errors,
      data: null
    };
  }

  return {
    isValid: true,
    errors: [],
    data: result.data.id
  };
}

/**
 * Validate business logic for product creation
 * @param {Object} data - Product data
 * @param {Object} existingProduct - Existing product with same SKU (if any)
 * @returns {Object} Validation result
 */
function validateProductBusinessLogic(data, existingProduct = null) {
  const errors = [];

  // Check if SKU already exists (for updates)
  if (existingProduct && existingProduct.sku === data.sku && existingProduct.id !== data.id) {
    errors.push({
      field: 'sku',
      message: 'SKU already exists',
      code: 'DUPLICATE_SKU'
    });
  }

  // Validate pricing logic
  if (data.wholesaleCost >= data.retailPrice) {
    errors.push({
      field: 'retailPrice',
      message: 'Retail price must be greater than wholesale cost',
      code: 'INVALID_PRICING'
    });
  }

  // Validate category (common categories)
  const validCategories = ['Hair Care', 'Coloring', 'Styling', 'Treatment', 'Tools', 'Accessories'];
  if (data.category && !validCategories.includes(data.category)) {
    errors.push({
      field: 'category',
      message: `Category must be one of: ${validCategories.join(', ')}`,
      code: 'INVALID_CATEGORY'
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    data
  };
}

module.exports = {
  createProductSchema,
  updateProductSchema,
  getProductsQuerySchema,
  productIdParamSchema,
  validateCreateProduct,
  validateUpdateProduct,
  validateGetProductsQuery,
  validateProductId,
  validateProductBusinessLogic
};
