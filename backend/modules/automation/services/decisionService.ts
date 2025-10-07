/**
 * Decision Tree & Conditional Logic Service
 * Handles intelligent decision-making in playbooks (Sub-Feature 15.5)
 */

import Playbook from '../models/Playbook';
import PlaybookExecution from '../models/PlaybookExecution';
import logger from '../utils/logger';

class DecisionService {
  /**
   * Add decision point to playbook
   * @param {string} playbookId - Playbook ID
   * @param {Object} decisionData - Decision data
   * @returns {Promise<Object>} Updated playbook
   */
  async addDecision(playbookId, decisionData) {
    try {
      logger.info('Adding decision to playbook', {
        playbook_id: playbookId,
        decision_point: decisionData.decision_point,
      });

      const playbook = await Playbook.findOne({ id: playbookId });

      if (!playbook) {
        throw new Error('Playbook not found');
      }

      // Store decision logic in playbook metadata
      if (!playbook.metadata) {
        playbook.metadata = {};
      }

      if (!playbook.metadata.decisions) {
        playbook.metadata.decisions = [];
      }

      playbook.metadata.decisions.push({
        id: `decision_${Date.now()}`,
        ...decisionData,
        created_at: new Date(),
      });

      await playbook.save();

      logger.info('Decision added to playbook', { playbook_id: playbookId });

      return playbook;
    } catch (error) {
      logger.error('Error adding decision', { error: error.message });
      throw error;
    }
  }

  /**
   * Evaluate decision condition
   * @param {Object} condition - Decision condition
   * @param {Object} context - Evaluation context
   * @returns {boolean} Evaluation result
   */
  evaluateDecision(condition, context) {
    try {
      logger.info('Evaluating decision', { condition });

      if (!condition) {
        return true;
      }

      // Handle different condition types
      if (condition.type === 'simple') {
        return this.evaluateSimpleCondition(condition, context);
      } if (condition.type === 'compound') {
        return this.evaluateCompoundCondition(condition, context);
      } if (condition.type === 'risk_based') {
        return this.evaluateRiskBasedCondition(condition, context);
      }

      return true;
    } catch (error) {
      logger.error('Error evaluating decision', { error: error.message });
      return false;
    }
  }

  /**
   * Evaluate simple condition
   * @param {Object} condition - Condition
   * @param {Object} context - Context
   * @returns {boolean} Result
   */
  evaluateSimpleCondition(condition, context) {
    const { variable, operator, value } = condition;
    const contextValue = this.getNestedValue(context, variable);

    switch (operator) {
      case 'equals':
        return contextValue === value;
      case 'not_equals':
        return contextValue !== value;
      case 'greater_than':
        return contextValue > value;
      case 'less_than':
        return contextValue < value;
      case 'greater_or_equal':
        return contextValue >= value;
      case 'less_or_equal':
        return contextValue <= value;
      case 'contains':
        return String(contextValue).includes(value);
      case 'not_contains':
        return !String(contextValue).includes(value);
      case 'in':
        return Array.isArray(value) && value.includes(contextValue);
      case 'not_in':
        return Array.isArray(value) && !value.includes(contextValue);
      default:
        return false;
    }
  }

  /**
   * Evaluate compound condition (AND/OR logic)
   * @param {Object} condition - Compound condition
   * @param {Object} context - Context
   * @returns {boolean} Result
   */
  evaluateCompoundCondition(condition, context) {
    const { logic, conditions } = condition;

    if (!Array.isArray(conditions) || conditions.length === 0) {
      return true;
    }

    if (logic === 'AND') {
      return conditions.every((c) => this.evaluateDecision(c, context));
    } if (logic === 'OR') {
      return conditions.some((c) => this.evaluateDecision(c, context));
    }

    return false;
  }

  /**
   * Evaluate risk-based condition
   * @param {Object} condition - Risk condition
   * @param {Object} context - Context
   * @returns {boolean} Result
   */
  evaluateRiskBasedCondition(condition, context) {
    const riskScore = context.risk_score || 0;
    const threshold = condition.risk_threshold || 50;

    switch (condition.risk_operator) {
      case 'high_risk':
        return riskScore >= 70;
      case 'medium_risk':
        return riskScore >= 40 && riskScore < 70;
      case 'low_risk':
        return riskScore < 40;
      case 'above_threshold':
        return riskScore >= threshold;
      case 'below_threshold':
        return riskScore < threshold;
      default:
        return false;
    }
  }

  /**
   * Get execution paths for playbook
   * @param {string} playbookId - Playbook ID
   * @param {Object} context - Evaluation context
   * @returns {Promise<Object>} Execution paths
   */
  async getExecutionPaths(playbookId, context = {}) {
    try {
      logger.info('Getting execution paths', { playbook_id: playbookId });

      const playbook = await Playbook.findOne({ id: playbookId });

      if (!playbook) {
        throw new Error('Playbook not found');
      }

      const paths = [];
      const decisions = playbook.metadata?.decisions || [];

      // Build decision tree
      for (const decision of decisions) {
        const evaluationResult = this.evaluateDecision(decision.condition, context);

        paths.push({
          decision_id: decision.id,
          decision_point: decision.decision_point,
          evaluated: evaluationResult,
          true_path: decision.true_path,
          false_path: decision.false_path,
          selected_path: evaluationResult ? decision.true_path : decision.false_path,
        });
      }

      return {
        playbook_id: playbookId,
        paths,
        total_decisions: decisions.length,
      };
    } catch (error) {
      logger.error('Error getting execution paths', { error: error.message });
      throw error;
    }
  }

  /**
   * Analyze decision effectiveness
   * @param {string} playbookId - Playbook ID
   * @returns {Promise<Object>} Decision analysis
   */
  async analyzeDecisions(playbookId) {
    try {
      logger.info('Analyzing decisions', { playbook_id: playbookId });

      const executions = await PlaybookExecution.find({
        playbook_id: playbookId,
        status: { $in: ['completed', 'failed'] },
      }).limit(100);

      const analysis = {
        total_executions: executions.length,
        paths_taken: {},
        decision_impact: {},
      };

      for (const execution of executions) {
        if (execution.decision_path && execution.decision_path.length > 0) {
          for (const path of execution.decision_path) {
            analysis.paths_taken[path] = (analysis.paths_taken[path] || 0) + 1;
          }
        }
      }

      return analysis;
    } catch (error) {
      logger.error('Error analyzing decisions', { error: error.message });
      throw error;
    }
  }

  /**
   * Get nested value from object
   * @param {Object} obj - Object
   * @param {string} path - Dot-notation path
   * @returns {*} Value
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Validate decision logic
   * @param {Object} decision - Decision to validate
   * @returns {Object} Validation result
   */
  validateDecision(decision) {
    const errors = [];

    if (!decision.decision_point) {
      errors.push('Decision point is required');
    }

    if (!decision.condition) {
      errors.push('Decision condition is required');
    }

    if (!decision.true_path) {
      errors.push('True path is required');
    }

    if (!decision.false_path) {
      errors.push('False path is required');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export default new DecisionService();

