/**
 * CorrelationRule Repository
 * 
 * Handles data persistence for correlation rules
 */

const CorrelationRule = require('../models/CorrelationRule');

class CorrelationRuleRepository {
  constructor() {
    this.rules = new Map();
  }

  /**
   * Create new correlation rule
   */
  async create(ruleData) {
    const rule = new CorrelationRule(ruleData);
    this.rules.set(rule.id, rule);
    return rule;
  }

  /**
   * Find rule by ID
   */
  async findById(id) {
    return this.rules.get(id) || null;
  }

  /**
   * Find all rules
   */
  async findAll(filters = {}) {
    let rules = Array.from(this.rules.values());

    if (filters.enabled !== undefined) {
      rules = rules.filter(r => r.enabled === filters.enabled);
    }

    return rules;
  }

  /**
   * Find enabled rules
   */
  async findEnabled() {
    return Array.from(this.rules.values()).filter(r => r.enabled);
  }

  /**
   * Update rule
   */
  async update(id, updates) {
    const rule = this.rules.get(id);
    if (!rule) return null;

    Object.assign(rule, updates);
    rule.updated_at = new Date();
    this.rules.set(id, rule);
    return rule;
  }

  /**
   * Delete rule
   */
  async delete(id) {
    return this.rules.delete(id);
  }

  /**
   * Clear all rules (for testing)
   */
  async clear() {
    this.rules.clear();
  }
}

module.exports = new CorrelationRuleRepository();
