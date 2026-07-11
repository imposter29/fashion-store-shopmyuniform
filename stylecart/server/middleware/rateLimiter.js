const rateLimit = require('express-rate-limit');

/**
 * Throttle sensitive auth endpoints (login/register) to slow brute-force
 * and credential-stuffing attempts. Applied per-IP.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts, please try again later.' },
});

module.exports = { authLimiter };
