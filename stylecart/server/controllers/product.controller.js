const asyncHandler = require('../utils/asyncHandler');
const Product = require('../models/Product');
const Category = require('../models/Category');

// @route   GET /api/products
// @access  Public
exports.getProducts = asyncHandler(async (req, res) => {
  const { search, category, minPrice, maxPrice, size, sort } = req.query;

  const query = { isActive: true };

  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }

  if (category) {
    const categoryDoc = await Category.findOne({ slug: category }).select('_id');
    // Unknown category slug -> no results rather than all results.
    query.category = categoryDoc ? categoryDoc._id : null;
  }

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  if (size) {
    query.sizes = { $in: [size] };
  }

  const sortMap = {
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    rating: { avgRating: -1 },
    newest: { createdAt: -1 },
  };
  const sortBy = sortMap[sort] || { createdAt: -1 };

  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.max(1, Number(req.query.limit) || 12);
  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    Product.find(query)
      .populate('category', 'name slug')
      .sort(sortBy)
      .skip(skip)
      .limit(limit),
    Product.countDocuments(query),
  ]);

  res.json({
    products,
    page,
    totalPages: Math.ceil(total / limit),
    totalProducts: total,
  });
});

// @route   GET /api/products/:id
// @access  Public
exports.getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate(
    'category',
    'name slug'
  );

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.json(product);
});
