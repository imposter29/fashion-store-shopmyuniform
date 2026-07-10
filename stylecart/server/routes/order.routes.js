const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const {
  createOrder,
  getMyOrders,
  getOrderById,
} = require('../controllers/order.controller');

// All order routes require authentication.
router.use(protect);

router.post('/', createOrder);
router.get('/', getMyOrders);
router.get('/:id', getOrderById);

module.exports = router;
