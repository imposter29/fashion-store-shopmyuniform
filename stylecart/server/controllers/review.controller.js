const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');
const Review = require('../models/Review');
const Product = require('../models/Product');

// Recalculate a product's avgRating / numReviews from its reviews.
const recalcProductStats = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId) } },
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$rating' },
        numReviews: { $sum: 1 },
      },
    },
  ]);

  await Product.findByIdAndUpdate(productId, {
    avgRating: stats[0]?.avgRating || 0,
    numReviews: stats[0]?.numReviews || 0,
  });
};

// @route   POST /api/reviews/:productId
// @access  Private
exports.createReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const { productId } = req.params;

  const numericRating = Number(rating);
  if (!numericRating || numericRating < 1 || numericRating > 5) {
    res.status(400);
    throw new Error('Rating must be between 1 and 5');
  }

  const product = await Product.findById(productId).select('_id');
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const existing = await Review.findOne({
    user: req.user._id,
    product: productId,
  });
  if (existing) {
    res.status(400);
    throw new Error('Already reviewed');
  }

  const review = await Review.create({
    user: req.user._id,
    product: productId,
    rating: numericRating,
    comment: comment || '',
  });

  await recalcProductStats(productId);
  await review.populate('user', 'firstName lastName');

  res.status(201).json(review);
});

// @route   GET /api/reviews/:productId
// @access  Public
exports.getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId })
    .populate('user', 'firstName lastName')
    .sort({ createdAt: -1 });
  res.json(reviews);
});

// @route   DELETE /api/reviews/:reviewId
// @access  Private
exports.deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.reviewId);
  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  if (review.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  const productId = review.product;
  await review.deleteOne();
  await recalcProductStats(productId);

  res.json({ message: 'Review deleted' });
});
