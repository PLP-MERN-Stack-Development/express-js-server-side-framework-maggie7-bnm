const express = require('express');
const { v4: uuidv4 } = require('uuid');
const authenticate = require('../middleware/auth');
const { validateProduct, validateProductUpdate } = require('../middleware/validation');
const { NotFoundError } = require('../utils/errors');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// In-memory storage (replace with database in production)
let products = [
  {
    id: '1',
    name: 'Laptop',
    description: 'High-performance laptop for developers',
    price: 999.99,
    category: 'Electronics',
    inStock: true
  },
  {
    id: '2',
    name: 'Coffee Mug',
    description: 'Ceramic coffee mug with company logo',
    price: 12.99,
    category: 'Kitchen',
    inStock: true
  }
];

// GET /api/products - List all products with filtering, pagination, and search
router.get('/', asyncHandler(async (req, res) => {
  let filteredProducts = [...products];

  // Search by name
  if (req.query.search) {
    const searchTerm = req.query.search.toLowerCase();
    filteredProducts = filteredProducts.filter(product =>
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm)
    );
  }

  // Filter by category
  if (req.query.category) {
    filteredProducts = filteredProducts.filter(product =>
      product.category.toLowerCase() === req.query.category.toLowerCase()
    );
  }

  // Filter by inStock
  if (req.query.inStock) {
    const inStock = req.query.inStock === 'true';
    filteredProducts = filteredProducts.filter(product => product.inStock === inStock);
  }

  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const result = {
    page,
    limit,
    total: filteredProducts.length,
    totalPages: Math.ceil(filteredProducts.length / limit)
  };

  if (endIndex < filteredProducts.length) {
    result.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    result.previous = {
      page: page - 1,
      limit
    };
  }

  result.products = filteredProducts.slice(startIndex, endIndex);

  res.json({
    success: true,
    data: result
  });
}));

// GET /api/products/search - Search products by name
router.get('/search', asyncHandler(async (req, res) => {
  const { q } = req.query;
  
  if (!q) {
    return res.status(400).json({
      error: 'Search query parameter "q" is required'
    });
  }

  const searchResults = products.filter(product =>
    product.name.toLowerCase().includes(q.toLowerCase()) ||
    product.description.toLowerCase().includes(q.toLowerCase())
  );

  res.json({
    success: true,
    data: {
      query: q,
      results: searchResults,
      count: searchResults.length
    }
  });
}));

// GET /api/products/stats - Product statistics
router.get('/stats', asyncHandler(async (req, res) => {
  const stats = {
    totalProducts: products.length,
    inStock: products.filter(p => p.inStock).length,
    outOfStock: products.filter(p => !p.inStock).length,
    categories: {},
    averagePrice: 0
  };

  // Calculate category counts
  products.forEach(product => {
    if (!stats.categories[product.category]) {
      stats.categories[product.category] = 0;
    }
    stats.categories[product.category]++;
  });

  // Calculate average price
  if (products.length > 0) {
    const totalPrice = products.reduce((sum, product) => sum + product.price, 0);
    stats.averagePrice = parseFloat((totalPrice / products.length).toFixed(2));
  }

  res.json({
    success: true,
    data: stats
  });
}));

// GET /api/products/:id - Get specific product
router.get('/:id', asyncHandler(async (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  
  if (!product) {
    throw new NotFoundError('Product');
  }

  res.json({
    success: true,
    data: product
  });
}));

// POST /api/products - Create new product (with authentication and validation)
router.post('/', authenticate, validateProduct, asyncHandler(async (req, res) => {
  const { name, description, price, category, inStock } = req.body;
  
  const newProduct = {
    id: uuidv4(),
    name,
    description,
    price,
    category,
    inStock,
    createdAt: new Date().toISOString()
  };

  products.push(newProduct);

  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: newProduct
  });
}));

// PUT /api/products/:id - Update product (with authentication and validation)
router.put('/:id', authenticate, validateProductUpdate, asyncHandler(async (req, res) => {
  const productIndex = products.findIndex(p => p.id === req.params.id);
  
  if (productIndex === -1) {
    throw new NotFoundError('Product');
  }

  const updatedProduct = {
    ...products[productIndex],
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  products[productIndex] = updatedProduct;

  res.json({
    success: true,
    message: 'Product updated successfully',
    data: updatedProduct
  });
}));

// DELETE /api/products/:id - Delete product (with authentication)
router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  const productIndex = products.findIndex(p => p.id === req.params.id);
  
  if (productIndex === -1) {
    throw new NotFoundError('Product');
  }

  const deletedProduct = products.splice(productIndex, 1)[0];

  res.json({
    success: true,
    message: 'Product deleted successfully',
    data: deletedProduct
  });
}));

module.exports = router;