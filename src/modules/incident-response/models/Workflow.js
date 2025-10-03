/**
 * Workflow Model
 * Model for incident response workflows
 */

const { v4: uuidv4 } = require('uuid');

// Workflow status enum
const WorkflowStatus = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  PAUSED: 'paused',
  CANCELLED: 'cancelled'
};

// Task status enum
const TaskStatus = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  SKIPPED: 'skipped',
  REQUIRES_APPROVAL: 'requires_approval'
};

/**
 * Workflow class for automated response workflows
 */
class Workflow {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.name = data.name || '';
    this.description = data.description || '';
    this.incident_id = data.incident_id || null;
    this.status = data.status || WorkflowStatus.PENDING;
    this.tasks = data.tasks || [];
    this.current_task_index = data.current_task_index || 0;
    this.started_at = data.started_at || null;
    this.completed_at = data.completed_at || null;
    this.triggered_by = data.triggered_by || null;
    this.trigger_condition = data.trigger_condition || null;
    this.execution_log = data.execution_log || [];
    this.metadata = data.metadata || {};
    this.created_at = data.created_at || new Date();
    this.updated_at = data.updated_at || new Date();
  }

  /**
   * Add task to workflow
   */
  addTask(task) {
    this.tasks.push({
      id: uuidv4(),
      name: task.name,
      action: task.action,
      parameters: task.parameters || {},
      status: TaskStatus.PENDING,
      requires_approval: task.requires_approval || false,
      timeout: task.timeout || 300000, // 5 minutes default
      retry_count: task.retry_count || 0,
      max_retries: task.max_retries || 3,
      started_at: null,
      completed_at: null,
      result: null,
      error: null
    });
  }

  /**
   * Log execution event
   */
  logEvent(level, message, data = {}) {
    this.execution_log.push({
      timestamp: new Date(),
      level,
      message,
      data
    });
  }

  /**
   * Get current task
   */
  getCurrentTask() {
    return this.tasks[this.current_task_index] || null;
  }

  /**
   * Move to next task
   */
  nextTask() {
    this.current_task_index++;
    return this.getCurrentTask();
  }

  /**
   * Calculate execution time
   */
  getExecutionTime() {
    if (this.started_at && this.completed_at) {
      return new Date(this.completed_at) - new Date(this.started_at);
    }
    return null;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      incident_id: this.incident_id,
      status: this.status,
      tasks: this.tasks,
      current_task_index: this.current_task_index,
      started_at: this.started_at,
      completed_at: this.completed_at,
      triggered_by: this.triggered_by,
      trigger_condition: this.trigger_condition,
      execution_log: this.execution_log,
      metadata: this.metadata,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = {
  Workflow,
  WorkflowStatus,
  TaskStatus
};
