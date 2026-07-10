const jwt = require('jsonwebtoken');

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Sign a JWT for the given user id and set it as an httpOnly cookie.
 *
 * @param {import('express').Response} res
 * @param {string} userId
 * @returns {string} the signed token
 */
const generateToken = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: SEVEN_DAYS_MS,
  });

  return token;
};

module.exports = generateToken;
