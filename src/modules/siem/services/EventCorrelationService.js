/**
 * Event Correlation Service
 * 
 * Handles real-time event correlation across multiple sources
 */

const { securityEventRepository, correlationRuleRepository, alertRepository } = require('../repositories');

class EventCorrelationService {
  constructor() {
    this.eventBuffer = new Map(); // Buffer for correlation window
  }

  /**
   * Correlate events based on active rules
   */
  async correlateEvent(event) {
    const rules = await correlationRuleRepository.findEnabled();
    const correlations = [];

    for (const rule of rules) {
      const match = await this.evaluateRule(rule, event);
      if (match) {
        correlations.push({
          rule_id: rule.id,
          rule_name: rule.name,
          matched_events: match.events,
          confidence: match.confidence
        });

        // Record match
        rule.recordMatch();
        await correlationRuleRepository.update(rule.id, rule);

        // Generate alert if configured
        if (rule.alert_on_match) {
          await this.generateAlert(rule, match.events);
        }
      }
    }

    return correlations;
  }

  /**
   * Evaluate correlation rule against event
   */
  async evaluateRule(rule, event) {
    // Get events within time window
    const windowStart = new Date(Date.now() - (rule.time_window * 1000));
    const windowEnd = new Date();
    
    const windowEvents = await securityEventRepository.findByTimeRange(
      windowStart,
      windowEnd
    );

    // Add current event
    windowEvents.push(event);

    // Evaluate based on correlation type
    switch (rule.correlation_type) {
      case 'sequential':
        return this.evaluateSequential(rule, windowEvents);
      case 'parallel':
        return this.evaluateParallel(rule, windowEvents);
      case 'grouped':
        return this.evaluateGrouped(rule, windowEvents);
      default:
        return null;
    }
  }

  /**
   * Evaluate sequential correlation
   */
  evaluateSequential(rule, events) {
    // Check if events match conditions in sequence
    const matchedEvents = [];
    let conditionIndex = 0;

    for (const event of events) {
      const condition = rule.event_conditions[conditionIndex];
      if (this.matchesCondition(event, condition)) {
        matchedEvents.push(event);
        conditionIndex++;

        if (conditionIndex === rule.event_conditions.length) {
          return {
            events: matchedEvents,
            confidence: 0.9
          };
        }
      }
    }

    return null;
  }

  /**
   * Evaluate parallel correlation
   */
  evaluateParallel(rule, events) {
    // Check if all conditions are met simultaneously
    const matchedEvents = [];
    const matchedConditions = new Set();

    for (const event of events) {
      for (let i = 0; i < rule.event_conditions.length; i++) {
        if (!matchedConditions.has(i) && this.matchesCondition(event, rule.event_conditions[i])) {
          matchedEvents.push(event);
          matchedConditions.add(i);
        }
      }
    }

    if (matchedConditions.size >= rule.min_events) {
      return {
        events: matchedEvents,
        confidence: matchedConditions.size / rule.event_conditions.length
      };
    }

    return null;
  }

  /**
   * Evaluate grouped correlation
   */
  evaluateGrouped(rule, events) {
    // Group events by specified fields
    const groups = new Map();

    for (const event of events) {
      const groupKey = rule.grouping_fields
        .map(field => event[field] || event.normalized_fields[field])
        .join('|');

      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }
      groups.get(groupKey).push(event);
    }

    // Check if any group meets threshold
    for (const [key, groupEvents] of groups) {
      if (groupEvents.length >= rule.min_events) {
        // Check if events match conditions
        const matchingEvents = groupEvents.filter(e => 
          rule.event_conditions.some(cond => this.matchesCondition(e, cond))
        );

        if (matchingEvents.length >= rule.min_events) {
          return {
            events: matchingEvents,
            confidence: matchingEvents.length / groupEvents.length
          };
        }
      }
    }

    return null;
  }

  /**
   * Check if event matches condition
   */
  matchesCondition(event, condition) {
    const value = event[condition.field] || event.normalized_fields[condition.field];

    switch (condition.operator) {
      case 'equals':
        return value === condition.value;
      case 'contains':
        return String(value).includes(condition.value);
      case 'regex':
        return new RegExp(condition.value).test(value);
      case 'greater_than':
        return Number(value) > Number(condition.value);
      case 'less_than':
        return Number(value) < Number(condition.value);
      default:
        return false;
    }
  }

  /**
   * Generate alert from correlation
   */
  async generateAlert(rule, events) {
    const alert = await alertRepository.create({
      title: rule.name,
      description: `Correlation detected: ${rule.description}`,
      severity: rule.severity,
      priority: rule.severity,
      rule_id: rule.id,
      rule_name: rule.name,
      event_ids: events.map(e => e.id),
      source_events: events.map(e => e.toJSON())
    });

    return alert;
  }

  /**
   * Create correlation rule
   */
  async createRule(ruleData) {
    return await correlationRuleRepository.create(ruleData);
  }

  /**
   * Get correlation rules
   */
  async getRules(filters = {}) {
    return await correlationRuleRepository.findAll(filters);
  }

  /**
   * Update correlation rule
   */
  async updateRule(id, updates) {
    return await correlationRuleRepository.update(id, updates);
  }

  /**
   * Delete correlation rule
   */
  async deleteRule(id) {
    return await correlationRuleRepository.delete(id);
  }

  /**
   * Get correlation statistics
   */
  async getStatistics() {
    const rules = await correlationRuleRepository.findAll();
    
    return {
      total_rules: rules.length,
      enabled_rules: rules.filter(r => r.enabled).length,
      total_matches: rules.reduce((sum, r) => sum + r.match_count, 0),
      rules: rules.map(r => ({
        id: r.id,
        name: r.name,
        enabled: r.enabled,
        match_count: r.match_count,
        last_matched: r.last_matched
      }))
    };
  }
}

module.exports = new EventCorrelationService();
