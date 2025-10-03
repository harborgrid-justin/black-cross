/**
 * Finding Service
 * Business logic for hunt result documentation (Feature 3.6)
 */

const Finding = require('../models/Finding');
const database = require('../models/database');

class FindingService {
  /**
   * Create a new finding
   */
  async createFinding(findingData, userId) {
    const finding = new Finding({
      ...findingData,
      discoveredBy: userId,
      status: 'new',
    });

    const saved = await database.saveFinding(finding.toJSON());
    return Finding.fromDatabase(saved);
  }

  /**
   * Get a finding by ID
   */
  async getFinding(findingId) {
    const finding = await database.getFinding(findingId);
    if (!finding) {
      throw new Error('Finding not found');
    }
    return Finding.fromDatabase(finding);
  }

  /**
   * List findings
   */
  async listFindings(filters = {}) {
    const findings = await database.listFindings(filters);
    return findings.map((f) => Finding.fromDatabase(f));
  }

  /**
   * Update finding
   */
  async updateFinding(findingId, updates, userId) {
    const finding = await database.getFinding(findingId);
    if (!finding) {
      throw new Error('Finding not found');
    }

    const updated = await database.updateFinding(findingId, {
      ...updates,
      updatedBy: userId,
    });

    return Finding.fromDatabase(updated);
  }

  /**
   * Add evidence to finding
   */
  async addEvidence(findingId, evidence, userId) {
    const finding = await database.getFinding(findingId);
    if (!finding) {
      throw new Error('Finding not found');
    }

    const currentEvidence = finding.evidence || [];
    currentEvidence.push({
      ...evidence,
      addedBy: userId,
      addedAt: new Date(),
    });

    const updated = await database.updateFinding(findingId, {
      evidence: currentEvidence,
    });

    return Finding.fromDatabase(updated);
  }

  /**
   * Classify finding severity
   */
  async classifySeverity(findingId, severity, userId) {
    const validSeverities = ['critical', 'high', 'medium', 'low', 'info'];
    if (!validSeverities.includes(severity)) {
      throw new Error(`Invalid severity: ${severity}`);
    }

    const updated = await database.updateFinding(findingId, {
      severity,
      classifiedBy: userId,
      classifiedAt: new Date(),
    });

    return Finding.fromDatabase(updated);
  }

  /**
   * Add recommended actions
   */
  async addRecommendedActions(findingId, actions, userId) {
    const finding = await database.getFinding(findingId);
    if (!finding) {
      throw new Error('Finding not found');
    }

    const currentActions = finding.recommendedActions || [];
    actions.forEach((action) => {
      currentActions.push({
        ...action,
        recommendedBy: userId,
        recommendedAt: new Date(),
      });
    });

    const updated = await database.updateFinding(findingId, {
      recommendedActions: currentActions,
    });

    return Finding.fromDatabase(updated);
  }

  /**
   * Convert finding to incident
   */
  async convertToIncident(findingId, incidentData, userId) {
    const finding = await database.getFinding(findingId);
    if (!finding) {
      throw new Error('Finding not found');
    }

    if (finding.convertedToIncident) {
      throw new Error('Finding already converted to incident');
    }

    // In production, this would create an actual incident
    const mockIncidentId = `INC-${Date.now()}`;

    const updated = await database.updateFinding(findingId, {
      convertedToIncident: true,
      incidentId: mockIncidentId,
      convertedBy: userId,
      convertedAt: new Date(),
      status: 'escalated',
    });

    return {
      finding: Finding.fromDatabase(updated),
      incidentId: mockIncidentId,
    };
  }

  /**
   * Share finding
   */
  async shareFinding(findingId, recipients, userId) {
    const finding = await database.getFinding(findingId);
    if (!finding) {
      throw new Error('Finding not found');
    }

    // Simulate sharing logic
    const shareRecord = {
      findingId,
      sharedBy: userId,
      recipients,
      sharedAt: new Date(),
    };

    return shareRecord;
  }

  /**
   * Get findings trend analysis
   */
  async getTrendAnalysis(filters = {}) {
    const findings = await database.listFindings(filters);

    const trends = {
      total: findings.length,
      bySeverity: this.groupBy(findings, 'severity'),
      byStatus: this.groupBy(findings, 'status'),
      byCategory: this.groupBy(findings, 'category'),
      timeline: this.generateTimeline(findings),
      topMitreTactics: this.getTopMitreTactics(findings),
    };

    return trends;
  }

  /**
   * Export finding
   */
  async exportFinding(findingId, format = 'json') {
    const finding = await database.getFinding(findingId);
    if (!finding) {
      throw new Error('Finding not found');
    }

    const findingObj = Finding.fromDatabase(finding);

    switch (format.toLowerCase()) {
      case 'json':
        return JSON.stringify(findingObj.toJSON(), null, 2);
      case 'markdown':
        return this.convertToMarkdown(findingObj);
      case 'pdf':
        return this.convertToPDF(findingObj);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  /**
   * Delete finding
   */
  async deleteFinding(findingId, userId) {
    const finding = await database.getFinding(findingId);
    if (!finding) {
      throw new Error('Finding not found');
    }

    if (finding.discoveredBy !== userId) {
      throw new Error('Unauthorized to delete this finding');
    }

    return database.deleteFinding(findingId);
  }

  /**
   * Helper: Group findings by field
   */
  groupBy(findings, field) {
    const grouped = {};
    findings.forEach((finding) => {
      const key = finding[field] || 'unknown';
      grouped[key] = (grouped[key] || 0) + 1;
    });
    return grouped;
  }

  /**
   * Helper: Generate timeline
   */
  generateTimeline(findings) {
    const timeline = {};
    findings.forEach((finding) => {
      const date = new Date(finding.discoveredAt).toISOString().split('T')[0];
      timeline[date] = (timeline[date] || 0) + 1;
    });
    return timeline;
  }

  /**
   * Helper: Get top MITRE tactics
   */
  getTopMitreTactics(findings) {
    const tactics = {};
    findings.forEach((finding) => {
      if (finding.mitreTactics) {
        finding.mitreTactics.forEach((tactic) => {
          tactics[tactic] = (tactics[tactic] || 0) + 1;
        });
      }
    });
    return Object.entries(tactics)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  }

  /**
   * Helper: Convert to Markdown
   */
  convertToMarkdown(finding) {
    return `# ${finding.title}

## Summary
**Severity:** ${finding.severity}
**Status:** ${finding.status}
**Discovered:** ${finding.discoveredAt}

## Description
${finding.description}

## Evidence
${finding.evidence.map((e, i) => `${i + 1}. ${e.description || 'Evidence item'}`).join('\n')}

## Recommended Actions
${finding.recommendedActions.map((a, i) => `${i + 1}. ${a.action || a.description}`).join('\n')}

## MITRE ATT&CK
- **Tactics:** ${finding.mitreTactics.join(', ')}
- **Techniques:** ${finding.mitreIds.join(', ')}
`;
  }

  /**
   * Helper: Convert to PDF (simulated)
   */
  convertToPDF(finding) {
    // In production, use a PDF library like pdfkit
    return {
      format: 'pdf',
      content: finding.toJSON(),
      generated: new Date(),
    };
  }
}

module.exports = new FindingService();
