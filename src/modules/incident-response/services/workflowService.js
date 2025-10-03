/**
 * Workflow Service
 * Automated response workflow execution
 */

const { Workflow, WorkflowStatus, TaskStatus } = require('../models');
const dataStore = require('./dataStore');
const timelineService = require('./timelineService');
const { EventType } = require('../models');

class WorkflowService {
  /**
   * Create new workflow
   */
  async createWorkflow(data) {
    const workflow = new Workflow(data);
    return await dataStore.createWorkflow(workflow);
  }

  /**
   * Get workflow by ID
   */
  async getWorkflow(id) {
    return await dataStore.getWorkflow(id);
  }

  /**
   * Execute workflow for an incident
   */
  async executeWorkflow(incidentId, workflowId, userId = null) {
    const workflow = await dataStore.getWorkflow(workflowId);
    if (!workflow) {
      throw new Error('Workflow not found');
    }

    // Set workflow to running state
    workflow.incident_id = incidentId;
    workflow.status = WorkflowStatus.RUNNING;
    workflow.started_at = new Date();
    workflow.triggered_by = userId;
    workflow.logEvent('info', 'Workflow execution started');

    await dataStore.updateWorkflow(workflowId, workflow);

    // Create timeline event
    await timelineService.createEvent({
      incident_id: incidentId,
      type: EventType.WORKFLOW_EXECUTED,
      title: 'Workflow Started',
      description: `Workflow ${workflow.name} execution started`,
      user_id: userId,
      metadata: {
        workflow_id: workflowId,
        workflow_name: workflow.name
      }
    });

    // Execute tasks sequentially
    try {
      await this.executeTasks(workflow);
      
      workflow.status = WorkflowStatus.COMPLETED;
      workflow.completed_at = new Date();
      workflow.logEvent('info', 'Workflow execution completed successfully');
    } catch (error) {
      workflow.status = WorkflowStatus.FAILED;
      workflow.logEvent('error', 'Workflow execution failed', { error: error.message });
      throw error;
    } finally {
      await dataStore.updateWorkflow(workflowId, workflow);
    }

    return workflow;
  }

  /**
   * Execute workflow tasks
   */
  async executeTasks(workflow) {
    for (let i = 0; i < workflow.tasks.length; i++) {
      const task = workflow.tasks[i];
      
      if (task.status === TaskStatus.SKIPPED) {
        continue;
      }

      // Check if task requires approval
      if (task.requires_approval && task.status === TaskStatus.REQUIRES_APPROVAL) {
        workflow.status = WorkflowStatus.PAUSED;
        workflow.logEvent('info', `Task ${task.name} requires approval`, { task_id: task.id });
        await dataStore.updateWorkflow(workflow.id, workflow);
        break;
      }

      // Execute task
      try {
        task.status = TaskStatus.RUNNING;
        task.started_at = new Date();
        workflow.logEvent('info', `Executing task: ${task.name}`, { task_id: task.id });

        await this.executeTask(task);

        task.status = TaskStatus.COMPLETED;
        task.completed_at = new Date();
        workflow.logEvent('info', `Task completed: ${task.name}`, { task_id: task.id });
      } catch (error) {
        task.status = TaskStatus.FAILED;
        task.error = error.message;
        workflow.logEvent('error', `Task failed: ${task.name}`, { 
          task_id: task.id, 
          error: error.message 
        });

        // Retry logic
        if (task.retry_count < task.max_retries) {
          task.retry_count++;
          task.status = TaskStatus.PENDING;
          workflow.logEvent('info', `Retrying task: ${task.name}`, { 
            task_id: task.id, 
            retry_count: task.retry_count 
          });
          i--; // Retry the same task
        } else {
          throw error; // Fail workflow if max retries exceeded
        }
      }

      workflow.current_task_index = i;
      await dataStore.updateWorkflow(workflow.id, workflow);
    }
  }

  /**
   * Execute individual task
   */
  async executeTask(task) {
    // Simulate task execution
    // In production, this would integrate with actual tools and systems
    
    switch (task.action) {
      case 'isolate_host':
        await this.isolateHost(task.parameters);
        break;
      case 'block_ip':
        await this.blockIP(task.parameters);
        break;
      case 'quarantine_file':
        await this.quarantineFile(task.parameters);
        break;
      case 'send_notification':
        await this.sendNotification(task.parameters);
        break;
      case 'collect_evidence':
        await this.collectEvidence(task.parameters);
        break;
      case 'update_firewall':
        await this.updateFirewall(task.parameters);
        break;
      default:
        task.result = { success: true, message: 'Task executed successfully' };
    }

    return task;
  }

  /**
   * Task action handlers (simulated)
   */
  async isolateHost(params) {
    // Simulate host isolation
    await this.delay(1000);
    return { success: true, host: params.hostname, action: 'isolated' };
  }

  async blockIP(params) {
    // Simulate IP blocking
    await this.delay(500);
    return { success: true, ip: params.ip_address, action: 'blocked' };
  }

  async quarantineFile(params) {
    // Simulate file quarantine
    await this.delay(800);
    return { success: true, file: params.file_path, action: 'quarantined' };
  }

  async sendNotification(params) {
    // Simulate notification
    await this.delay(300);
    return { success: true, recipients: params.recipients, action: 'notified' };
  }

  async collectEvidence(params) {
    // Simulate evidence collection
    await this.delay(1500);
    return { success: true, evidence_type: params.type, action: 'collected' };
  }

  async updateFirewall(params) {
    // Simulate firewall update
    await this.delay(1000);
    return { success: true, rule: params.rule, action: 'updated' };
  }

  /**
   * Pause workflow execution
   */
  async pauseWorkflow(workflowId) {
    const workflow = await dataStore.getWorkflow(workflowId);
    if (!workflow) {
      throw new Error('Workflow not found');
    }

    workflow.status = WorkflowStatus.PAUSED;
    workflow.logEvent('info', 'Workflow paused');
    
    return await dataStore.updateWorkflow(workflowId, workflow);
  }

  /**
   * Resume workflow execution
   */
  async resumeWorkflow(workflowId) {
    const workflow = await dataStore.getWorkflow(workflowId);
    if (!workflow) {
      throw new Error('Workflow not found');
    }

    if (workflow.status !== WorkflowStatus.PAUSED) {
      throw new Error('Workflow is not paused');
    }

    workflow.status = WorkflowStatus.RUNNING;
    workflow.logEvent('info', 'Workflow resumed');
    
    await dataStore.updateWorkflow(workflowId, workflow);

    // Continue execution
    await this.executeTasks(workflow);

    return workflow;
  }

  /**
   * Cancel workflow execution
   */
  async cancelWorkflow(workflowId) {
    const workflow = await dataStore.getWorkflow(workflowId);
    if (!workflow) {
      throw new Error('Workflow not found');
    }

    workflow.status = WorkflowStatus.CANCELLED;
    workflow.completed_at = new Date();
    workflow.logEvent('info', 'Workflow cancelled');
    
    return await dataStore.updateWorkflow(workflowId, workflow);
  }

  /**
   * List available workflow templates
   */
  async listTemplates() {
    return [
      {
        id: 'malware-response',
        name: 'Malware Response',
        description: 'Automated malware incident response',
        tasks: ['isolate_host', 'quarantine_file', 'collect_evidence', 'send_notification']
      },
      {
        id: 'phishing-response',
        name: 'Phishing Response',
        description: 'Automated phishing incident response',
        tasks: ['block_sender', 'quarantine_email', 'notify_users', 'collect_evidence']
      },
      {
        id: 'ddos-mitigation',
        name: 'DDoS Mitigation',
        description: 'Automated DDoS response',
        tasks: ['block_ip', 'update_firewall', 'enable_rate_limiting', 'send_notification']
      }
    ];
  }

  /**
   * Helper delay function
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new WorkflowService();
