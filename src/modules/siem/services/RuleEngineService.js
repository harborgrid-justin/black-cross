/**
 * Rule Engine Service
 * 
 * Handles custom detection rules and rule evaluation
 */

const { detectionRuleRepository, alertRepository } = require('../repositories');

class RuleEngineService {
  /**
   * Evaluate event against all enabled rules
   */
  async evaluateEvent(event) {
    const rules = await detectionRuleRepository.findEnabled();
    const triggeredRules = [];

    for (const rule of rules) {
      if (rule.matches(event)) {
        triggeredRules.push(rule);
        
        // Record trigger
        rule.trigger();
        await detectionRuleRepository.update(rule.id, rule);

        // Generate alert from rule
        await this.generateAlert(rule, event);
      }
    }

    return triggeredRules;
  }

  /**
   * Generate alert from triggered rule
   */
  async generateAlert(rule, event) {
    const alertData = {
      ...rule.alert_template,
      title: rule.alert_template.title || rule.name,
      description: rule.alert_template.description || rule.description,
      severity: rule.severity,
      priority: rule.severity,
      rule_id: rule.id,
      rule_name: rule.name,
      event_ids: [event.id],
      source_events: [event.toJSON()]
    };

    const alert = await alertRepository.create(alertData);

    // Execute rule actions
    await this.executeActions(rule, alert, event);

    return alert;
  }

  /**
   * Execute rule actions
   */
  async executeActions(rule, alert, event) {
    for (const action of rule.actions) {
      try {
        switch (action.type) {
          case 'notify':
            // Placeholder for notification logic
            console.log(`Notification: ${action.target} - ${alert.title}`);
            break;
          case 'escalate':
            alert.escalate();
            await alertRepository.update(alert.id, alert);
            break;
          case 'assign':
            alert.assign(action.assignee);
            await alertRepository.update(alert.id, alert);
            break;
          default:
            console.log(`Unknown action type: ${action.type}`);
        }
      } catch (error) {
        console.error(`Error executing action ${action.type}:`, error.message);
      }
    }
  }

  /**
   * Create detection rule
   */
  async createRule(ruleData) {
    // Validate rule conditions
    if (!ruleData.conditions || ruleData.conditions.length === 0) {
      throw new Error('Rule must have at least one condition');
    }

    return await detectionRuleRepository.create(ruleData);
  }

  /**
   * Get detection rules
   */
  async getRules(filters = {}) {
    return await detectionRuleRepository.findAll(filters);
  }

  /**
   * Get rule by ID
   */
  async getRule(id) {
    return await detectionRuleRepository.findById(id);
  }

  /**
   * Update detection rule
   */
  async updateRule(id, updates, userId) {
    const rule = await detectionRuleRepository.findById(id);
    if (!rule) {
      throw new Error('Rule not found');
    }

    Object.assign(rule, updates);
    rule.updateVersion(userId);

    return await detectionRuleRepository.update(id, rule);
  }

  /**
   * Delete detection rule
   */
  async deleteRule(id) {
    return await detectionRuleRepository.delete(id);
  }

  /**
   * Test rule against sample event
   */
  async testRule(ruleData, sampleEvent) {
    const { DetectionRule } = require('../models');
    const rule = new DetectionRule(ruleData);
    
    return {
      matches: rule.matches(sampleEvent),
      rule: rule.toJSON(),
      event: sampleEvent
    };
  }

  /**
   * Get rule statistics
   */
  async getStatistics() {
    const rules = await detectionRuleRepository.findAll();
    
    return {
      total_rules: rules.length,
      enabled_rules: rules.filter(r => r.enabled).length,
      total_triggers: rules.reduce((sum, r) => sum + r.trigger_count, 0),
      total_false_positives: rules.reduce((sum, r) => sum + r.false_positive_count, 0),
      by_type: {
        threshold: rules.filter(r => r.rule_type === 'threshold').length,
        anomaly: rules.filter(r => r.rule_type === 'anomaly').length,
        correlation: rules.filter(r => r.rule_type === 'correlation').length,
        signature: rules.filter(r => r.rule_type === 'signature').length
      },
      top_rules: rules
        .sort((a, b) => b.trigger_count - a.trigger_count)
        .slice(0, 10)
        .map(r => ({
          id: r.id,
          name: r.name,
          trigger_count: r.trigger_count,
          effectiveness: r.getEffectiveness()
        }))
    };
  }
}

module.exports = new RuleEngineService();
