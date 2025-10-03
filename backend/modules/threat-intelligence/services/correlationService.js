/**
 * Threat Correlation Service
 * Handles automated threat correlation
 */

const Threat = require('../models/Threat');
const ThreatCorrelation = require('../models/ThreatCorrelation');
const logger = require('../utils/logger');
const { calculateSimilarity } = require('../utils/deduplication');

class CorrelationService {
  /**
   * Correlate threats automatically
   * @param {string} threatId - Threat ID (optional, correlates all if not provided)
   * @param {Object} options - Correlation options
   * @returns {Promise<Array>} Correlations found
   */
  async correlateThreats(threatId = null, options = {}) {
    try {
      logger.info('Starting threat correlation', { threatId, options });

      const minSimilarity = options.min_similarity || 70;
      const correlationTypes = options.correlation_types || [
        'ioc_overlap', 'temporal', 'infrastructure', 'behavioral',
      ];

      let threats;
      if (threatId) {
        const threat = await Threat.findOne({ id: threatId });
        if (!threat) {
          throw new Error('Threat not found');
        }
        threats = [threat];
      } else {
        threats = await Threat.find({ status: 'active' }).limit(1000);
      }

      const correlations = [];

      for (const threat of threats) {
        const relatedThreats = await this.findRelatedThreats(
          threat,
          minSimilarity,
          correlationTypes,
        );
        correlations.push(...relatedThreats);
      }

      logger.info('Correlation completed', { count: correlations.length });
      return correlations;
    } catch (error) {
      logger.error('Error correlating threats', { error: error.message });
      throw error;
    }
  }

  /**
   * Find related threats for a specific threat
   * @param {Object} threat - Threat object
   * @param {number} minSimilarity - Minimum similarity score
   * @param {Array} correlationTypes - Types of correlation to check
   * @returns {Promise<Array>} Related threats
   */
  async findRelatedThreats(threat, minSimilarity, correlationTypes) {
    try {
      const related = [];

      // Find potential matches
      const candidates = await Threat.find({
        id: { $ne: threat.id },
        status: 'active',
        type: threat.type, // Start with same type
      }).limit(100);

      for (const candidate of candidates) {
        const correlations = [];

        // IOC Overlap correlation
        if (correlationTypes.includes('ioc_overlap')) {
          const iocCorrelation = this.calculateIOCOverlap(threat, candidate);
          if (iocCorrelation.score >= minSimilarity) {
            correlations.push(iocCorrelation);
          }
        }

        // Temporal correlation
        if (correlationTypes.includes('temporal')) {
          const temporalCorrelation = this.calculateTemporalCorrelation(threat, candidate);
          if (temporalCorrelation.score >= minSimilarity) {
            correlations.push(temporalCorrelation);
          }
        }

        // Infrastructure correlation
        if (correlationTypes.includes('infrastructure')) {
          const infraCorrelation = this.calculateInfrastructureCorrelation(threat, candidate);
          if (infraCorrelation.score >= minSimilarity) {
            correlations.push(infraCorrelation);
          }
        }

        // Behavioral correlation
        if (correlationTypes.includes('behavioral')) {
          const behavioralCorrelation = this.calculateBehavioralCorrelation(threat, candidate);
          if (behavioralCorrelation.score >= minSimilarity) {
            correlations.push(behavioralCorrelation);
          }
        }

        // If any correlations found, store them
        if (correlations.length > 0) {
          for (const correlation of correlations) {
            await this.storeCorrelation(threat.id, candidate.id, correlation);
            related.push({
              threat_id: candidate.id,
              correlation,
            });
          }
        }
      }

      return related;
    } catch (error) {
      logger.error('Error finding related threats', { error: error.message });
      throw error;
    }
  }

  /**
   * Calculate IOC overlap correlation
   * @param {Object} threat1 - First threat
   * @param {Object} threat2 - Second threat
   * @returns {Object} Correlation result
   */
  calculateIOCOverlap(threat1, threat2) {
    const indicators1 = new Set(threat1.indicators?.map((i) => i.value) || []);
    const indicators2 = new Set(threat2.indicators?.map((i) => i.value) || []);

    const intersection = new Set([...indicators1].filter((x) => indicators2.has(x)));
    const union = new Set([...indicators1, ...indicators2]);

    const score = union.size > 0 ? (intersection.size / union.size) * 100 : 0;

    return {
      type: 'ioc_overlap',
      score: Math.round(score),
      evidence: [{
        type: 'shared_ioc',
        description: `${intersection.size} shared IOCs out of ${union.size} total`,
        weight: 1.0,
        data: { shared: Array.from(intersection) },
      }],
    };
  }

  /**
   * Calculate temporal correlation
   * @param {Object} threat1 - First threat
   * @param {Object} threat2 - Second threat
   * @returns {Object} Correlation result
   */
  calculateTemporalCorrelation(threat1, threat2) {
    const time1 = new Date(threat1.first_seen).getTime();
    const time2 = new Date(threat2.first_seen).getTime();
    const timeDiff = Math.abs(time1 - time2);
    const daysDiff = timeDiff / (1000 * 60 * 60 * 24);

    // Score based on temporal proximity (higher score for closer timing)
    let score = 0;
    if (daysDiff <= 1) score = 90;
    else if (daysDiff <= 7) score = 70;
    else if (daysDiff <= 30) score = 50;
    else score = 0;

    return {
      type: 'temporal',
      score,
      evidence: [{
        type: 'timing_pattern',
        description: `Threats appeared within ${Math.round(daysDiff)} days`,
        weight: 0.8,
        data: { days_apart: daysDiff },
      }],
    };
  }

  /**
   * Calculate infrastructure correlation
   * @param {Object} threat1 - First threat
   * @param {Object} threat2 - Second threat
   * @returns {Object} Correlation result
   */
  calculateInfrastructureCorrelation(threat1, threat2) {
    // Check for shared infrastructure (IPs, domains, ASNs)
    const infra1 = new Set([
      ...(threat1.indicators?.filter((i) => i.type === 'ip' || i.type === 'domain').map((i) => i.value) || []),
    ]);
    const infra2 = new Set([
      ...(threat2.indicators?.filter((i) => i.type === 'ip' || i.type === 'domain').map((i) => i.value) || []),
    ]);

    const sharedInfra = new Set([...infra1].filter((x) => infra2.has(x)));
    const score = infra1.size > 0 && infra2.size > 0
      ? (sharedInfra.size / Math.min(infra1.size, infra2.size)) * 100
      : 0;

    return {
      type: 'infrastructure',
      score: Math.round(score),
      evidence: [{
        type: 'infrastructure_overlap',
        description: `${sharedInfra.size} shared infrastructure elements`,
        weight: 1.0,
        data: { shared: Array.from(sharedInfra) },
      }],
    };
  }

  /**
   * Calculate behavioral correlation
   * @param {Object} threat1 - First threat
   * @param {Object} threat2 - Second threat
   * @returns {Object} Correlation result
   */
  calculateBehavioralCorrelation(threat1, threat2) {
    // Check MITRE ATT&CK tactics/techniques overlap
    const tactics1 = new Set(threat1.mitre_attack?.tactics || []);
    const tactics2 = new Set(threat2.mitre_attack?.tactics || []);
    const techniques1 = new Set(threat1.mitre_attack?.techniques || []);
    const techniques2 = new Set(threat2.mitre_attack?.techniques || []);

    const sharedTactics = new Set([...tactics1].filter((x) => tactics2.has(x)));
    const sharedTechniques = new Set([...techniques1].filter((x) => techniques2.has(x)));

    const tacticScore = tactics1.size > 0 && tactics2.size > 0
      ? (sharedTactics.size / Math.max(tactics1.size, tactics2.size)) * 100
      : 0;
    const techniqueScore = techniques1.size > 0 && techniques2.size > 0
      ? (sharedTechniques.size / Math.max(techniques1.size, techniques2.size)) * 100
      : 0;

    const score = Math.round((tacticScore + techniqueScore) / 2);

    return {
      type: 'behavioral',
      score,
      evidence: [{
        type: 'tactic_similarity',
        description: `${sharedTactics.size} shared tactics, ${sharedTechniques.size} shared techniques`,
        weight: 0.9,
        data: {
          tactics: Array.from(sharedTactics),
          techniques: Array.from(sharedTechniques),
        },
      }],
    };
  }

  /**
   * Store correlation in database
   * @param {string} threatId1 - First threat ID
   * @param {string} threatId2 - Second threat ID
   * @param {Object} correlationData - Correlation data
   * @returns {Promise<Object>} Stored correlation
   */
  async storeCorrelation(threatId1, threatId2, correlationData) {
    try {
      // Check if correlation already exists
      const existing = await ThreatCorrelation.findOne({
        $or: [
          { threat_id_1: threatId1, threat_id_2: threatId2 },
          { threat_id_1: threatId2, threat_id_2: threatId1 },
        ],
      });

      if (existing) {
        // Update existing correlation
        existing.similarity_score = correlationData.score;
        existing.evidence = correlationData.evidence;
        await existing.save();
        return existing;
      }

      // Create new correlation
      const correlation = new ThreatCorrelation({
        threat_id_1: threatId1,
        threat_id_2: threatId2,
        correlation_type: correlationData.type,
        similarity_score: correlationData.score,
        confidence: correlationData.score,
        evidence: correlationData.evidence,
        algorithm: {
          name: 'BlackCross-CorrelationEngine',
          version: '1.0.0',
          parameters: { min_similarity: 70 },
        },
      });

      await correlation.save();
      return correlation;
    } catch (error) {
      logger.error('Error storing correlation', { error: error.message });
      throw error;
    }
  }

  /**
   * Get related threats for a specific threat
   * @param {string} threatId - Threat ID
   * @returns {Promise<Array>} Related threats
   */
  async getRelatedThreats(threatId) {
    try {
      const correlations = await ThreatCorrelation.find({
        $or: [
          { threat_id_1: threatId },
          { threat_id_2: threatId },
        ],
        status: { $ne: 'rejected' },
      }).sort({ similarity_score: -1 });

      const relatedIds = correlations.map((c) => (c.threat_id_1 === threatId ? c.threat_id_2 : c.threat_id_1));

      const threats = await Threat.find({ id: { $in: relatedIds } });

      return threats.map((threat) => {
        const correlation = correlations.find((c) => c.threat_id_1 === threat.id || c.threat_id_2 === threat.id);
        return {
          ...threat.toObject(),
          correlation: {
            type: correlation.correlation_type,
            similarity_score: correlation.similarity_score,
            confidence: correlation.confidence,
          },
        };
      });
    } catch (error) {
      logger.error('Error getting related threats', { error: error.message });
      throw error;
    }
  }
}

module.exports = new CorrelationService();
