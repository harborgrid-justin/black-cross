/**
 * Case Management - Service Layer
 * Business logic for case management and workflow
 */

import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from 'events';
import {
  Case,
  CaseTask,
  CaseComment,
  CaseAttachment,
  CaseTimelineEvent,
  CaseTemplate,
  CaseMetrics,
  CreateCaseRequest,
  UpdateCaseRequest,
  CreateTaskRequest,
  UpdateTaskRequest,
  CreateCommentRequest,
  CreateTemplateRequest,
  CaseFilters,
  CaseStatus,
  CasePriority,
  CaseCategory,
  TaskStatus,
  CommentType,
} from './types';

/**
 * Case management service
 */
class CaseManagementService extends EventEmitter {
  private cases: Map<string, Case> = new Map();
  private tasks: Map<string, CaseTask> = new Map();
  private comments: Map<string, CaseComment> = new Map();
  private attachments: Map<string, CaseAttachment> = new Map();
  private timeline: Map<string, CaseTimelineEvent> = new Map();
  private templates: Map<string, CaseTemplate> = new Map();

  /**
   * Create a new case
   */
  async createCase(request: CreateCaseRequest, userId: string): Promise<Case> {
    const caseData: Case = {
      id: uuidv4(),
      title: request.title,
      description: request.description,
      status: CaseStatus.OPEN,
      priority: request.priority,
      category: request.category,
      assignee_id: request.assignee_id,
      created_by: userId,
      tags: request.tags || [],
      due_date: request.due_date,
      metadata: request.metadata || {},
      created_at: new Date(),
      updated_at: new Date(),
    };

    this.cases.set(caseData.id, caseData);

    // Add timeline event
    await this.addTimelineEvent(caseData.id, 'case_created', {
      created_by: userId,
      priority: request.priority,
      category: request.category,
    }, userId);

    // If template is provided, create default tasks
    if (request.template_id) {
      const template = this.templates.get(request.template_id);
      if (template && template.default_tasks) {
        for (const taskTemplate of template.default_tasks) {
          await this.createTask(caseData.id, {
            title: taskTemplate.title,
            description: taskTemplate.description,
          }, userId);
        }
      }
    }

    this.emit('case:created', caseData);
    return caseData;
  }

  /**
   * Get case by ID
   */
  async getCase(caseId: string): Promise<Case | null> {
    return this.cases.get(caseId) || null;
  }

  /**
   * Get all cases with filters
   */
  async getCases(filters?: CaseFilters): Promise<Case[]> {
    let cases = Array.from(this.cases.values());

    if (filters) {
      if (filters.status) {
        cases = cases.filter((c) => c.status === filters.status);
      }

      if (filters.priority) {
        cases = cases.filter((c) => c.priority === filters.priority);
      }

      if (filters.category) {
        cases = cases.filter((c) => c.category === filters.category);
      }

      if (filters.assignee_id) {
        cases = cases.filter((c) => c.assignee_id === filters.assignee_id);
      }

      if (filters.created_by) {
        cases = cases.filter((c) => c.created_by === filters.created_by);
      }

      if (filters.tags && filters.tags.length > 0) {
        cases = cases.filter((c) =>
          filters.tags!.some((tag) => c.tags.includes(tag))
        );
      }

      if (filters.overdue) {
        const now = new Date();
        cases = cases.filter((c) =>
          c.due_date && c.due_date < now && c.status !== CaseStatus.CLOSED
        );
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        cases = cases.filter((c) =>
          c.title.toLowerCase().includes(searchLower) ||
          c.description.toLowerCase().includes(searchLower)
        );
      }
    }

    // Sort by created_at descending
    cases.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());

    return cases;
  }

  /**
   * Update case
   */
  async updateCase(
    caseId: string,
    updates: UpdateCaseRequest,
    userId: string
  ): Promise<Case> {
    const caseData = this.cases.get(caseId);

    if (!caseData) {
      throw new Error('Case not found');
    }

    const oldStatus = caseData.status;

    Object.assign(caseData, updates, { updated_at: new Date() });

    // Handle status transitions
    if (updates.status && updates.status !== oldStatus) {
      if (updates.status === CaseStatus.RESOLVED) {
        caseData.resolved_at = new Date();
      }

      if (updates.status === CaseStatus.CLOSED) {
        caseData.closed_at = new Date();
      }

      // Add timeline event
      await this.addTimelineEvent(caseId, 'status_changed', {
        from: oldStatus,
        to: updates.status,
      }, userId);
    }

    this.cases.set(caseId, caseData);
    this.emit('case:updated', caseData);

    return caseData;
  }

  /**
   * Delete case
   */
  async deleteCase(caseId: string): Promise<void> {
    const caseData = this.cases.get(caseId);

    if (!caseData) {
      throw new Error('Case not found');
    }

    // Delete associated data
    const caseTasks = Array.from(this.tasks.values()).filter((t) => t.case_id === caseId);
    caseTasks.forEach((task) => this.tasks.delete(task.id));

    const caseComments = Array.from(this.comments.values()).filter((c) => c.case_id === caseId);
    caseComments.forEach((comment) => this.comments.delete(comment.id));

    const caseAttachments = Array.from(this.attachments.values()).filter((a) => a.case_id === caseId);
    caseAttachments.forEach((attachment) => this.attachments.delete(attachment.id));

    const caseTimeline = Array.from(this.timeline.values()).filter((t) => t.case_id === caseId);
    caseTimeline.forEach((event) => this.timeline.delete(event.id));

    this.cases.delete(caseId);
    this.emit('case:deleted', { caseId });
  }

  /**
   * Create a task for a case
   */
  async createTask(
    caseId: string,
    request: CreateTaskRequest,
    userId: string
  ): Promise<CaseTask> {
    const caseData = this.cases.get(caseId);

    if (!caseData) {
      throw new Error('Case not found');
    }

    const caseTasks = Array.from(this.tasks.values()).filter((t) => t.case_id === caseId);
    const maxOrder = caseTasks.length > 0 ? Math.max(...caseTasks.map((t) => t.order)) : 0;

    const task: CaseTask = {
      id: uuidv4(),
      case_id: caseId,
      title: request.title,
      description: request.description,
      status: TaskStatus.TODO,
      assignee_id: request.assignee_id,
      due_date: request.due_date,
      order: maxOrder + 1,
      created_at: new Date(),
      updated_at: new Date(),
    };

    this.tasks.set(task.id, task);

    await this.addTimelineEvent(caseId, 'task_created', {
      task_id: task.id,
      task_title: task.title,
    }, userId);

    this.emit('task:created', task);
    return task;
  }

  /**
   * Get tasks for a case
   */
  async getCaseTasks(caseId: string): Promise<CaseTask[]> {
    const tasks = Array.from(this.tasks.values())
      .filter((t) => t.case_id === caseId)
      .sort((a, b) => a.order - b.order);

    return tasks;
  }

  /**
   * Update task
   */
  async updateTask(
    taskId: string,
    updates: UpdateTaskRequest,
    userId: string
  ): Promise<CaseTask> {
    const task = this.tasks.get(taskId);

    if (!task) {
      throw new Error('Task not found');
    }

    const oldStatus = task.status;

    Object.assign(task, updates, { updated_at: new Date() });

    if (updates.status === TaskStatus.COMPLETED) {
      task.completed_at = new Date();
    }

    this.tasks.set(taskId, task);

    if (updates.status && updates.status !== oldStatus) {
      await this.addTimelineEvent(task.case_id, 'task_status_changed', {
        task_id: taskId,
        task_title: task.title,
        from: oldStatus,
        to: updates.status,
      }, userId);
    }

    this.emit('task:updated', task);
    return task;
  }

  /**
   * Delete task
   */
  async deleteTask(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId);

    if (!task) {
      throw new Error('Task not found');
    }

    this.tasks.delete(taskId);
    this.emit('task:deleted', { taskId, caseId: task.case_id });
  }

  /**
   * Add comment to case
   */
  async addComment(
    caseId: string,
    request: CreateCommentRequest,
    userId: string
  ): Promise<CaseComment> {
    const caseData = this.cases.get(caseId);

    if (!caseData) {
      throw new Error('Case not found');
    }

    const comment: CaseComment = {
      id: uuidv4(),
      case_id: caseId,
      user_id: userId,
      type: request.type || CommentType.COMMENT,
      content: request.content,
      metadata: request.metadata,
      created_at: new Date(),
      updated_at: new Date(),
    };

    this.comments.set(comment.id, comment);

    await this.addTimelineEvent(caseId, 'comment_added', {
      comment_id: comment.id,
      comment_type: comment.type,
    }, userId);

    this.emit('comment:created', comment);
    return comment;
  }

  /**
   * Get comments for a case
   */
  async getCaseComments(caseId: string): Promise<CaseComment[]> {
    const comments = Array.from(this.comments.values())
      .filter((c) => c.case_id === caseId)
      .sort((a, b) => a.created_at.getTime() - b.created_at.getTime());

    return comments;
  }

  /**
   * Get case timeline
   */
  async getCaseTimeline(caseId: string): Promise<CaseTimelineEvent[]> {
    const events = Array.from(this.timeline.values())
      .filter((e) => e.case_id === caseId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return events;
  }

  /**
   * Create case template
   */
  async createTemplate(request: CreateTemplateRequest, userId: string): Promise<CaseTemplate> {
    const template: CaseTemplate = {
      id: uuidv4(),
      name: request.name,
      description: request.description,
      category: request.category,
      default_priority: request.default_priority,
      default_tasks: request.default_tasks || [],
      custom_fields: request.custom_fields || {},
      created_by: userId,
      created_at: new Date(),
      updated_at: new Date(),
    };

    this.templates.set(template.id, template);
    this.emit('template:created', template);

    return template;
  }

  /**
   * Get all templates
   */
  async getTemplates(): Promise<CaseTemplate[]> {
    return Array.from(this.templates.values());
  }

  /**
   * Get case metrics
   */
  async getMetrics(filters?: CaseFilters): Promise<CaseMetrics> {
    const cases = await this.getCases(filters);

    const metrics: CaseMetrics = {
      total: cases.length,
      by_status: {
        [CaseStatus.DRAFT]: 0,
        [CaseStatus.OPEN]: 0,
        [CaseStatus.IN_PROGRESS]: 0,
        [CaseStatus.PENDING_REVIEW]: 0,
        [CaseStatus.RESOLVED]: 0,
        [CaseStatus.CLOSED]: 0,
        [CaseStatus.ARCHIVED]: 0,
      },
      by_priority: {
        [CasePriority.LOW]: 0,
        [CasePriority.MEDIUM]: 0,
        [CasePriority.HIGH]: 0,
        [CasePriority.CRITICAL]: 0,
      },
      by_category: {
        [CaseCategory.SECURITY_INCIDENT]: 0,
        [CaseCategory.THREAT_INVESTIGATION]: 0,
        [CaseCategory.VULNERABILITY_REMEDIATION]: 0,
        [CaseCategory.COMPLIANCE_REVIEW]: 0,
        [CaseCategory.MALWARE_ANALYSIS]: 0,
        [CaseCategory.DATA_BREACH]: 0,
        [CaseCategory.PHISHING]: 0,
        [CaseCategory.OTHER]: 0,
      },
      avg_resolution_time: 0,
      overdue_count: 0,
    };

    const now = new Date();
    let totalResolutionTime = 0;
    let resolvedCount = 0;

    cases.forEach((c) => {
      metrics.by_status[c.status]++;
      metrics.by_priority[c.priority]++;
      metrics.by_category[c.category]++;

      if (c.due_date && c.due_date < now && c.status !== CaseStatus.CLOSED) {
        metrics.overdue_count++;
      }

      if (c.resolved_at) {
        const resolutionTime = c.resolved_at.getTime() - c.created_at.getTime();
        totalResolutionTime += resolutionTime;
        resolvedCount++;
      }
    });

    if (resolvedCount > 0) {
      metrics.avg_resolution_time = totalResolutionTime / resolvedCount / (1000 * 60 * 60); // Hours
    }

    return metrics;
  }

  /**
   * Helper: Add timeline event
   */
  private async addTimelineEvent(
    caseId: string,
    eventType: string,
    eventData: Record<string, any>,
    userId?: string
  ): Promise<CaseTimelineEvent> {
    const event: CaseTimelineEvent = {
      id: uuidv4(),
      case_id: caseId,
      event_type: eventType,
      event_data: eventData,
      user_id: userId,
      timestamp: new Date(),
    };

    this.timeline.set(event.id, event);
    return event;
  }
}

// Export singleton instance
export const caseManagementService = new CaseManagementService();
