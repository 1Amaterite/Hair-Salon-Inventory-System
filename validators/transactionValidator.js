/*  */const Joi = require('joi');

const transactionTypes = ['INBOUND', 'OUTBOUND', 'USAGE', 'ADJUSTMENT'];

const createTransactionSchema = Joi.object({
  productId: Joi.string().required().messages({
    'string.empty': 'Product ID is required',
    'any.required': 'Product ID is required'
  }),
  type: Joi.string().valid(...transactionTypes).required().messages({
    'any.only': 'Transaction type must be one of: INBOUND, OUTBOUND, USAGE, ADJUSTMENT',
    'any.required': 'Transaction type is required'
  }),
  quantity: Joi.number().integer().not(0).required().messages({
    'number.base': 'Quantity must be a number',
    'number.integer': 'Quantity must be an integer',
    'any.invalid': 'Quantity cannot be zero',
    'any.required': 'Quantity is required'
  }),
  remarks: Joi.string().optional().max(500).messages({
    'string.max': 'Remarks cannot exceed 500 characters'
  })
});

const updateTransactionSchema = Joi.object({
  type: Joi.string().valid(...transactionTypes).optional().messages({
    'any.only': 'Transaction type must be one of: INBOUND, OUTBOUND, USAGE, ADJUSTMENT'
  }),
  quantity: Joi.number().integer().not(0).optional().messages({
    'number.base': 'Quantity must be a number',
    'number.integer': 'Quantity must be an integer',
    'any.invalid': 'Quantity cannot be zero'
  }),
  remarks: Joi.string().optional().max(500).messages({
    'string.max': 'Remarks cannot exceed 500 characters'
  })
});

const getTransactionHistorySchema = Joi.object({
  productId: Joi.string().optional(),
  userId: Joi.string().optional(),
  type: Joi.string().valid(...transactionTypes).optional(),
  startDate: Joi.date().optional().messages({
    'date.base': 'Start date must be a valid date'
  }),
  endDate: Joi.date().optional().messages({
    'date.base': 'End date must be a valid date'
  }),
  limit: Joi.number().integer().min(1).max(100).default(50).optional().messages({
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit cannot exceed 100'
  }),
  offset: Joi.number().integer().min(0).default(0).optional().messages({
    'number.min': 'Offset must be at least 0'
  })
});

/**
 * Validate transaction data based on schema
 * @param {Object} data - Transaction data to validate
 * @param {Object} schema - Joi validation schema
 * @returns {Object} Validation result
 */
function validateTransaction(data, schema = createTransactionSchema) {
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
      value: detail.context.value
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
    data: value
  };
}

/**
 * Validate transaction quantity based on type
 * @param {number} quantity - Transaction quantity
 * @param {string} type - Transaction type
 * @returns {Object} Validation result
 */
function validateQuantityByType(quantity, type) {
  const errors = [];

  switch (type) {
    case 'INBOUND':
      if (quantity <= 0) {
        errors.push({
          field: 'quantity',
          message: 'INBOUND transactions must have positive quantity',
          value: quantity
        });
      }
      break;
    case 'OUTBOUND':
    case 'USAGE':
      if (quantity >= 0) {
        errors.push({
          field: 'quantity',
          message: `${type} transactions must have negative quantity`,
          value: quantity
        });
      }
      break;
    case 'ADJUSTMENT':
      // ADJUSTMENT can be positive or negative
      break;
    default:
      errors.push({
        field: 'type',
        message: 'Invalid transaction type',
        value: type
      });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  createTransactionSchema,
  updateTransactionSchema,
  getTransactionHistorySchema,
  validateTransaction,
  validateQuantityByType,
  transactionTypes
};
