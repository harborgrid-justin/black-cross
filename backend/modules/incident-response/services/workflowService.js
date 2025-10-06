/**
 * Workflow Service
 * Response workflow automation and playbook execution
 */

const Workflow = require('../models/Workflow');
const Incident = require('../models/Incident');
const logger = require('../utils/logger');

class WorkflowService {
  /**
   * Create a new workflow
   */
  async createWorkflow(workflowData) {
    try {
      const workflow = new Workflow(workflowData);
      await workflow.save();
      logger.info(`Workflow created: ${workflow.name}`);
      return workflow;
    } catch (error) {
      logger.error('Error creating workflow:', error);
      throw error;
    }
  }

  /**
   * Get workflow by ID
   */
  async getWorkflow(workflowId) {
    try {
      const workflow = await Workflow.findOne({ id: workflowId });
      if (!workflow) {
        throw new Error('Workflow not found');
      }
      return workflow;
    } catch (error) {
      logger.error('Error fetching workflow:', error);
      throw error;
    }
  }

  /**
   * List all workflows
   */
  async listWorkflows(filters = {}) {
    try {
      const query = {};
      if (filters.category) query.category = filters.category;
      if (filters.is_active !== undefined) query.is_active = filters.is_active;

      const workflows = await Workflow.find(query).sort({ name: 1 });
      return workflows;
    } catch (error) {
      logger.error('Error listing workflows:', error);
      throw error;
    }
  }

  /**
   * Execute workflow for an incident
   */
  async executeWorkflow(incidentId, workflowId, userId) {
    try {
      const incident = await Incident.findOne({ $or: [{ id: incidentId }, { ticket_number: incidentId }] });
      if (!incident) {
        throw new Error('Incident not found');
      }

      const workflow = await this.getWorkflow(workflowId);
      if (!workflow.is_active) {
        throw new Error('Workflow is not active');
      }

      const startTime = Date.now();
      const executionResults = [];

      logger.info(`Executing workflow ${workflow.name} for incident ${incident.ticket_number}`);

      // Execute actions based on workflow configuration
      if (workflow.parallel_execution) {
        // Execute all actions in parallel
        const promises = workflow.actions.map((action) => this._executeAction(incident, action, userId));
        const results = await Promise.allSettled(promises);
        executionResults.push(...results.map((r, i) => ({
          action: workflow.actions[i].name,
          status: r.status === 'fulfilled' ? 'success' : 'failed',
          result: r.status === 'fulfilled' ? r.value : r.reason?.message,
        })));
      } else {
        // Execute actions sequentially
        for (const action of workflow.actions.sort((a, b) => a.order - b.order)) {
          try {
            const result = await this._executeAction(incident, action, userId);
            executionResults.push({
              action: action.name,
              status: 'success',
              result,
            });

            // Handle conditional logic
            if (action.conditional_logic?.enabled) {
              const condition = this._evaluateCondition(incident, action.conditional_logic.condition);
              const nextActionId = condition
                ? action.conditional_logic.on_true
                : action.conditional_logic.on_false;

              if (nextActionId) {
                // Find and execute next action
                const nextAction = workflow.actions.find((a) => a.action_id === nextActionId);
                if (nextAction) {
                  const nextResult = await this._executeAction(incident, nextAction, userId);
                  executionResults.push({
                    action: nextAction.name,
                    status: 'success',
                    result: nextResult,
                  });
                }
              }
            }
          } catch (error) {
            executionResults.push({
              action: action.name,
              status: 'failed',
              error: error.message,
            });

            if (!action.retry_on_failure) {
              break; // Stop execution on failure if no retry
            }
          }
        }
      }

      const executionTime = (Date.now() - startTime) / 1000;

      // Update workflow statistics
      workflow.execution_count += 1;
      const successCount = executionResults.filter((r) => r.status === 'success').length;
      if (successCount === executionResults.length) {
        workflow.success_count += 1;
      } else {
        workflow.failure_count += 1;
      }
      workflow.average_execution_time = workflow.average_execution_time
        ? (workflow.average_execution_time + executionTime) / 2
        : executionTime;
      await workflow.save();

      // Update incident
      incident.timeline.push({
        event_type: 'workflow_executed',
        description: `Workflow '${workflow.name}' executed`,
        user_id: userId,
        metadata: {
          workflow_id: workflow.id,
          execution_time: executionTime,
          results: executionResults,
        },
      });
      await incident.save();

      logger.info(`Workflow execution completed for ${incident.ticket_number} in ${executionTime}s`);

      return {
        workflow_id: workflow.id,
        workflow_name: workflow.name,
        incident_id: incident.id,
        execution_time: executionTime,
        results: executionResults,
      };
    } catch (error) {
      logger.error('Error executing workflow:', error);
      throw error;
    }
  }

  /**
   * Execute a single action
   *
   * Supported Action Types:
   * - isolate_asset: Isolate compromised asset from network
   * - block_ip: Block malicious IP address in firewall
   * - block_domain: Block malicious domain
   * - disable_account: Disable compromised user account
   * - send_notification: Send alert notifications to team
   * - collect_logs: Collect forensic logs from affected systems
   * - escalate: Escalate incident to higher tier support
   *
   * @param {Object} incident - Incident object
   * @param {Object} action - Action configuration
   * @param {string} userId - User executing the action
   * @returns {Promise<Object>} Action execution result
   *
   * Note: To add new action types, extend the switch statement below
   * and implement the corresponding handler method (e.g., _myNewAction)
   */
  async _executeAction(incident, action, _userId) {
    logger.info(`Executing action: ${action.action_type} - ${action.name}`);

    // Check if approval is required
    if (action.approval_required) {
      return {
        status: 'pending_approval',
        message: `Action requires approval from ${action.approval_role}`,
      };
    }

    // Simulate action execution based on type
    switch (action.action_type) {
      case 'isolate_asset':
        return this._isolateAsset(incident, action.parameters);
      case 'block_ip':
        return this._blockIP(action.parameters);
      case 'block_domain':
        return this._blockDomain(action.parameters);
      case 'disable_account':
        return this._disableAccount(action.parameters);
      case 'send_notification':
        return this._sendNotification(incident, action.parameters);
      case 'collect_logs':
        return this._collectLogs(incident, action.parameters);
      case 'escalate':
        return this._escalateIncident(incident, action.parameters);
      default:
        logger.warn(`Unknown action type: ${action.action_type}`);
        return { status: 'skipped', message: 'Action type not implemented' };
    }
  }

  /**
   * Action implementations (simulated)
   */
  async _isolateAsset(incident, params) {
    logger.info(`Isolating asset: ${params.asset_id}`);
    incident.response_actions.push({
      action_type: 'isolate_asset',
      description: `Asset ${params.asset_id} isolated from network`,
      status: 'completed',
      executed_at: new Date(),
    });
    await incident.save();
    return { status: 'success', asset_id: params.asset_id };
  }

  async _blockIP(params) {
    logger.info(`Blocking IP: ${params.ip_address}`);
    return { status: 'success', ip_address: params.ip_address };
  }

  async _blockDomain(params) {
    logger.info(`Blocking domain: ${params.domain}`);
    return { status: 'success', domain: params.domain };
  }

  async _disableAccount(params) {
    logger.info(`Disabling account: ${params.username}`);
    return { status: 'success', username: params.username };
  }

  async _sendNotification(incident, params) {
    logger.info(`Sending notification to: ${params.recipient}`);
    incident.communications.push({
      channel: params.channel || 'email',
      recipient: params.recipient,
      message: params.message || `Incident ${incident.ticket_number} requires attention`,
      sent_at: new Date(),
    });
    await incident.save();
    return { status: 'success', recipient: params.recipient };
  }

  async _collectLogs(incident, params) {
    logger.info(`Collecting logs from: ${params.source}`);
    return { status: 'success', source: params.source };
  }

  async _escalateIncident(incident, params) {
    logger.info(`Escalating incident to: ${params.escalation_level}`);
    incident.priority = 'critical';
    incident.timeline.push({
      event_type: 'escalated',
      description: `Escalated to ${params.escalation_level}`,
    });
    await incident.save();
    return { status: 'success', escalation_level: params.escalation_level };
  }

  /**
   * Evaluate conditional logic
   */
  _evaluateCondition(incident, condition) {
    try {
      // Simple condition evaluation (can be extended)
      // Example: "severity == 'critical'"
      const [field, operator, value] = condition.split(/\s+/);
      const actualValue = incident[field.trim()];
      const expectedValue = value.replace(/['"]/g, '').trim();

      switch (operator) {
        case '==':
        case '===':
          return actualValue === expectedValue;
        case '!=':
        case '!==':
          return actualValue !== expectedValue;
        case '>':
          return actualValue > expectedValue;
        case '<':
          return actualValue < expectedValue;
        default:
          return false;
      }
    } catch (error) {
      logger.error('Error evaluating condition:', error);
      return false;
    }
  }

  /**
   * Auto-trigger workflows for an incident
   */
  async autoTriggerWorkflows(incident) {
    try {
      const workflows = await Workflow.find({
        is_active: true,
        'trigger_conditions.auto_trigger': true,
      });

      const matchingWorkflows = workflows.filter(
        (workflow) => this._matchesTriggerConditions(incident, workflow.trigger_conditions),
      );

      logger.info(`Found ${matchingWorkflows.length} auto-trigger workflows for incident ${incident.ticket_number}`);

      const results = [];
      for (const workflow of matchingWorkflows) {
        try {
          const result = await this.executeWorkflow(incident.id, workflow.id, 'system');
          results.push(result);
        } catch (error) {
          logger.error(`Error auto-triggering workflow ${workflow.name}:`, error);
        }
      }

      return results;
    } catch (error) {
      logger.error('Error auto-triggering workflows:', error);
      throw error;
    }
  }

  /**
   * Check if incident matches trigger conditions
   */
  _matchesTriggerConditions(incident, conditions) {
    if (conditions.severity && conditions.severity.length > 0) {
      if (!conditions.severity.includes(incident.severity)) {
        return false;
      }
    }
    if (conditions.category && conditions.category.length > 0) {
      if (!conditions.category.includes(incident.category)) {
        return false;
      }
    }
    if (conditions.priority && conditions.priority.length > 0) {
      if (!conditions.priority.includes(incident.priority)) {
        return false;
      }
    }
    return true;
  }
}

module.exports = new WorkflowService();
