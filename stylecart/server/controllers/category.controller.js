const asyncHandler = require('../utils/asyncHandler');

// @route   GET /api/categories
// @access  Public
exports.getCategories = asyncHandler(async (req, res) => {
  res.json({ message: 'TODO' });
});
