const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const {
  addToWishlist,
  removeFromWishlist,
} = require('../controllers/wishlist.controller');

// All wishlist routes require authentication.
router.use(protect);

router.post('/:productId', addToWishlist);
router.delete('/:productId', removeFromWishlist);

module.exports = router;
