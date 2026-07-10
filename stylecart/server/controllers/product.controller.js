const asyncHandler = require('../utils/asyncHandler');

// @route   GET /api/products
// @access  Public
exports.getProducts = asyncHandler(async (req, res) => {
  res.json({ message: 'TODO' });
});

// @route   GET /api/products/:id
// @access  Public
exports.getProductById = asyncHandler(async (req, res) => {
  res.json({ message: 'TODO' });
});
