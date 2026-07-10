/**
 * Wraps an async controller so any thrown/rejected error is forwarded to the
 * global error handler via next(), removing repetitive try/catch blocks.
 *
 * @param {Function} fn async (req, res, next) => {...}
 * @returns {Function} Express handler
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
