const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const {
  createReview,
  getProductReviews,
  deleteReview,
} = require('../controllers/review.controller');

router.get('/:productId', getProductReviews);
router.post('/:productId', protect, createReview);
router.delete('/:reviewId', protect, deleteReview);

module.exports = router;
