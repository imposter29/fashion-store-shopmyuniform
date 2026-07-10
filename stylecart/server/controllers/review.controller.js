const asyncHandler = require('../utils/asyncHandler');

// @route   POST /api/reviews/:productId
// @access  Private
exports.createReview = asyncHandler(async (req, res) => {
  res.json({ message: 'TODO' });
});

// @route   GET /api/reviews/:productId
// @access  Public
exports.getProductReviews = asyncHandler(async (req, res) => {
  res.json({ message: 'TODO' });
});

// @route   DELETE /api/reviews/:reviewId
// @access  Private
exports.deleteReview = asyncHandler(async (req, res) => {
  res.json({ message: 'TODO' });
});
