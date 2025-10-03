/**
 * Deduplication utility for threat data
 */

const crypto = require('crypto');

/**
 * Generate a hash for threat deduplication
 * @param {Object} threat - Threat object
 * @returns {string} Hash string
 */
const generateThreatHash = (threat) => {
  const components = [
    threat.name?.toLowerCase().trim(),
    threat.type,
    threat.description?.toLowerCase().trim().substring(0, 100),
    threat.indicators?.map(i => i.value).sort().join(',')
  ].filter(Boolean);

  const hashInput = components.join('|');
  return crypto.createHash('sha256').update(hashInput).digest('hex');
};

/**
 * Check if two threats are duplicates
 * @param {Object} threat1 - First threat
 * @param {Object} threat2 - Second threat
 * @returns {boolean} True if duplicates
 */
const isDuplicate = (threat1, threat2) => {
  const hash1 = generateThreatHash(threat1);
  const hash2 = generateThreatHash(threat2);
  return hash1 === hash2;
};

/**
 * Calculate similarity score between two threats
 * @param {Object} threat1 - First threat
 * @param {Object} threat2 - Second threat
 * @returns {number} Similarity score (0-100)
 */
const calculateSimilarity = (threat1, threat2) => {
  let score = 0;
  let checks = 0;

  // Name similarity
  if (threat1.name && threat2.name) {
    checks++;
    const name1 = threat1.name.toLowerCase();
    const name2 = threat2.name.toLowerCase();
    if (name1 === name2) score += 30;
    else if (name1.includes(name2) || name2.includes(name1)) score += 15;
  }

  // Type match
  if (threat1.type && threat2.type) {
    checks++;
    if (threat1.type === threat2.type) score += 20;
  }

  // Indicator overlap
  if (threat1.indicators?.length && threat2.indicators?.length) {
    checks++;
    const indicators1 = new Set(threat1.indicators.map(i => i.value));
    const indicators2 = new Set(threat2.indicators.map(i => i.value));
    const intersection = new Set([...indicators1].filter(x => indicators2.has(x)));
    const union = new Set([...indicators1, ...indicators2]);
    const overlap = (intersection.size / union.size) * 50;
    score += overlap;
  }

  return checks > 0 ? Math.min(100, score) : 0;
};

module.exports = {
  generateThreatHash,
  isDuplicate,
  calculateSimilarity
};
