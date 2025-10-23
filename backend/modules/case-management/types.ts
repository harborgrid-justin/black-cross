/**
 * Case Management - Type Definitions
 * Enhanced incident case handling with workflow and collaboration
 */

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
 * Task status for case tasks
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
  due_date?: Date;
  resolved_at?: Date;
  closed_at?: Date;
  metadata: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

/**
 * Case task for tracking subtasks
 */
export interface CaseTask {
  id: string;
  case_id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  assignee_id?: string;
  due_date?: Date;
  completed_at?: Date;
  order: number;
  created_at: Date;
  updated_at: Date;
}

/**
 * Case comment/activity
 */
export interface CaseComment {
  id: string;
  case_id: string;
  user_id: string;
  type: CommentType;
  content: string;
  metadata?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

/**
 * Case attachment
 */
export interface CaseAttachment {
  id: string;
  case_id: string;
  filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_by: string;
  created_at: Date;
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
  timestamp: Date;
}

/**
 * Case template for standardized workflows
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
  created_at: Date;
  updated_at: Date;
}

/**
 * Case metrics and statistics
 */
export interface CaseMetrics {
  total: number;
  by_status: Record<CaseStatus, number>;
  by_priority: Record<CasePriority, number>;
  by_category: Record<CaseCategory, number>;
  avg_resolution_time: number;
  overdue_count: number;
}

/**
 * Request/Response types
 */
export interface CreateCaseRequest {
  title: string;
  description: string;
  priority: CasePriority;
  category: CaseCategory;
  assignee_id?: string;
  tags?: string[];
  due_date?: Date;
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
  due_date?: Date;
  metadata?: Record<string, any>;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  assignee_id?: string;
  due_date?: Date;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  assignee_id?: string;
  due_date?: Date;
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
