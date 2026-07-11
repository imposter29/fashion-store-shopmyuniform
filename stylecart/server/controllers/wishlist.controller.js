const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const Product = require('../models/Product');

const WISHLIST_FIELDS = 'name price images slug avgRating stock category';

// @route   POST /api/wishlist/:productId
// @access  Private
exports.addToWishlist = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId).select('_id');
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $addToSet: { wishlist: req.params.productId } },
    { new: true }
  ).populate('wishlist', WISHLIST_FIELDS);

  res.json(user.wishlist);
});

// @route   DELETE /api/wishlist/:productId
// @access  Private
exports.removeFromWishlist = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $pull: { wishlist: req.params.productId } },
    { new: true }
  ).populate('wishlist', WISHLIST_FIELDS);

  res.json(user.wishlist);
});
