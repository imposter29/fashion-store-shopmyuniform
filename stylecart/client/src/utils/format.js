// Formatting helpers shared across pages.

export const formatPrice = (value) =>
  `$${Number(value || 0).toFixed(2)}`;

export const formatDate = (value) => {
  if (!value) return '';
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (value) => {
  if (!value) return '';
  return new Date(value).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Short, human-friendly order reference: last 8 chars of the Mongo id.
export const shortId = (id) => (id ? `#${String(id).slice(-8).toUpperCase()}` : '');

// Turn an axios error into a user-facing message.
export const getErrorMessage = (err, fallback = 'Something went wrong') =>
  err?.response?.data?.message || err?.message || fallback;

// Order status → badge modifier class (see global.css .badge-*).
export const statusBadgeClass = (status) =>
  ({
    placed: 'badge-info',
    processing: 'badge-warning',
    shipped: 'badge-accent',
    delivered: 'badge-success',
    cancelled: 'badge-danger',
  }[status] || 'badge-info');

export const ORDER_STATUSES = [
  'placed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
];

export const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
