/**
 * Convert an arbitrary string into a URL-safe slug.
 *   "Classic Oxford Shirt!" -> "classic-oxford-shirt"
 */
const slugify = (value) =>
  value
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/**
 * Generate a slug that is unique within a collection. If the base slug is
 * already taken, a short random suffix is appended until a free slug is found.
 *
 * @param {import('mongoose').Model} Model  Mongoose model to check against
 * @param {string} name                     Source text for the slug
 * @param {string} [excludeId]              Document id to ignore (for updates)
 */
const generateUniqueSlug = async (Model, name, excludeId = null) => {
  const base = slugify(name);
  let slug = base;

  // Loop until we find a slug not used by any *other* document.
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const query = { slug };
    if (excludeId) query._id = { $ne: excludeId };
    const exists = await Model.findOne(query).select('_id').lean();
    if (!exists) return slug;
    const suffix = Math.random().toString(36).slice(2, 6);
    slug = `${base}-${suffix}`;
  }
};

module.exports = { slugify, generateUniqueSlug };
