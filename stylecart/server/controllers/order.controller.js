const asyncHandler = require('../utils/asyncHandler');
const CartItem = require('../models/CartItem');
const Order = require('../models/Order');
const Product = require('../models/Product');

const REQUIRED_ADDRESS_FIELDS = [
  'fullName',
  'address',
  'city',
  'state',
  'zipCode',
  'phone',
];

// @route   POST /api/orders
// @access  Private
exports.createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod } = req.body;

  // Validate shipping address.
  if (!shippingAddress) {
    res.status(400);
    throw new Error('Shipping address is required');
  }
  const missing = REQUIRED_ADDRESS_FIELDS.filter((f) => !shippingAddress[f]);
  if (missing.length) {
    res.status(400);
    throw new Error(`Missing shipping fields: ${missing.join(', ')}`);
  }

  const cartItems = await CartItem.find({ user: req.user._id }).populate(
    'product'
  );

  if (!cartItems.length) {
    res.status(400);
    throw new Error('Cart is empty');
  }

  // Validate stock for every item before making any changes.
  for (const item of cartItems) {
    if (!item.product) {
      res.status(400);
      throw new Error('A product in your cart is no longer available');
    }
    if (item.product.stock < item.quantity) {
      res.status(400);
      throw new Error(`Insufficient stock for ${item.product.name}`);
    }
  }

  const items = cartItems.map((item) => ({
    product: item.product._id,
    name: item.product.name,
    price: item.product.price,
    size: item.size,
    quantity: item.quantity,
    image: item.product.images[0] || '',
  }));

  const totalAmount = items.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );

  const order = await Order.create({
    user: req.user._id,
    items,
    shippingAddress,
    totalAmount,
    paymentMethod: paymentMethod || 'COD',
  });

  // Decrement stock for each ordered product.
  await Promise.all(
    cartItems.map((item) =>
      Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity },
      })
    )
  );

  // Empty the cart.
  await CartItem.deleteMany({ user: req.user._id });

  res.status(201).json(order);
});

// @route   GET /api/orders
// @access  Private
exports.getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({
    createdAt: -1,
  });
  res.json(orders);
});

// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    'user',
    'firstName lastName email'
  );

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const ownerId = order.user._id ? order.user._id.toString() : order.user.toString();
  if (ownerId !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view this order');
  }

  res.json(order);
});
