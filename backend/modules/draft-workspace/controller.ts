/**
 * Draft Workspace - Controller
 * HTTP request handlers for draft operations
 */

import type { Request, Response } from 'express';
import { draftWorkspaceService } from './service';
import {
  CreateDraftRequest,
  UpdateDraftRequest,
  SubmitDraftRequest,
  DraftListFilters,
} from './types';

/**
 * Create a new draft
 */
export async function createDraft(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const request: CreateDraftRequest = req.body;
    const draft = await draftWorkspaceService.createDraft(request, userId);

    res.status(201).json({
      success: true,
      data: draft,
      message: 'Draft created successfully',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create draft';
    res.status(400).json({ success: false, error: message });
  }
}

/**
 * Get draft by ID
 */
export async function getDraft(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const draft = await draftWorkspaceService.getDraft(id, userId);

    if (!draft) {
      res.status(404).json({ success: false, error: 'Draft not found' });
      return;
    }

    res.json({
      success: true,
      data: draft,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch draft';
    res.status(400).json({ success: false, error: message });
  }
}

/**
 * Get all drafts for current user
 */
export async function getUserDrafts(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const filters: DraftListFilters = {
      entity_type: req.query.entity_type as any,
      status: req.query.status as any,
      search: req.query.search as string,
    };

    const drafts = await draftWorkspaceService.getUserDrafts(userId, filters);

    res.json({
      success: true,
      data: drafts,
      count: drafts.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch drafts';
    res.status(500).json({ success: false, error: message });
  }
}

/**
 * Update draft (autosave)
 */
export async function updateDraft(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const updates: UpdateDraftRequest = req.body;
    const createRevision = req.query.save === 'true';

    const draft = await draftWorkspaceService.updateDraft(id, updates, userId, createRevision);

    res.json({
      success: true,
      data: draft,
      message: createRevision ? 'Draft saved' : 'Draft autosaved',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update draft';
    res.status(400).json({ success: false, error: message });
  }
}

/**
 * Submit draft
 */
export async function submitDraft(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const request: SubmitDraftRequest = req.body;
    const draft = await draftWorkspaceService.submitDraft(id, request, userId);

    res.json({
      success: true,
      data: draft,
      message: 'Draft submitted successfully',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to submit draft';
    res.status(400).json({ success: false, error: message });
  }
}

/**
 * Discard draft
 */
export async function discardDraft(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    await draftWorkspaceService.discardDraft(id, userId);

    res.json({
      success: true,
      message: 'Draft discarded',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to discard draft';
    res.status(400).json({ success: false, error: message });
  }
}

/**
 * Delete draft permanently
 */
export async function deleteDraft(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    await draftWorkspaceService.deleteDraft(id, userId);

    res.json({
      success: true,
      message: 'Draft deleted permanently',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete draft';
    res.status(400).json({ success: false, error: message });
  }
}

/**
 * Get draft revisions
 */
export async function getDraftRevisions(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const revisions = await draftWorkspaceService.getDraftRevisions(id, userId);

    res.json({
      success: true,
      data: revisions,
      count: revisions.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch revisions';
    res.status(400).json({ success: false, error: message });
  }
}

/**
 * Restore draft to specific revision
 */
export async function restoreRevision(req: Request, res: Response): Promise<void> {
  try {
    const { id, revisionId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const draft = await draftWorkspaceService.restoreRevision(id, revisionId, userId);

    res.json({
      success: true,
      data: draft,
      message: 'Draft restored to revision',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to restore revision';
    res.status(400).json({ success: false, error: message });
  }
}

/**
 * Get draft statistics
 */
export async function getUserStats(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const stats = await draftWorkspaceService.getUserStats(userId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch statistics';
    res.status(500).json({ success: false, error: message });
  }
}
