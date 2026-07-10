const asyncHandler = require('../utils/asyncHandler');

// @route   POST /api/orders
// @access  Private
exports.createOrder = asyncHandler(async (req, res) => {
  res.json({ message: 'TODO' });
});

// @route   GET /api/orders
// @access  Private
exports.getMyOrders = asyncHandler(async (req, res) => {
  res.json({ message: 'TODO' });
});

// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = asyncHandler(async (req, res) => {
  res.json({ message: 'TODO' });
});
