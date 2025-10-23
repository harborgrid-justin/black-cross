/**
 * @fileoverview Draft Workspace API service.
 * 
 * Provides methods for managing draft entities including autosave,
 * version control, and draft lifecycle management.
 * 
 * @module services/draftWorkspaceService
 */

import { apiClient } from './api';
import type { ApiResponse, PaginatedResponse } from '@/types';

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
  last_modified: string;
  created_at: string;
  expires_at?: string;
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
  created_at: string;
}

/**
 * Draft statistics
 */
export interface DraftStats {
  total: number;
  by_entity_type: Record<DraftEntityType, number>;
  by_status: Record<DraftStatus, number>;
  active_count: number;
}

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

/**
 * Service for handling draft workspace API operations.
 * 
 * @namespace draftWorkspaceService
 */
export const draftWorkspaceService = {
  /**
   * Creates a new draft.
   * 
   * @async
   * @param {CreateDraftRequest} data - Draft data
   * @returns {Promise<ApiResponse<Draft>>} Created draft
   */
  async createDraft(data: CreateDraftRequest): Promise<ApiResponse<Draft>> {
    return apiClient.post<ApiResponse<Draft>>('/drafts', data);
  },

  /**
   * Retrieves all drafts with optional filtering.
   * 
   * @async
   * @param {DraftListFilters} [filters] - Optional filters
   * @returns {Promise<PaginatedResponse<Draft>>} Paginated drafts
   */
  async getDrafts(filters?: DraftListFilters): Promise<PaginatedResponse<Draft>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    return apiClient.get<PaginatedResponse<Draft>>(`/drafts?${params.toString()}`);
  },

  /**
   * Gets draft statistics for the current user.
   * 
   * @async
   * @returns {Promise<ApiResponse<DraftStats>>} Draft statistics
   */
  async getStats(): Promise<ApiResponse<DraftStats>> {
    return apiClient.get<ApiResponse<DraftStats>>('/drafts/stats');
  },

  /**
   * Retrieves a single draft by ID.
   * 
   * @async
   * @param {string} id - Draft ID
   * @returns {Promise<ApiResponse<Draft>>} Draft details
   */
  async getDraft(id: string): Promise<ApiResponse<Draft>> {
    return apiClient.get<ApiResponse<Draft>>(`/drafts/${id}`);
  },

  /**
   * Updates an existing draft (autosave or manual save).
   * 
   * @async
   * @param {string} id - Draft ID
   * @param {UpdateDraftRequest} data - Updated draft data
   * @param {boolean} [createRevision=false] - Whether to create a revision
   * @returns {Promise<ApiResponse<Draft>>} Updated draft
   */
  async updateDraft(id: string, data: UpdateDraftRequest, createRevision: boolean = false): Promise<ApiResponse<Draft>> {
    const params = createRevision ? '?revision=true' : '';
    return apiClient.put<ApiResponse<Draft>>(`/drafts/${id}${params}`, data);
  },

  /**
   * Deletes a draft.
   * 
   * @async
   * @param {string} id - Draft ID
   * @returns {Promise<ApiResponse<void>>} Empty response
   */
  async deleteDraft(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/drafts/${id}`);
  },

  /**
   * Submits a draft for processing/publication.
   * 
   * @async
   * @param {string} id - Draft ID
   * @param {SubmitDraftRequest} [data] - Submission data
   * @returns {Promise<ApiResponse<void>>} Empty response
   */
  async submitDraft(id: string, data?: SubmitDraftRequest): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>(`/drafts/${id}/submit`, data || {});
  },

  /**
   * Discards a draft permanently.
   * 
   * @async
   * @param {string} id - Draft ID
   * @returns {Promise<ApiResponse<void>>} Empty response
   */
  async discardDraft(id: string): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>(`/drafts/${id}/discard`, {});
  },

  /**
   * Gets revision history for a draft.
   * 
   * @async
   * @param {string} id - Draft ID
   * @returns {Promise<ApiResponse<DraftRevision[]>>} List of revisions
   */
  async getRevisions(id: string): Promise<ApiResponse<DraftRevision[]>> {
    return apiClient.get<ApiResponse<DraftRevision[]>>(`/drafts/${id}/revisions`);
  },

  /**
   * Restores a draft to a specific revision.
   * 
   * @async
   * @param {string} id - Draft ID
   * @param {string} revisionId - Revision ID
   * @returns {Promise<ApiResponse<Draft>>} Updated draft
   */
  async restoreRevision(id: string, revisionId: string): Promise<ApiResponse<Draft>> {
    return apiClient.post<ApiResponse<Draft>>(`/drafts/${id}/revisions/${revisionId}/restore`, {});
  },
};
