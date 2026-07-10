const asyncHandler = require('../utils/asyncHandler');

// @route   POST /api/wishlist/:productId
// @access  Private
exports.addToWishlist = asyncHandler(async (req, res) => {
  res.json({ message: 'TODO' });
});

// @route   DELETE /api/wishlist/:productId
// @access  Private
exports.removeFromWishlist = asyncHandler(async (req, res) => {
  res.json({ message: 'TODO' });
});
