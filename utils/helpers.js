// Helper utilities for FoodShare platform

/**
 * Format a Javascript Date object into a readable string
 * @param {Date|string} date 
 * @returns {string}
 */
const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Calculates remaining hours until expiry
 * @param {Date|string} expiryDate 
 * @returns {number}
 */
const getHoursUntilExpiry = (expiryDate) => {
  const now = new Date();
  const exp = new Date(expiryDate);
  const diffMs = exp - now;
  return Math.max(0, Math.round(diffMs / (1000 * 60 * 60)));
};

module.exports = {
  formatDate,
  getHoursUntilExpiry,
};
