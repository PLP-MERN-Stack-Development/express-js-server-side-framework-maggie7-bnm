const express = require('express');
const productRoutes = require('./routes/products');
const { errorHandler } = require('./middleware/errorHandler'); // FIXED THIS LINE
const logger = require('./middleware/logger');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(logger);

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Hello World!', 
    timestamp: new Date().toISOString() 
  });
});

app.use('/api/products', productRoutes);

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Global Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 API Documentation available at http://localhost:${PORT}`);
});

module.exports = app;