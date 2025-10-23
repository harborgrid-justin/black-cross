/**
 * Draft Workspace - Service Layer
 * Business logic for draft management and autosave
 */

import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from 'events';
import {
  Draft,
  DraftRevision,
  DraftStats,
  CreateDraftRequest,
  UpdateDraftRequest,
  SubmitDraftRequest,
  DraftListFilters,
  DraftEntityType,
  DraftStatus,
} from './types';

/**
 * Draft workspace service
 */
class DraftWorkspaceService extends EventEmitter {
  private drafts: Map<string, Draft> = new Map();
  private revisions: Map<string, DraftRevision> = new Map();
  private readonly maxDraftsPerUser = 50;
  private readonly retentionDays = 30;

  /**
   * Create a new draft
   */
  async createDraft(request: CreateDraftRequest, userId: string): Promise<Draft> {
    // Check user draft limit
    const userDrafts = await this.getUserDrafts(userId);
    
    if (userDrafts.length >= this.maxDraftsPerUser) {
      throw new Error(`Maximum ${this.maxDraftsPerUser} drafts per user exceeded`);
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.retentionDays);

    const draft: Draft = {
      id: uuidv4(),
      entity_type: request.entity_type,
      entity_id: request.entity_id,
      user_id: userId,
      title: request.title,
      content: request.content,
      status: DraftStatus.ACTIVE,
      version: 1,
      last_modified: new Date(),
      created_at: new Date(),
      expires_at: expiresAt,
      metadata: request.metadata || {},
    };

    this.drafts.set(draft.id, draft);

    // Create initial revision
    await this.createRevision(draft.id, draft.content, userId, 'Initial draft');

    this.emit('draft:created', draft);
    return draft;
  }

  /**
   * Get draft by ID
   */
  async getDraft(draftId: string, userId: string): Promise<Draft | null> {
    const draft = this.drafts.get(draftId);

    if (!draft) {
      return null;
    }

    // Verify ownership
    if (draft.user_id !== userId) {
      throw new Error('Access denied');
    }

    return draft;
  }

  /**
   * Get all drafts for a user
   */
  async getUserDrafts(userId: string, filters?: DraftListFilters): Promise<Draft[]> {
    let drafts = Array.from(this.drafts.values())
      .filter((d) => d.user_id === userId);

    if (filters) {
      if (filters.entity_type) {
        drafts = drafts.filter((d) => d.entity_type === filters.entity_type);
      }

      if (filters.status) {
        drafts = drafts.filter((d) => d.status === filters.status);
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        drafts = drafts.filter((d) =>
          d.title.toLowerCase().includes(searchLower) ||
          JSON.stringify(d.content).toLowerCase().includes(searchLower)
        );
      }
    }

    // Filter out expired drafts
    const now = new Date();
    drafts = drafts.filter((d) => !d.expires_at || d.expires_at > now);

    // Sort by last modified
    drafts.sort((a, b) => b.last_modified.getTime() - a.last_modified.getTime());

    return drafts;
  }

  /**
   * Update draft (autosave)
   */
  async updateDraft(
    draftId: string,
    updates: UpdateDraftRequest,
    userId: string,
    createRevision: boolean = false
  ): Promise<Draft> {
    const draft = await this.getDraft(draftId, userId);

    if (!draft) {
      throw new Error('Draft not found');
    }

    if (draft.status === DraftStatus.SUBMITTED || draft.status === DraftStatus.DISCARDED) {
      throw new Error('Cannot update submitted or discarded draft');
    }

    const contentChanged = updates.content && JSON.stringify(updates.content) !== JSON.stringify(draft.content);

    Object.assign(draft, updates, { last_modified: new Date() });

    if (contentChanged) {
      draft.version++;
      
      if (createRevision) {
        await this.createRevision(draftId, draft.content, userId, 'Manual save');
      }
    }

    this.drafts.set(draftId, draft);
    this.emit('draft:updated', draft);

    return draft;
  }

  /**
   * Submit draft (promote to actual entity)
   */
  async submitDraft(
    draftId: string,
    request: SubmitDraftRequest,
    userId: string
  ): Promise<Draft> {
    const draft = await this.getDraft(draftId, userId);

    if (!draft) {
      throw new Error('Draft not found');
    }

    if (draft.status === DraftStatus.SUBMITTED) {
      throw new Error('Draft already submitted');
    }

    draft.status = DraftStatus.SUBMITTED;
    draft.last_modified = new Date();

    // Create final revision
    await this.createRevision(
      draftId,
      draft.content,
      userId,
      request.changes_summary || 'Submitted draft'
    );

    this.drafts.set(draftId, draft);
    this.emit('draft:submitted', draft);

    return draft;
  }

  /**
   * Discard draft
   */
  async discardDraft(draftId: string, userId: string): Promise<void> {
    const draft = await this.getDraft(draftId, userId);

    if (!draft) {
      throw new Error('Draft not found');
    }

    draft.status = DraftStatus.DISCARDED;
    draft.last_modified = new Date();

    this.drafts.set(draftId, draft);
    this.emit('draft:discarded', { draftId, userId });
  }

  /**
   * Delete draft permanently
   */
  async deleteDraft(draftId: string, userId: string): Promise<void> {
    const draft = await this.getDraft(draftId, userId);

    if (!draft) {
      throw new Error('Draft not found');
    }

    // Delete revisions
    const draftRevisions = Array.from(this.revisions.values())
      .filter((r) => r.draft_id === draftId);
    
    draftRevisions.forEach((r) => this.revisions.delete(r.id));

    this.drafts.delete(draftId);
    this.emit('draft:deleted', { draftId, userId });
  }

  /**
   * Get draft revisions
   */
  async getDraftRevisions(draftId: string, userId: string): Promise<DraftRevision[]> {
    const draft = await this.getDraft(draftId, userId);

    if (!draft) {
      throw new Error('Draft not found');
    }

    const revisions = Array.from(this.revisions.values())
      .filter((r) => r.draft_id === draftId)
      .sort((a, b) => b.version - a.version);

    return revisions;
  }

  /**
   * Restore draft to a specific revision
   */
  async restoreRevision(
    draftId: string,
    revisionId: string,
    userId: string
  ): Promise<Draft> {
    const draft = await this.getDraft(draftId, userId);

    if (!draft) {
      throw new Error('Draft not found');
    }

    const revision = this.revisions.get(revisionId);

    if (!revision || revision.draft_id !== draftId) {
      throw new Error('Revision not found');
    }

    draft.content = revision.content;
    draft.version++;
    draft.last_modified = new Date();

    // Create new revision for restore point
    await this.createRevision(
      draftId,
      draft.content,
      userId,
      `Restored to version ${revision.version}`
    );

    this.drafts.set(draftId, draft);
    this.emit('draft:restored', { draft, revisionId });

    return draft;
  }

  /**
   * Get draft statistics for user
   */
  async getUserStats(userId: string): Promise<DraftStats> {
    const userDrafts = await this.getUserDrafts(userId);

    const stats: DraftStats = {
      total: userDrafts.length,
      by_entity_type: {
        [DraftEntityType.INCIDENT]: 0,
        [DraftEntityType.THREAT]: 0,
        [DraftEntityType.VULNERABILITY]: 0,
        [DraftEntityType.IOC]: 0,
        [DraftEntityType.CASE]: 0,
        [DraftEntityType.REPORT]: 0,
        [DraftEntityType.PLAYBOOK]: 0,
        [DraftEntityType.THREAT_ACTOR]: 0,
      },
      by_status: {
        [DraftStatus.ACTIVE]: 0,
        [DraftStatus.SAVED]: 0,
        [DraftStatus.SUBMITTED]: 0,
        [DraftStatus.DISCARDED]: 0,
      },
      active_count: 0,
    };

    userDrafts.forEach((d) => {
      stats.by_entity_type[d.entity_type]++;
      stats.by_status[d.status]++;

      if (d.status === DraftStatus.ACTIVE) {
        stats.active_count++;
      }
    });

    return stats;
  }

  /**
   * Cleanup expired drafts
   */
  async cleanupExpiredDrafts(): Promise<number> {
    const now = new Date();
    let count = 0;

    for (const [id, draft] of this.drafts.entries()) {
      if (draft.expires_at && draft.expires_at < now) {
        this.drafts.delete(id);
        
        // Delete revisions
        const draftRevisions = Array.from(this.revisions.values())
          .filter((r) => r.draft_id === id);
        
        draftRevisions.forEach((r) => this.revisions.delete(r.id));
        
        count++;
      }
    }

    if (count > 0) {
      this.emit('drafts:cleaned', { count });
    }

    return count;
  }

  /**
   * Helper: Create draft revision
   */
  private async createRevision(
    draftId: string,
    content: Record<string, any>,
    userId: string,
    summary?: string
  ): Promise<DraftRevision> {
    const draft = this.drafts.get(draftId);
    
    if (!draft) {
      throw new Error('Draft not found');
    }

    const revision: DraftRevision = {
      id: uuidv4(),
      draft_id: draftId,
      version: draft.version,
      content: JSON.parse(JSON.stringify(content)), // Deep clone
      changed_by: userId,
      changes_summary: summary,
      created_at: new Date(),
    };

    this.revisions.set(revision.id, revision);
    return revision;
  }
}

// Export singleton instance
export const draftWorkspaceService = new DraftWorkspaceService();
