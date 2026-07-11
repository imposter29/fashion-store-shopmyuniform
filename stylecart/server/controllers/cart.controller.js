const asyncHandler = require('../utils/asyncHandler');
const CartItem = require('../models/CartItem');
const Product = require('../models/Product');

const PRODUCT_FIELDS = 'name price images stock sizes isActive slug';

// @route   GET /api/cart
// @access  Private
exports.getCart = asyncHandler(async (req, res) => {
  const items = await CartItem.find({ user: req.user._id })
    .populate('product', PRODUCT_FIELDS)
    .sort({ createdAt: -1 });
  res.json(items);
});

// @route   POST /api/cart
// @access  Private
exports.addToCart = asyncHandler(async (req, res) => {
  const { productId, size, quantity } = req.body;
  const qty = Number(quantity) || 1;

  if (!productId || !size) {
    res.status(400);
    throw new Error('productId and size are required');
  }

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  if (product.sizes.length && !product.sizes.includes(size)) {
    res.status(400);
    throw new Error('Invalid size for this product');
  }

  let item = await CartItem.findOne({
    user: req.user._id,
    product: productId,
    size,
  });

  const desiredQty = (item ? item.quantity : 0) + qty;
  if (desiredQty > product.stock) {
    res.status(400);
    throw new Error(`Only ${product.stock} in stock`);
  }

  if (item) {
    item.quantity = desiredQty;
    await item.save();
  } else {
    item = await CartItem.create({
      user: req.user._id,
      product: productId,
      size,
      quantity: qty,
    });
  }

  await item.populate('product', PRODUCT_FIELDS);
  res.status(201).json(item);
});

// @route   PUT /api/cart/:itemId
// @access  Private
exports.updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const qty = Number(quantity);

  if (!qty || qty < 1) {
    res.status(400);
    throw new Error('Quantity must be at least 1');
  }

  const item = await CartItem.findById(req.params.itemId).populate(
    'product',
    PRODUCT_FIELDS
  );
  if (!item) {
    res.status(404);
    throw new Error('Cart item not found');
  }
  if (item.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  if (qty > item.product.stock) {
    res.status(400);
    throw new Error(`Only ${item.product.stock} in stock`);
  }

  item.quantity = qty;
  await item.save();
  res.json(item);
});

// @route   DELETE /api/cart/:itemId
// @access  Private
exports.removeCartItem = asyncHandler(async (req, res) => {
  const item = await CartItem.findById(req.params.itemId);
  if (!item) {
    res.status(404);
    throw new Error('Cart item not found');
  }
  if (item.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  await item.deleteOne();
  res.json({ message: 'Item removed' });
});

// @route   DELETE /api/cart
// @access  Private
exports.clearCart = asyncHandler(async (req, res) => {
  await CartItem.deleteMany({ user: req.user._id });
  res.json({ message: 'Cart cleared' });
});
