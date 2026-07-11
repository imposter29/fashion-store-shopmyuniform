const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const {
  register,
  login,
  logout,
  getProfile,
} = require('../controllers/auth.controller');

// Rate-limit the endpoints that accept credentials.
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', logout);
router.get('/profile', protect, getProfile);

module.exports = router;
