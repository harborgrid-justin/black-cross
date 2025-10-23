/**
 * Draft Workspace - Type Definitions
 * Work-in-progress state management for entities
 */

/**
 * Supported entity types for drafts
 */
export enum DraftEntityType {
  INCIDENT = 'incident',
  THREAT = 'threat',
  VULNERABILITY = 'vulnerability',
  IOC = 'ioc',
  CASE = 'case',
  REPORT = 'report',
  PLAYBOOK = 'playbook',
  THREAT_ACTOR = 'threat_actor',
}

/**
 * Draft status
 */
export enum DraftStatus {
  ACTIVE = 'active',
  SAVED = 'saved',
  SUBMITTED = 'submitted',
  DISCARDED = 'discarded',
}

/**
 * Core draft interface
 */
export interface Draft {
  id: string;
  entity_type: DraftEntityType;
  entity_id?: string;
  user_id: string;
  title: string;
  content: Record<string, any>;
  status: DraftStatus;
  version: number;
  last_modified: Date;
  created_at: Date;
  expires_at?: Date;
  metadata?: Record<string, any>;
}

/**
 * Draft revision for version history
 */
export interface DraftRevision {
  id: string;
  draft_id: string;
  version: number;
  content: Record<string, any>;
  changed_by: string;
  changes_summary?: string;
  created_at: Date;
}

/**
 * Draft conflict resolution
 */
export interface DraftConflict {
  draft_id: string;
  field: string;
  local_value: any;
  remote_value: any;
  timestamp: Date;
}

/**
 * Autosave configuration
 */
export interface AutosaveConfig {
  enabled: boolean;
  interval_seconds: number;
  max_drafts_per_user: number;
  retention_days: number;
}

/**
 * Request/Response types
 */
export interface CreateDraftRequest {
  entity_type: DraftEntityType;
  entity_id?: string;
  title: string;
  content: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface UpdateDraftRequest {
  title?: string;
  content?: Record<string, any>;
  status?: DraftStatus;
  metadata?: Record<string, any>;
}

export interface SubmitDraftRequest {
  changes_summary?: string;
}

export interface DraftListFilters {
  entity_type?: DraftEntityType;
  status?: DraftStatus;
  search?: string;
}

export interface DraftStats {
  total: number;
  by_entity_type: Record<DraftEntityType, number>;
  by_status: Record<DraftStatus, number>;
  active_count: number;
}
