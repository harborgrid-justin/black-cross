/**
 * Playbook Service
 * Business logic for automated hunting playbooks (Feature 3.3)
 */

const Playbook = require('../models/Playbook');
const database = require('../models/database');

class PlaybookService {
  /**
   * Create a new playbook
   */
  async createPlaybook(playbookData, userId) {
    const playbook = new Playbook({
      ...playbookData,
      createdBy: userId,
      enabled: true,
    });

    const saved = await database.savePlaybook(playbook.toJSON());
    return Playbook.fromDatabase(saved);
  }

  /**
   * Get a playbook by ID
   */
  async getPlaybook(playbookId) {
    const playbook = await database.getPlaybook(playbookId);
    if (!playbook) {
      throw new Error('Playbook not found');
    }
    return Playbook.fromDatabase(playbook);
  }

  /**
   * List playbooks
   */
  async listPlaybooks(filters = {}) {
    const playbooks = await database.listPlaybooks(filters);
    return playbooks.map((p) => Playbook.fromDatabase(p));
  }

  /**
   * Execute a playbook
   */
  async executePlaybook(playbookId, userId) {
    const playbook = await database.getPlaybook(playbookId);
    if (!playbook) {
      throw new Error('Playbook not found');
    }

    if (!playbook.enabled) {
      throw new Error('Playbook is disabled');
    }

    const startTime = Date.now();
    const results = {
      playbookId,
      executedBy: userId,
      startedAt: new Date(),
      steps: [],
      findings: [],
      status: 'running',
    };

    try {
      // Execute each step in the playbook
      for (const step of playbook.steps) {
        const stepResult = await this.executeStep(step);
        results.steps.push(stepResult);

        if (stepResult.findings && stepResult.findings.length > 0) {
          results.findings.push(...stepResult.findings);
        }
      }

      results.status = 'completed';
      results.completedAt = new Date();
      results.executionTime = Date.now() - startTime;

      // Update playbook statistics
      await database.updatePlaybook(playbookId, {
        lastExecutedAt: new Date(),
        executionCount: (playbook.executionCount || 0) + 1,
        successCount: (playbook.successCount || 0) + 1,
        effectivenessScore: this.calculateEffectiveness(
          playbook.successCount + 1,
          playbook.executionCount + 1,
          results.findings.length,
        ),
      });

      return results;
    } catch (error) {
      results.status = 'failed';
      results.error = error.message;
      results.completedAt = new Date();

      await database.updatePlaybook(playbookId, {
        executionCount: (playbook.executionCount || 0) + 1,
        failureCount: (playbook.failureCount || 0) + 1,
      });

      throw error;
    }
  }

  /**
   * Execute a single playbook step
   */
  async executeStep(step) {
    const result = {
      stepName: step.name,
      stepType: step.type,
      startedAt: new Date(),
      status: 'completed',
      findings: [],
    };

    // Simulate step execution
    await new Promise((resolve) => { setTimeout(resolve, 50); });

    if (step.type === 'query') {
      // Simulate query execution
      result.findings = [
        {
          title: `Finding from ${step.name}`,
          severity: 'medium',
          description: 'Automated playbook detected suspicious activity',
        },
      ];
    }

    result.completedAt = new Date();
    return result;
  }

  /**
   * Update a playbook
   */
  async updatePlaybook(playbookId, updates, userId) {
    const playbook = await database.getPlaybook(playbookId);
    if (!playbook) {
      throw new Error('Playbook not found');
    }

    if (playbook.createdBy !== userId) {
      throw new Error('Unauthorized to update this playbook');
    }

    const updated = await database.updatePlaybook(playbookId, updates);
    return Playbook.fromDatabase(updated);
  }

  /**
   * Delete a playbook
   */
  async deletePlaybook(playbookId, userId) {
    const playbook = await database.getPlaybook(playbookId);
    if (!playbook) {
      throw new Error('Playbook not found');
    }

    if (playbook.createdBy !== userId) {
      throw new Error('Unauthorized to delete this playbook');
    }

    return database.deletePlaybook(playbookId);
  }

  /**
   * Get pre-built playbooks
   */
  async getPreBuiltPlaybooks() {
    const preBuilt = [
      {
        name: 'Suspicious Login Pattern Detection',
        description: 'Detects unusual login patterns including failed attempts and impossible travel',
        category: 'authentication',
        steps: [
          { name: 'Query failed logins', type: 'query', query: 'SELECT * FROM auth_logs WHERE status="failed"' },
          { name: 'Analyze geolocation', type: 'analysis', method: 'impossible_travel' },
          { name: 'Check user behavior', type: 'behavior', entity_type: 'user' },
        ],
      },
      {
        name: 'Lateral Movement Hunt',
        description: 'Identifies potential lateral movement across network',
        category: 'network',
        steps: [
          { name: 'Query RDP connections', type: 'query', query: 'SELECT * FROM network_logs WHERE port=3389' },
          { name: 'Check SMB activity', type: 'query', query: 'SELECT * FROM network_logs WHERE port=445' },
          { name: 'Correlate with authentication', type: 'correlation' },
        ],
      },
    ];

    return preBuilt;
  }

  /**
   * Get playbook effectiveness metrics
   */
  async getEffectivenessMetrics(playbookId) {
    const playbook = await database.getPlaybook(playbookId);
    if (!playbook) {
      throw new Error('Playbook not found');
    }

    const successRate = playbook.executionCount > 0
      ? (playbook.successCount / playbook.executionCount) * 100
      : 0;

    return {
      playbookId,
      name: playbook.name,
      executionCount: playbook.executionCount || 0,
      successCount: playbook.successCount || 0,
      failureCount: playbook.failureCount || 0,
      successRate,
      effectivenessScore: playbook.effectivenessScore || 0,
      lastExecuted: playbook.lastExecutedAt,
    };
  }

  /**
   * Calculate effectiveness score
   */
  calculateEffectiveness(successCount, totalCount, findingsCount) {
    const successRate = (successCount / totalCount) * 100;
    const findingsScore = Math.min(findingsCount * 5, 50);
    return Math.min(successRate * 0.5 + findingsScore * 0.5, 100);
  }
}

module.exports = new PlaybookService();
