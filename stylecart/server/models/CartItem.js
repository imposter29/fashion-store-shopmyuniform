const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    size: {
      type: String,
      required: [true, 'Size is required'],
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
      default: 1,
    },
  },
  { timestamps: true }
);

// A user can only have one cart line per product+size combination.
cartItemSchema.index({ user: 1, product: 1, size: 1 }, { unique: true });

module.exports = mongoose.model('CartItem', cartItemSchema);
