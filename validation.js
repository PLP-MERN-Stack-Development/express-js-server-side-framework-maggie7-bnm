const { ValidationError } = require('../utils/errors');

const validateProduct = (req, res, next) => {
  const { name, description, price, category, inStock } = req.body;
  const errors = [];

  // Required field validation
  if (!name || typeof name !== 'string') {
    errors.push('Name is required and must be a string');
  }

  if (!description || typeof description !== 'string') {
    errors.push('Description is required and must be a string');
  }

  if (price === undefined || typeof price !== 'number' || price < 0) {
    errors.push('Price is required and must be a non-negative number');
  }

  if (!category || typeof category !== 'string') {
    errors.push('Category is required and must be a string');
  }

  if (typeof inStock !== 'boolean') {
    errors.push('inStock is required and must be a boolean');
  }

  // Additional validation
  if (name && name.length > 100) {
    errors.push('Name must be less than 100 characters');
  }

  if (description && description.length > 500) {
    errors.push('Description must be less than 500 characters');
  }

  if (errors.length > 0) {
    throw new ValidationError('Product validation failed', errors);
  }

  next();
};

const validateProductUpdate = (req, res, next) => {
  const { name, description, price, category, inStock } = req.body;
  const errors = [];

  // Optional field validation for updates
  if (name !== undefined && (typeof name !== 'string' || name.length > 100)) {
    errors.push('Name must be a string and less than 100 characters');
  }

  if (description !== undefined && (typeof description !== 'string' || description.length > 500)) {
    errors.push('Description must be a string and less than 500 characters');
  }

  if (price !== undefined && (typeof price !== 'number' || price < 0)) {
    errors.push('Price must be a non-negative number');
  }

  if (category !== undefined && typeof category !== 'string') {
    errors.push('Category must be a string');
  }

  if (inStock !== undefined && typeof inStock !== 'boolean') {
    errors.push('inStock must be a boolean');
  }

  if (errors.length > 0) {
    throw new ValidationError('Product update validation failed', errors);
  }

  next();
};

module.exports = {
  validateProduct,
  validateProductUpdate
};