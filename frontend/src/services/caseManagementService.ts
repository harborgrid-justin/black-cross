/**
 * @fileoverview Case Management API service.
 * 
 * Provides methods for managing security cases including tasks, comments,
 * templates, and metrics.
 * 
 * @module services/caseManagementService
 */

import { apiClient } from './api';
import type { ApiResponse, PaginatedResponse } from '@/types';

/**
 * Case status
 */
export enum CaseStatus {
  DRAFT = 'draft',
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  PENDING_REVIEW = 'pending_review',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
  ARCHIVED = 'archived',
}

/**
 * Case priority levels
 */
export enum CasePriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Case category types
 */
export enum CaseCategory {
  SECURITY_INCIDENT = 'security_incident',
  THREAT_INVESTIGATION = 'threat_investigation',
  VULNERABILITY_REMEDIATION = 'vulnerability_remediation',
  COMPLIANCE_REVIEW = 'compliance_review',
  MALWARE_ANALYSIS = 'malware_analysis',
  DATA_BREACH = 'data_breach',
  PHISHING = 'phishing',
  OTHER = 'other',
}

/**
 * Task status
 */
export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  BLOCKED = 'blocked',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

/**
 * Comment type
 */
export enum CommentType {
  COMMENT = 'comment',
  STATUS_CHANGE = 'status_change',
  ASSIGNMENT = 'assignment',
  ATTACHMENT = 'attachment',
  SYSTEM = 'system',
}

/**
 * Core case interface
 */
export interface Case {
  id: string;
  title: string;
  description: string;
  status: CaseStatus;
  priority: CasePriority;
  category: CaseCategory;
  assignee_id?: string;
  created_by: string;
  organization_id?: string;
  tags: string[];
  due_date?: string;
  resolved_at?: string;
  closed_at?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

/**
 * Case task
 */
export interface CaseTask {
  id: string;
  case_id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  assignee_id?: string;
  due_date?: string;
  completed_at?: string;
  order: number;
  created_at: string;
  updated_at: string;
}

/**
 * Case comment
 */
export interface CaseComment {
  id: string;
  case_id: string;
  user_id: string;
  type: CommentType;
  content: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

/**
 * Case timeline event
 */
export interface CaseTimelineEvent {
  id: string;
  case_id: string;
  event_type: string;
  event_data: Record<string, any>;
  user_id?: string;
  timestamp: string;
}

/**
 * Case template
 */
export interface CaseTemplate {
  id: string;
  name: string;
  description?: string;
  category: CaseCategory;
  default_priority: CasePriority;
  default_tasks: Array<{
    title: string;
    description?: string;
    order: number;
  }>;
  custom_fields: Record<string, any>;
  created_by: string;
  created_at: string;
  updated_at: string;
}

/**
 * Case metrics
 */
export interface CaseMetrics {
  total: number;
  by_status: Record<CaseStatus, number>;
  by_priority: Record<CasePriority, number>;
  by_category: Record<CaseCategory, number>;
  avg_resolution_time: number;
  overdue_count: number;
}

export interface CreateCaseRequest {
  title: string;
  description: string;
  priority: CasePriority;
  category: CaseCategory;
  assignee_id?: string;
  tags?: string[];
  due_date?: string;
  metadata?: Record<string, any>;
  template_id?: string;
}

export interface UpdateCaseRequest {
  title?: string;
  description?: string;
  status?: CaseStatus;
  priority?: CasePriority;
  category?: CaseCategory;
  assignee_id?: string;
  tags?: string[];
  due_date?: string;
  metadata?: Record<string, any>;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  assignee_id?: string;
  due_date?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  assignee_id?: string;
  due_date?: string;
}

export interface CreateCommentRequest {
  content: string;
  type?: CommentType;
  metadata?: Record<string, any>;
}

export interface CreateTemplateRequest {
  name: string;
  description?: string;
  category: CaseCategory;
  default_priority: CasePriority;
  default_tasks?: Array<{
    title: string;
    description?: string;
    order: number;
  }>;
  custom_fields?: Record<string, any>;
}

export interface CaseFilters {
  status?: CaseStatus;
  priority?: CasePriority;
  category?: CaseCategory;
  assignee_id?: string;
  created_by?: string;
  tags?: string[];
  overdue?: boolean;
  search?: string;
}

/**
 * Service for handling case management API operations.
 * 
 * @namespace caseManagementService
 */
export const caseManagementService = {
  /**
   * Creates a new case.
   * 
   * @async
   * @param {CreateCaseRequest} data - Case data
   * @returns {Promise<ApiResponse<Case>>} Created case
   */
  async createCase(data: CreateCaseRequest): Promise<ApiResponse<Case>> {
    return apiClient.post<ApiResponse<Case>>('/cases', data);
  },

  /**
   * Retrieves all cases with optional filtering.
   * 
   * @async
   * @param {CaseFilters} [filters] - Optional filters
   * @returns {Promise<PaginatedResponse<Case>>} Paginated cases
   */
  async getCases(filters?: CaseFilters): Promise<PaginatedResponse<Case>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((v) => params.append(key, String(v)));
          } else {
            params.append(key, String(value));
          }
        }
      });
    }
    return apiClient.get<PaginatedResponse<Case>>(`/cases?${params.toString()}`);
  },

  /**
   * Gets case metrics and statistics.
   * 
   * @async
   * @returns {Promise<ApiResponse<CaseMetrics>>} Case metrics
   */
  async getMetrics(): Promise<ApiResponse<CaseMetrics>> {
    return apiClient.get<ApiResponse<CaseMetrics>>('/cases/metrics');
  },

  /**
   * Retrieves a single case by ID.
   * 
   * @async
   * @param {string} id - Case ID
   * @returns {Promise<ApiResponse<Case>>} Case details
   */
  async getCase(id: string): Promise<ApiResponse<Case>> {
    return apiClient.get<ApiResponse<Case>>(`/cases/${id}`);
  },

  /**
   * Updates an existing case.
   * 
   * @async
   * @param {string} id - Case ID
   * @param {UpdateCaseRequest} data - Updated case data
   * @returns {Promise<ApiResponse<Case>>} Updated case
   */
  async updateCase(id: string, data: UpdateCaseRequest): Promise<ApiResponse<Case>> {
    return apiClient.put<ApiResponse<Case>>(`/cases/${id}`, data);
  },

  /**
   * Deletes a case.
   * 
   * @async
   * @param {string} id - Case ID
   * @returns {Promise<ApiResponse<void>>} Empty response
   */
  async deleteCase(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/cases/${id}`);
  },

  /**
   * Creates a task for a case.
   * 
   * @async
   * @param {string} caseId - Case ID
   * @param {CreateTaskRequest} data - Task data
   * @returns {Promise<ApiResponse<CaseTask>>} Created task
   */
  async createTask(caseId: string, data: CreateTaskRequest): Promise<ApiResponse<CaseTask>> {
    return apiClient.post<ApiResponse<CaseTask>>(`/cases/${caseId}/tasks`, data);
  },

  /**
   * Gets all tasks for a case.
   * 
   * @async
   * @param {string} caseId - Case ID
   * @returns {Promise<ApiResponse<CaseTask[]>>} List of tasks
   */
  async getCaseTasks(caseId: string): Promise<ApiResponse<CaseTask[]>> {
    return apiClient.get<ApiResponse<CaseTask[]>>(`/cases/${caseId}/tasks`);
  },

  /**
   * Updates a task.
   * 
   * @async
   * @param {string} caseId - Case ID
   * @param {string} taskId - Task ID
   * @param {UpdateTaskRequest} data - Updated task data
   * @returns {Promise<ApiResponse<CaseTask>>} Updated task
   */
  async updateTask(caseId: string, taskId: string, data: UpdateTaskRequest): Promise<ApiResponse<CaseTask>> {
    return apiClient.put<ApiResponse<CaseTask>>(`/cases/${caseId}/tasks/${taskId}`, data);
  },

  /**
   * Deletes a task.
   * 
   * @async
   * @param {string} caseId - Case ID
   * @param {string} taskId - Task ID
   * @returns {Promise<ApiResponse<void>>} Empty response
   */
  async deleteTask(caseId: string, taskId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/cases/${caseId}/tasks/${taskId}`);
  },

  /**
   * Adds a comment to a case.
   * 
   * @async
   * @param {string} caseId - Case ID
   * @param {CreateCommentRequest} data - Comment data
   * @returns {Promise<ApiResponse<CaseComment>>} Created comment
   */
  async addComment(caseId: string, data: CreateCommentRequest): Promise<ApiResponse<CaseComment>> {
    return apiClient.post<ApiResponse<CaseComment>>(`/cases/${caseId}/comments`, data);
  },

  /**
   * Gets all comments for a case.
   * 
   * @async
   * @param {string} caseId - Case ID
   * @returns {Promise<ApiResponse<CaseComment[]>>} List of comments
   */
  async getCaseComments(caseId: string): Promise<ApiResponse<CaseComment[]>> {
    return apiClient.get<ApiResponse<CaseComment[]>>(`/cases/${caseId}/comments`);
  },

  /**
   * Gets the timeline for a case.
   * 
   * @async
   * @param {string} caseId - Case ID
   * @returns {Promise<ApiResponse<CaseTimelineEvent[]>>} Case timeline
   */
  async getCaseTimeline(caseId: string): Promise<ApiResponse<CaseTimelineEvent[]>> {
    return apiClient.get<ApiResponse<CaseTimelineEvent[]>>(`/cases/${caseId}/timeline`);
  },

  /**
   * Creates a case template.
   * 
   * @async
   * @param {CreateTemplateRequest} data - Template data
   * @returns {Promise<ApiResponse<CaseTemplate>>} Created template
   */
  async createTemplate(data: CreateTemplateRequest): Promise<ApiResponse<CaseTemplate>> {
    return apiClient.post<ApiResponse<CaseTemplate>>('/cases/templates', data);
  },

  /**
   * Gets all case templates.
   * 
   * @async
   * @returns {Promise<ApiResponse<CaseTemplate[]>>} List of templates
   */
  async getTemplates(): Promise<ApiResponse<CaseTemplate[]>> {
    return apiClient.get<ApiResponse<CaseTemplate[]>>('/cases/templates');
  },
};
