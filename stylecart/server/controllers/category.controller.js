const asyncHandler = require('../utils/asyncHandler');
const Category = require('../models/Category');
const Product = require('../models/Product');

// @route   GET /api/categories
// @access  Public
exports.getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ name: 1 }).lean();

  const withCounts = await Promise.all(
    categories.map(async (category) => {
      const productCount = await Product.countDocuments({
        category: category._id,
        isActive: true,
      });
      return { ...category, productCount };
    })
  );

  res.json(withCounts);
});
