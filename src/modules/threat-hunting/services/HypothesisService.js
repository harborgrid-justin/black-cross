/**
 * Hypothesis Service
 * Business logic for custom hunting hypotheses management (Feature 3.2)
 */

const Hypothesis = require('../models/Hypothesis');
const database = require('../models/database');

class HypothesisService {
  /**
   * Create a new hypothesis
   */
  async createHypothesis(hypothesisData, userId) {
    const hypothesis = new Hypothesis({
      ...hypothesisData,
      createdBy: userId,
      version: 1,
      status: 'draft',
    });

    const saved = await database.saveHypothesis(hypothesis.toJSON());
    return Hypothesis.fromDatabase(saved);
  }

  /**
   * Get a hypothesis by ID
   */
  async getHypothesis(hypothesisId) {
    const hypothesis = await database.getHypothesis(hypothesisId);
    if (!hypothesis) {
      throw new Error('Hypothesis not found');
    }
    return Hypothesis.fromDatabase(hypothesis);
  }

  /**
   * List hypotheses
   */
  async listHypotheses(filters = {}) {
    const hypotheses = await database.listHypotheses(filters);
    return hypotheses.map((h) => Hypothesis.fromDatabase(h));
  }

  /**
   * Update a hypothesis (creates new version)
   */
  async updateHypothesis(hypothesisId, updates, userId) {
    const existing = await database.getHypothesis(hypothesisId);
    if (!existing) {
      throw new Error('Hypothesis not found');
    }

    if (!existing.collaborators.includes(userId) && existing.createdBy !== userId) {
      throw new Error('Unauthorized to update this hypothesis');
    }

    const updated = await database.updateHypothesis(hypothesisId, {
      ...updates,
      version: (existing.version || 1) + 1,
    });

    return Hypothesis.fromDatabase(updated);
  }

  /**
   * Validate a hypothesis
   */
  async validateHypothesis(hypothesisId, validationData, userId) {
    const hypothesis = await database.getHypothesis(hypothesisId);
    if (!hypothesis) {
      throw new Error('Hypothesis not found');
    }

    const validationResult = {
      isValid: validationData.isValid,
      evidence: validationData.evidence || [],
      reasoning: validationData.reasoning || '',
      validatedBy: userId,
      validatedAt: new Date(),
    };

    const updated = await database.updateHypothesis(hypothesisId, {
      validationStatus: validationData.isValid ? 'validated' : 'invalidated',
      validatedAt: new Date(),
      successMetrics: {
        ...hypothesis.successMetrics,
        ...validationResult,
      },
    });

    return Hypothesis.fromDatabase(updated);
  }

  /**
   * Add collaborator to hypothesis
   */
  async addCollaborator(hypothesisId, collaboratorId, userId) {
    const hypothesis = await database.getHypothesis(hypothesisId);
    if (!hypothesis) {
      throw new Error('Hypothesis not found');
    }

    if (hypothesis.createdBy !== userId) {
      throw new Error('Only the creator can add collaborators');
    }

    const collaborators = hypothesis.collaborators || [];
    if (!collaborators.includes(collaboratorId)) {
      collaborators.push(collaboratorId);
    }

    const updated = await database.updateHypothesis(hypothesisId, {
      collaborators,
    });

    return Hypothesis.fromDatabase(updated);
  }

  /**
   * Get hypothesis templates
   */
  async getTemplates() {
    const templates = [
      {
        title: 'Data Exfiltration via DNS',
        hypothesis: 'Attackers are using DNS queries to exfiltrate sensitive data',
        description: 'Look for unusual DNS query patterns, especially long subdomains or high-frequency queries to uncommon domains',
      },
      {
        title: 'Lateral Movement Detection',
        hypothesis: 'Unauthorized lateral movement is occurring across the network',
        description: 'Identify unusual SMB, RDP, or WMI connections between hosts',
      },
      {
        title: 'Credential Dumping Activity',
        hypothesis: 'Attackers are attempting to dump credentials from memory',
        description: 'Look for suspicious LSASS access, registry queries for SAM, or unusual process behavior',
      },
    ];

    return templates;
  }

  /**
   * Get success metrics for a hypothesis
   */
  async getSuccessMetrics(hypothesisId) {
    const hypothesis = await database.getHypothesis(hypothesisId);
    if (!hypothesis) {
      throw new Error('Hypothesis not found');
    }

    const metrics = {
      hypothesis: hypothesis.title,
      status: hypothesis.validationStatus,
      created: hypothesis.createdAt,
      validated: hypothesis.validatedAt,
      queriesExecuted: hypothesis.relatedQueries?.length || 0,
      findingsGenerated: 0, // Would be calculated from findings linked to this hypothesis
      successRate: hypothesis.successMetrics?.isValid ? 100 : 0,
    };

    return metrics;
  }

  /**
   * Delete a hypothesis
   */
  async deleteHypothesis(hypothesisId, userId) {
    const hypothesis = await database.getHypothesis(hypothesisId);
    if (!hypothesis) {
      throw new Error('Hypothesis not found');
    }

    if (hypothesis.createdBy !== userId) {
      throw new Error('Unauthorized to delete this hypothesis');
    }

    return database.deleteHypothesis(hypothesisId);
  }
}

module.exports = new HypothesisService();
