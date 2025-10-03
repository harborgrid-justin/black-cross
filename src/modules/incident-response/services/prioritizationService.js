/**
 * Prioritization Service
 * Automated incident prioritization logic
 */

const { IncidentPriority, IncidentSeverity } = require('../models');
const dataStore = require('./dataStore');

class PrioritizationService {
  /**
   * Prioritize an incident based on multiple factors
   */
  async prioritizeIncident(incidentId, factors = {}) {
    const incident = await dataStore.getIncident(incidentId);
    if (!incident) {
      throw new Error('Incident not found');
    }

    // Calculate priority score
    const priorityScore = this.calculatePriorityScore({
      severity: incident.severity,
      affectedAssets: incident.affected_assets,
      relatedThreats: incident.related_threats,
      customFactors: factors
    });

    // Calculate impact score
    const impactScore = this.calculateImpactScore({
      severity: incident.severity,
      affectedAssets: incident.affected_assets,
      category: incident.category
    });

    // Calculate urgency score
    const urgencyScore = this.calculateUrgencyScore({
      severity: incident.severity,
      createdAt: incident.created_at,
      sla: incident.sla
    });

    // Determine priority level
    const priority = this.determinePriorityLevel(priorityScore);

    // Update incident with scores and priority
    return await dataStore.updateIncident(incidentId, {
      priority,
      priority_score: priorityScore,
      impact_score: impactScore,
      urgency_score: urgencyScore
    });
  }

  /**
   * Calculate priority score (0-100)
   */
  calculatePriorityScore(data) {
    let score = 0;

    // Severity weight (40%)
    const severityScores = {
      [IncidentSeverity.CRITICAL]: 40,
      [IncidentSeverity.HIGH]: 30,
      [IncidentSeverity.MEDIUM]: 20,
      [IncidentSeverity.LOW]: 10
    };
    score += severityScores[data.severity] || 15;

    // Affected assets weight (30%)
    const assetCount = data.affectedAssets?.length || 0;
    if (assetCount === 0) {
      score += 5;
    } else if (assetCount <= 5) {
      score += 15;
    } else if (assetCount <= 20) {
      score += 25;
    } else {
      score += 30;
    }

    // Related threats weight (20%)
    const threatCount = data.relatedThreats?.length || 0;
    if (threatCount > 0) {
      score += Math.min(threatCount * 5, 20);
    }

    // Custom factors weight (10%)
    if (data.customFactors) {
      if (data.customFactors.businessCriticality === 'high') score += 5;
      if (data.customFactors.dataExposure === true) score += 5;
    }

    return Math.min(score, 100);
  }

  /**
   * Calculate impact score (0-100)
   */
  calculateImpactScore(data) {
    let score = 0;

    // Severity impact
    const severityScores = {
      [IncidentSeverity.CRITICAL]: 50,
      [IncidentSeverity.HIGH]: 35,
      [IncidentSeverity.MEDIUM]: 20,
      [IncidentSeverity.LOW]: 10
    };
    score += severityScores[data.severity] || 15;

    // Asset impact
    const assetCount = data.affectedAssets?.length || 0;
    score += Math.min(assetCount * 2, 30);

    // Category impact
    const highImpactCategories = ['data_breach', 'ransomware', 'system_compromise'];
    if (highImpactCategories.includes(data.category)) {
      score += 20;
    }

    return Math.min(score, 100);
  }

  /**
   * Calculate urgency score (0-100)
   */
  calculateUrgencyScore(data) {
    let score = 0;

    // Severity urgency
    const severityScores = {
      [IncidentSeverity.CRITICAL]: 50,
      [IncidentSeverity.HIGH]: 35,
      [IncidentSeverity.MEDIUM]: 20,
      [IncidentSeverity.LOW]: 10
    };
    score += severityScores[data.severity] || 15;

    // Time-based urgency (SLA consideration)
    const now = new Date();
    const timeSinceCreation = now - new Date(data.createdAt);
    const responseTimeRemaining = data.sla.response_time - timeSinceCreation;

    if (responseTimeRemaining < 0) {
      // SLA breached
      score += 30;
    } else if (responseTimeRemaining < data.sla.response_time * 0.25) {
      // 75% of response time used
      score += 25;
    } else if (responseTimeRemaining < data.sla.response_time * 0.5) {
      // 50% of response time used
      score += 15;
    } else {
      score += 5;
    }

    return Math.min(score, 100);
  }

  /**
   * Determine priority level based on score
   */
  determinePriorityLevel(score) {
    if (score >= 80) return IncidentPriority.CRITICAL;
    if (score >= 60) return IncidentPriority.HIGH;
    if (score >= 40) return IncidentPriority.MEDIUM;
    return IncidentPriority.LOW;
  }

  /**
   * Re-prioritize all incidents
   */
  async reprioritizeAll() {
    const result = await dataStore.listIncidents({ limit: 1000 });
    const incidents = result.incidents;

    const prioritized = [];
    for (const incident of incidents) {
      // Only re-prioritize active incidents
      if (incident.status !== 'closed' && incident.status !== 'resolved') {
        const updated = await this.prioritizeIncident(incident.id);
        prioritized.push(updated);
      }
    }

    return prioritized;
  }

  /**
   * Get custom prioritization rules
   */
  async getCustomRules() {
    // Placeholder for custom prioritization rules
    return {
      rules: [
        {
          name: 'Critical Asset Rule',
          condition: 'affected_assets.includes(critical_asset)',
          action: 'increase_priority',
          weight: 20
        },
        {
          name: 'After Hours Rule',
          condition: 'time_of_day.between(18:00, 08:00)',
          action: 'increase_urgency',
          weight: 10
        },
        {
          name: 'Repeated Incident Rule',
          condition: 'related_incidents.count > 2',
          action: 'increase_priority',
          weight: 15
        }
      ]
    };
  }
}

module.exports = new PrioritizationService();
