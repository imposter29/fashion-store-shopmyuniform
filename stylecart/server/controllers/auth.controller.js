const asyncHandler = require('../utils/asyncHandler');

// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res) => {
  res.json({ message: 'TODO' });
});

// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res) => {
  res.json({ message: 'TODO' });
});

// @route   POST /api/auth/logout
// @access  Public
exports.logout = asyncHandler(async (req, res) => {
  res.json({ message: 'TODO' });
});

// @route   GET /api/auth/profile
// @access  Private
exports.getProfile = asyncHandler(async (req, res) => {
  res.json({ message: 'TODO' });
});
