/* eslint-disable no-unused-vars */

// Fallback for routes that were never matched.
const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Not found - ${req.originalUrl}`));
};

/**
 * Global error handler. Normalizes common Mongoose errors into clean JSON
 * responses. Must be registered last, with all four arguments.
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || 'Server Error';

  // Invalid ObjectId (e.g. malformed :id param).
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found';
  }

  // Duplicate key violation.
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {}).join(', ');
    message = field
      ? `Duplicate value for field: ${field}`
      : 'Duplicate field value entered';
  }

  // Mongoose schema validation error — collect all messages.
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
  }

  res.status(statusCode).json({
    message,
    ...(process.env.NODE_ENV === 'production' ? {} : { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };
