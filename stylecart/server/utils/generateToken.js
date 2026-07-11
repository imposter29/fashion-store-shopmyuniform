const jwt = require('jsonwebtoken');

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Cookie options for the auth token.
 *
 * In production the frontend (Vercel) and API (Render) live on different
 * origins, so the cookie is cross-site: it MUST be `sameSite:'none'` with
 * `secure:true` (HTTPS) for the browser to store and send it. In development
 * everything is same-site over http, so `lax` + insecure is correct.
 */
const cookieOptions = () => {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
  };
};

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
    ...cookieOptions(),
    maxAge: SEVEN_DAYS_MS,
  });

  return token;
};

/**
 * Clear the auth cookie. Must use the same sameSite/secure attributes as when
 * it was set, or the browser won't remove a cross-site cookie.
 */
const clearAuthCookie = (res) => {
  res.cookie('token', '', {
    ...cookieOptions(),
    expires: new Date(0),
  });
};

module.exports = generateToken;
module.exports.clearAuthCookie = clearAuthCookie;
