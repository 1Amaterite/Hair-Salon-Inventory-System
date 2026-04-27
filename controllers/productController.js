const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  restoreProduct,
  getProductCategories,
  getProductStatistics
} = require('../services/productService');
const {
  validateGetProductsQuery,
  validateProductId
} = require('../validators/productValidator');

/**
 * Create a new product
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function createProductHandler(req, res) {
  try {
    const productData = req.body;
    const user = req.user;

    const product = await createProduct(productData, user);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    console.error('Error creating product:', error);
    
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create product',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

/**
 * Get all products with filtering and pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getProductsHandler(req, res) {
  try {
    // Validate query parameters
    const validation = validateGetProductsQuery(req.query);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid query parameters',
        errors: validation.errors
      });
    }

    const filters = validation.data;
    const result = await getProducts(filters);

    res.status(200).json({
      success: true,
      message: 'Products retrieved successfully',
      data: result.products,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch products',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

/**
 * Get a single product by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getProductByIdHandler(req, res) {
  try {
    const { id } = req.params;

    // Validate product ID
    const validation = validateProductId(id);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
        errors: validation.errors
      });
    }

    const product = await getProductById(validation.data);

    res.status(200).json({
      success: true,
      message: 'Product retrieved successfully',
      data: product
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    
    if (error.message === 'Product not found') {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch product',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

/**
 * Update a product
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function updateProductHandler(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const user = req.user;

    // Validate product ID
    const validation = validateProductId(id);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
        errors: validation.errors
      });
    }

    const product = await updateProduct(validation.data, updateData, user);

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    console.error('Error updating product:', error);
    
    if (error.message === 'Product not found') {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update product',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

/**
 * Soft delete a product
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function deleteProductHandler(req, res) {
  try {
    const { id } = req.params;
    const user = req.user;

    // Validate product ID
    const validation = validateProductId(id);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
        errors: validation.errors
      });
    }

    const product = await deleteProduct(validation.data, user);

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      data: product
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    
    if (error.message === 'Product not found') {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (error.message === 'Product is already inactive') {
      return res.status(400).json({
        success: false,
        message: 'Product is already inactive'
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete product',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

/**
 * Restore a soft deleted product
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function restoreProductHandler(req, res) {
  try {
    const { id } = req.params;
    const user = req.user;

    // Validate product ID
    const validation = validateProductId(id);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
        errors: validation.errors
      });
    }

    const product = await restoreProduct(validation.data, user);

    res.status(200).json({
      success: true,
      message: 'Product restored successfully',
      data: product
    });
  } catch (error) {
    console.error('Error restoring product:', error);
    
    if (error.message === 'Product not found') {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (error.message === 'Product is already active') {
      return res.status(400).json({
        success: false,
        message: 'Product is already active'
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to restore product',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

/**
 * Get product categories
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getProductCategoriesHandler(req, res) {
  try {
    const categories = await getProductCategories();

    res.status(200).json({
      success: true,
      message: 'Product categories retrieved successfully',
      data: categories
    });
  } catch (error) {
    console.error('Error fetching product categories:', error);
    
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch product categories',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

/**
 * Get product statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getProductStatisticsHandler(req, res) {
  try {
    const statistics = await getProductStatistics();

    res.status(200).json({
      success: true,
      message: 'Product statistics retrieved successfully',
      data: statistics
    });
  } catch (error) {
    console.error('Error fetching product statistics:', error);
    
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch product statistics',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

module.exports = {
  createProductHandler,
  getProductsHandler,
  getProductByIdHandler,
  updateProductHandler,
  deleteProductHandler,
  restoreProductHandler,
  getProductCategoriesHandler,
  getProductStatisticsHandler
};