const asyncHandler = require('../utils/asyncHandler');
const { generateUniqueSlug } = require('../utils/slugify');
const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Order = require('../models/Order');

const ORDER_STATUSES = [
  'placed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
];

// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getStats = asyncHandler(async (req, res) => {
  const [users, products, orders, revenueAgg, recentOrders] = await Promise.all([
    User.countDocuments({ role: 'customer' }),
    Product.countDocuments({ isActive: true }),
    Order.countDocuments(),
    Order.aggregate([
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
    Order.find()
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(10),
  ]);

  res.json({
    users,
    products,
    orders,
    revenue: revenueAgg[0]?.total || 0,
    recentOrders,
  });
});

// @route   GET /api/admin/products
// @access  Private/Admin
// Lists ALL products (including inactive) with optional name search.
exports.getAdminProducts = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const query = {};
  if (search) query.name = { $regex: search, $options: 'i' };

  const products = await Product.find(query)
    .populate('category', 'name slug')
    .sort({ createdAt: -1 });

  res.json(products);
});

// @route   POST /api/admin/products
// @access  Private/Admin
exports.createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, category, images, sizes, stock, isActive } =
    req.body;

  if (!name || price == null || !category) {
    res.status(400);
    throw new Error('Name, price and category are required');
  }

  const slug = await generateUniqueSlug(Product, name);

  const product = await Product.create({
    name,
    slug,
    description: description || '',
    price,
    category,
    images: images || [],
    sizes: sizes || [],
    stock: stock || 0,
    isActive: isActive !== undefined ? isActive : true,
  });

  res.status(201).json(product);
});

// @route   PUT /api/admin/products/:id
// @access  Private/Admin
exports.updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const fields = ['name', 'description', 'price', 'category', 'images', 'sizes', 'stock', 'isActive'];
  fields.forEach((field) => {
    if (req.body[field] !== undefined) product[field] = req.body[field];
  });

  // Regenerate slug if the name changed.
  if (product.isModified('name')) {
    product.slug = await generateUniqueSlug(Product, product.name, product._id);
  }

  await product.save();
  res.json(product);
});

// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json({ message: 'Product deleted' });
});

// @route   POST /api/admin/categories
// @access  Private/Admin
exports.createCategory = asyncHandler(async (req, res) => {
  const { name, description, image } = req.body;
  if (!name) {
    res.status(400);
    throw new Error('Category name is required');
  }

  const slug = await generateUniqueSlug(Category, name);
  const category = await Category.create({
    name,
    slug,
    description: description || '',
    image: image || '',
  });

  res.status(201).json(category);
});

// @route   PUT /api/admin/categories/:id
// @access  Private/Admin
exports.updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  ['name', 'description', 'image'].forEach((field) => {
    if (req.body[field] !== undefined) category[field] = req.body[field];
  });

  if (category.isModified('name')) {
    category.slug = await generateUniqueSlug(Category, category.name, category._id);
  }

  await category.save();
  res.json(category);
});

// @route   DELETE /api/admin/categories/:id
// @access  Private/Admin
exports.deleteCategory = asyncHandler(async (req, res) => {
  const activeProducts = await Product.countDocuments({
    category: req.params.id,
    isActive: true,
  });
  if (activeProducts > 0) {
    res.status(400);
    throw new Error('Cannot delete category with existing products');
  }

  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  res.json({ message: 'Category deleted' });
});

// @route   GET /api/admin/orders
// @access  Private/Admin
exports.getAllOrders = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const query = {};
  if (status && ORDER_STATUSES.includes(status)) {
    query.status = status;
  }

  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.max(1, Number(req.query.limit) || 15);
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments(query),
  ]);

  res.json({
    orders,
    page,
    totalPages: Math.ceil(total / limit),
    totalOrders: total,
  });
});

// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!ORDER_STATUSES.includes(status)) {
    res.status(400);
    throw new Error('Invalid order status');
  }

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  ).populate('user', 'firstName lastName email');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  res.json(order);
});
