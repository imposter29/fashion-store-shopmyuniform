const asyncHandler = require('../utils/asyncHandler');

// @route   GET /api/cart
// @access  Private
exports.getCart = asyncHandler(async (req, res) => {
  res.json({ message: 'TODO' });
});

// @route   POST /api/cart
// @access  Private
exports.addToCart = asyncHandler(async (req, res) => {
  res.json({ message: 'TODO' });
});

// @route   PUT /api/cart/:itemId
// @access  Private
exports.updateCartItem = asyncHandler(async (req, res) => {
  res.json({ message: 'TODO' });
});

// @route   DELETE /api/cart/:itemId
// @access  Private
exports.removeCartItem = asyncHandler(async (req, res) => {
  res.json({ message: 'TODO' });
});

// @route   DELETE /api/cart
// @access  Private
exports.clearCart = asyncHandler(async (req, res) => {
  res.json({ message: 'TODO' });
});
