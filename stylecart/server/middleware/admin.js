/**
 * Guard that allows only authenticated admins. Must run after `protect` so
 * that req.user is populated. Responds 403 for non-admin users.
 */
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  res.status(403);
  throw new Error('Not authorized as an admin');
};

module.exports = admin;
