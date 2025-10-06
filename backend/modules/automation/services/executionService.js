/**
 * Automated Action Execution Service
 * Handles playbook execution (Sub-Feature 15.3)
 */

const Playbook = require('../models/Playbook');
const PlaybookExecution = require('../models/PlaybookExecution');
const actionExecutor = require('../utils/actionExecutor');
const logger = require('../utils/logger');

class ExecutionService {
  /**
   * Execute playbook
   * @param {string} playbookId - Playbook ID
   * @param {Object} executionData - Execution data
   * @returns {Promise<Object>} Execution result
   */
  async executePlaybook(playbookId, executionData) {
    try {
      logger.info('Starting playbook execution', {
        playbook_id: playbookId,
        mode: executionData.execution_mode,
      });

      const playbook = await Playbook.findOne({ id: playbookId });

      if (!playbook) {
        throw new Error('Playbook not found');
      }

      if (playbook.status !== 'active' && executionData.execution_mode === 'live') {
        throw new Error('Playbook is not active');
      }

      // Create execution record
      const execution = new PlaybookExecution({
        playbook_id: playbookId,
        playbook_name: playbook.name,
        playbook_version: playbook.version,
        triggered_by: executionData.triggered_by,
        execution_mode: executionData.execution_mode || 'live',
        status: 'running',
        total_actions: playbook.actions.length,
        incident_id: executionData.incident_id,
        alert_id: executionData.alert_id,
        metadata: executionData.metadata,
      });

      await execution.save();

      // Check if approval is required
      if (playbook.approvals_required && executionData.execution_mode === 'live') {
        execution.status = 'awaiting_approval';
        execution.approval_status = {
          required: true,
        };
        await execution.save();

        logger.info('Playbook awaiting approval', { execution_id: execution.id });
        return execution;
      }

      // Execute actions
      await this.executeActions(playbook, execution, executionData.variables || {});

      return execution;
    } catch (error) {
      logger.error('Error executing playbook', { error: error.message });
      throw error;
    }
  }

  /**
   * Execute playbook actions
   * @param {Object} playbook - Playbook object
   * @param {Object} execution - Execution object
   * @param {Object} variables - Execution variables
   */
  async executeActions(playbook, execution, variables = {}) {
    try {
      const context = {
        execution_mode: execution.execution_mode,
        playbook_id: playbook.id,
        execution_id: execution.id,
        ...variables,
      };

      const sortedActions = playbook.actions.sort((a, b) => a.order - b.order);

      for (const action of sortedActions) {
        // Check if action should be executed based on condition
        if (action.condition && !actionExecutor.evaluateCondition(action.condition, context)) {
          logger.info('Action skipped due to condition', { action_id: action.id });

          execution.actions_executed.push({
            action_id: action.id,
            action_name: action.name,
            action_type: action.type,
            status: 'skipped',
            start_time: new Date(),
            end_time: new Date(),
            duration: 0,
          });
          // eslint-disable-next-line no-plusplus
          execution.skipped_actions++;
          // eslint-disable-next-line no-continue
          continue;
        }

        // Execute action
        const actionResult = await this.executeActionWithRetry(action, context);

        // Record action execution
        execution.actions_executed.push({
          action_id: action.id,
          action_name: action.name,
          action_type: action.type,
          status: actionResult.success ? 'completed' : 'failed',
          start_time: new Date(Date.now() - actionResult.duration),
          end_time: new Date(),
          duration: actionResult.duration,
          output: actionResult.output,
          error: actionResult.error,
          retry_count: actionResult.retry_count || 0,
        });

        if (actionResult.success) {
          // eslint-disable-next-line no-plusplus
          execution.successful_actions++;

          // Update context with action output
          if (actionResult.output) {
            context[`action_${action.id}_output`] = actionResult.output;
          }
        } else {
          // eslint-disable-next-line no-plusplus
          execution.failed_actions++;
          execution.errors.push({
            action_id: action.id,
            error_message: actionResult.error,
            timestamp: new Date(),
          });

          // Handle error based on action configuration
          if (action.on_error === 'fail') {
            logger.error('Action failed, stopping execution', {
              action_id: action.id,
              error: actionResult.error,
            });
            break;
          } else if (action.on_error === 'skip') {
            logger.warn('Action failed, skipping remaining actions', {
              action_id: action.id,
            });
            break;
          }
          // Continue if on_error is 'continue'
        }

        await execution.save();
      }

      // Finalize execution
      execution.end_time = new Date();
      execution.status = execution.failed_actions > 0
                        && execution.successful_actions === 0 ? 'failed' : 'completed';

      await execution.save();

      // Update playbook statistics
      await this.updatePlaybookStats(playbook, execution);

      logger.info('Playbook execution completed', {
        execution_id: execution.id,
        status: execution.status,
        successful: execution.successful_actions,
        failed: execution.failed_actions,
      });
    } catch (error) {
      execution.status = 'failed';
      execution.end_time = new Date();
      execution.errors.push({
        error_message: error.message,
        timestamp: new Date(),
      });
      await execution.save();

      logger.error('Error in action execution', { error: error.message });
      throw error;
    }
  }

  /**
   * Execute action with retry logic
   * @param {Object} action - Action to execute
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Action result
   */
  async executeActionWithRetry(action, context) {
    let retryCount = 0;
    const maxRetries = action.retry?.enabled ? action.retry.max_attempts : 1;

    while (retryCount < maxRetries) {
      const result = await actionExecutor.executeAction(action, context);

      if (result.success) {
        return { ...result, retry_count: retryCount };
      }

      // eslint-disable-next-line no-plusplus
      retryCount++;

      if (retryCount < maxRetries) {
        const delay = action.retry?.delay || 5;
        logger.info('Retrying action', {
          action_id: action.id,
          attempt: retryCount + 1,
          delay,
        });
        // eslint-disable-next-line no-promise-executor-return
        await new Promise((resolve) => setTimeout(resolve, delay * 1000));
      }
    }

    // All retries failed
    return {
      success: false,
      error: 'Action failed after all retry attempts',
      retry_count: retryCount,
    };
  }

  /**
   * Get execution details
   * @param {string} executionId - Execution ID
   * @returns {Promise<Object>} Execution details
   */
  async getExecution(executionId) {
    try {
      logger.info('Fetching execution', { execution_id: executionId });

      const execution = await PlaybookExecution.findOne({ id: executionId }).select('-__v');

      if (!execution) {
        throw new Error('Execution not found');
      }

      return execution;
    } catch (error) {
      logger.error('Error fetching execution', { error: error.message });
      throw error;
    }
  }

  /**
   * List executions
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Array>} Executions
   */
  async listExecutions(filters = {}) {
    try {
      logger.info('Listing executions', filters);

      const query = {};

      if (filters.playbook_id) {
        query.playbook_id = filters.playbook_id;
      }

      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.execution_mode) {
        query.execution_mode = filters.execution_mode;
      }

      if (filters.from_date) {
        query.start_time = { $gte: new Date(filters.from_date) };
      }

      const executions = await PlaybookExecution.find(query)
        .sort({ start_time: -1 })
        .limit(filters.limit || 100)
        .select('-__v -actions_executed.output');

      logger.info('Executions retrieved', { count: executions.length });

      return executions;
    } catch (error) {
      logger.error('Error listing executions', { error: error.message });
      throw error;
    }
  }

  /**
   * Cancel execution
   * @param {string} executionId - Execution ID
   * @returns {Promise<Object>} Cancellation result
   */
  async cancelExecution(executionId) {
    try {
      logger.info('Cancelling execution', { execution_id: executionId });

      const execution = await PlaybookExecution.findOne({ id: executionId });

      if (!execution) {
        throw new Error('Execution not found');
      }

      if (execution.status !== 'running' && execution.status !== 'queued') {
        throw new Error('Cannot cancel execution that is not running or queued');
      }

      execution.status = 'cancelled';
      execution.end_time = new Date();
      await execution.save();

      logger.info('Execution cancelled', { execution_id: executionId });

      return execution;
    } catch (error) {
      logger.error('Error cancelling execution', { error: error.message });
      throw error;
    }
  }

  /**
   * Approve execution
   * @param {string} executionId - Execution ID
   * @param {Object} approvalData - Approval data
   * @returns {Promise<Object>} Execution result
   */
  async approveExecution(executionId, approvalData) {
    try {
      logger.info('Approving execution', { execution_id: executionId });

      const execution = await PlaybookExecution.findOne({ id: executionId });

      if (!execution) {
        throw new Error('Execution not found');
      }

      if (execution.status !== 'awaiting_approval') {
        throw new Error('Execution is not awaiting approval');
      }

      execution.approval_status.approved_by = approvalData.approved_by;
      execution.approval_status.approved_at = new Date();
      execution.status = 'running';
      await execution.save();

      // Get playbook and continue execution
      const playbook = await Playbook.findOne({ id: execution.playbook_id });
      await this.executeActions(playbook, execution, approvalData.variables || {});

      logger.info('Execution approved and resumed', { execution_id: executionId });

      return execution;
    } catch (error) {
      logger.error('Error approving execution', { error: error.message });
      throw error;
    }
  }

  /**
   * Update playbook statistics
   * @param {Object} playbook - Playbook object
   * @param {Object} execution - Execution object
   */
  async updatePlaybookStats(playbook, execution) {
    try {
      // eslint-disable-next-line no-plusplus
      playbook.execution_count++;

      if (execution.status === 'completed') {
        // eslint-disable-next-line no-plusplus
        playbook.success_count++;
      } else if (execution.status === 'failed') {
        // eslint-disable-next-line no-plusplus
        playbook.failure_count++;
      }

      // Update average execution time
      if (execution.duration) {
        const totalTime = playbook.average_execution_time * (playbook.execution_count - 1);
        playbook.average_execution_time = Math.round(
          (totalTime + execution.duration) / playbook.execution_count,
        );
      }

      playbook.last_executed_at = execution.start_time;

      await playbook.save();
    } catch (error) {
      logger.error('Error updating playbook stats', { error: error.message });
    }
  }
}

module.exports = new ExecutionService();
