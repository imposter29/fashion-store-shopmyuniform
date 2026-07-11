/**
 * Escape regex metacharacters in user input before using it in a MongoDB
 * $regex query, so a crafted search term can't inject a pattern or trigger
 * catastrophic backtracking (ReDoS).
 */
const escapeRegex = (str) =>
  String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

module.exports = escapeRegex;
