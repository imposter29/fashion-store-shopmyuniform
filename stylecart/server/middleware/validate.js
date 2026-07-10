const { validationResult } = require('express-validator');

/**
 * Runs the supplied express-validator chains and, if any fail, responds 400
 * with a flat list of errors. Usage:
 *
 *   router.post('/', validate([ body('email').isEmail() ]), controller);
 *
 * @param {import('express-validator').ValidationChain[]} validations
 */
const validate = (validations) => async (req, res, next) => {
  await Promise.all(validations.map((validation) => validation.run(req)));

  const result = validationResult(req);
  if (result.isEmpty()) {
    return next();
  }

  res.status(400).json({
    message: 'Validation failed',
    errors: result.array().map((e) => ({ field: e.path, message: e.msg })),
  });
};

module.exports = validate;
