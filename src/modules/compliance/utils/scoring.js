/**
 * Compliance scoring utilities
 */

/**
 * Calculate compliance score based on control statuses
 * @param {Array} controls - Array of compliance controls
 * @returns {Number} Compliance score (0-100)
 */
function calculateComplianceScore(controls) {
  if (!controls || controls.length === 0) {
    return 0;
  }

  const weights = {
    implemented: 1.0,
    partially_implemented: 0.5,
    not_implemented: 0.0,
    not_applicable: null,
  };

  let totalWeight = 0;
  let achievedWeight = 0;

  controls.forEach((control) => {
    const weight = weights[control.implementation_status];
    if (weight !== null) {
      totalWeight += 1;
      achievedWeight += weight;
    }
  });

  if (totalWeight === 0) {
    return 0;
  }

  return Math.round((achievedWeight / totalWeight) * 100);
}

/**
 * Calculate risk score for a gap
 * @param {Object} gap - Compliance gap object
 * @returns {Number} Risk score (0-100)
 */
function calculateGapRiskScore(gap) {
  const severityScores = {
    critical: 100,
    high: 75,
    medium: 50,
    low: 25,
  };

  const baseScore = severityScores[gap.severity] || 50;
  const priorityFactor = gap.priority / 10;

  return Math.min(100, Math.round(baseScore * priorityFactor));
}

/**
 * Determine control effectiveness level
 * @param {Object} control - Compliance control
 * @returns {String} Effectiveness level
 */
function determineEffectiveness(control) {
  if (control.implementation_status === 'not_implemented') {
    return 'not_assessed';
  }

  if (control.implementation_status === 'implemented' && control.evidence && control.evidence.length > 0) {
    return 'effective';
  }

  if (control.implementation_status === 'partially_implemented') {
    return 'partially_effective';
  }

  return 'not_assessed';
}

/**
 * Prioritize gaps based on risk and impact
 * @param {Array} gaps - Array of compliance gaps
 * @returns {Array} Sorted gaps by priority
 */
function prioritizeGaps(gaps) {
  return gaps.sort((a, b) => {
    const aScore = calculateGapRiskScore(a);
    const bScore = calculateGapRiskScore(b);
    return bScore - aScore;
  });
}

module.exports = {
  calculateComplianceScore,
  calculateGapRiskScore,
  determineEffectiveness,
  prioritizeGaps,
};
