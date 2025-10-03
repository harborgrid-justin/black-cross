/**
 * Prioritization Service
 * Intelligent incident prioritization based on multiple factors
 */

const Incident = require('../models/Incident');
const logger = require('../utils/logger');

class PrioritizationService {
  /**
   * Automatically prioritize an incident
   */
  async prioritizeIncident(incidentId) {
    try {
      const incident = await Incident.findOne({ $or: [{ id: incidentId }, { ticket_number: incidentId }] });
      if (!incident) {
        throw new Error('Incident not found');
      }

      // Calculate priority score based on multiple factors
      const score = this._calculatePriorityScore(incident);
      
      // Determine priority level
      const priority = this._determinePriority(score);

      // Update incident
      incident.priority = priority;
      incident.priority_score = score;
      incident.timeline.push({
        event_type: 'updated',
        description: `Auto-prioritized as ${priority} (score: ${score})`,
        metadata: { auto_prioritized: true, score },
      });

      await incident.save();
      logger.info(`Incident ${incident.ticket_number} prioritized as ${priority} (score: ${score})`);
      
      return {
        incident,
        priority,
        score,
        factors: this._getScoreBreakdown(incident),
      };
    } catch (error) {
      logger.error('Error prioritizing incident:', error);
      throw error;
    }
  }

  /**
   * Calculate priority score (0-100)
   */
  _calculatePriorityScore(incident) {
    let score = 0;

    // Severity weight (40 points)
    const severityScores = {
      critical: 40,
      high: 30,
      medium: 20,
      low: 10,
    };
    score += severityScores[incident.severity] || 20;

    // Asset criticality (30 points)
    if (incident.affected_assets && incident.affected_assets.length > 0) {
      const assetScore = this._calculateAssetScore(incident.affected_assets);
      score += assetScore;
    }

    // Threat association (15 points)
    if (incident.related_threats && incident.related_threats.length > 0) {
      score += Math.min(15, incident.related_threats.length * 3);
    }

    // IoC count (10 points)
    if (incident.related_iocs && incident.related_iocs.length > 0) {
      score += Math.min(10, incident.related_iocs.length * 2);
    }

    // Time factor (5 points) - age of incident
    const ageHours = (Date.now() - incident.created_at) / (1000 * 60 * 60);
    if (ageHours > 24) {
      score += 5;
    } else if (ageHours > 12) {
      score += 3;
    }

    return Math.min(100, Math.round(score));
  }

  /**
   * Calculate asset criticality score
   */
  _calculateAssetScore(assets) {
    const criticalityScores = {
      critical: 30,
      high: 20,
      medium: 10,
      low: 5,
    };

    let maxScore = 0;
    for (const asset of assets) {
      const assetScore = criticalityScores[asset.criticality] || 5;
      if (assetScore > maxScore) {
        maxScore = assetScore;
      }
    }
    return maxScore;
  }

  /**
   * Determine priority level from score
   */
  _determinePriority(score) {
    if (score >= 75) return 'critical';
    if (score >= 50) return 'high';
    if (score >= 25) return 'medium';
    return 'low';
  }

  /**
   * Get detailed score breakdown
   */
  _getScoreBreakdown(incident) {
    const severityScores = {
      critical: 40,
      high: 30,
      medium: 20,
      low: 10,
    };

    const breakdown = {
      severity: severityScores[incident.severity] || 20,
      asset_criticality: incident.affected_assets 
        ? this._calculateAssetScore(incident.affected_assets) 
        : 0,
      threat_association: incident.related_threats 
        ? Math.min(15, incident.related_threats.length * 3) 
        : 0,
      ioc_count: incident.related_iocs 
        ? Math.min(10, incident.related_iocs.length * 2) 
        : 0,
      age_factor: 0,
    };

    const ageHours = (Date.now() - incident.created_at) / (1000 * 60 * 60);
    if (ageHours > 24) {
      breakdown.age_factor = 5;
    } else if (ageHours > 12) {
      breakdown.age_factor = 3;
    }

    return breakdown;
  }

  /**
   * Batch prioritize multiple incidents
   */
  async batchPrioritize(filters = {}) {
    try {
      const query = {
        status: { $nin: ['resolved', 'closed'] },
        ...filters,
      };

      const incidents = await Incident.find(query);
      const results = [];

      for (const incident of incidents) {
        try {
          const result = await this.prioritizeIncident(incident.id);
          results.push(result);
        } catch (error) {
          logger.error(`Error prioritizing incident ${incident.ticket_number}:`, error);
          results.push({
            incident_id: incident.id,
            error: error.message,
          });
        }
      }

      return results;
    } catch (error) {
      logger.error('Error batch prioritizing incidents:', error);
      throw error;
    }
  }

  /**
   * Re-prioritize based on custom rules
   */
  async customPrioritize(incidentId, rules) {
    try {
      const incident = await Incident.findOne({ $or: [{ id: incidentId }, { ticket_number: incidentId }] });
      if (!incident) {
        throw new Error('Incident not found');
      }

      let score = 0;

      // Apply custom rules
      for (const rule of rules) {
        if (this._evaluateRule(incident, rule)) {
          score += rule.weight || 10;
        }
      }

      const priority = this._determinePriority(score);
      incident.priority = priority;
      incident.priority_score = score;
      incident.timeline.push({
        event_type: 'updated',
        description: `Custom prioritization applied: ${priority} (score: ${score})`,
        metadata: { custom_rules: rules.length, score },
      });

      await incident.save();
      return { incident, priority, score };
    } catch (error) {
      logger.error('Error custom prioritizing incident:', error);
      throw error;
    }
  }

  /**
   * Evaluate a custom rule
   */
  _evaluateRule(incident, rule) {
    try {
      const { field, operator, value } = rule;
      const incidentValue = this._getNestedValue(incident, field);

      switch (operator) {
        case 'equals':
          return incidentValue === value;
        case 'not_equals':
          return incidentValue !== value;
        case 'contains':
          return Array.isArray(incidentValue) && incidentValue.includes(value);
        case 'greater_than':
          return incidentValue > value;
        case 'less_than':
          return incidentValue < value;
        default:
          return false;
      }
    } catch (error) {
      return false;
    }
  }

  /**
   * Get nested object value by path
   */
  _getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
}

module.exports = new PrioritizationService();
