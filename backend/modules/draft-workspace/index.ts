/**
 * Draft Workspace - Router
 * API endpoints for draft management
 */

import { Router } from 'express';
import * as controller from './controller';

const router = Router();

// Draft endpoints
router.post('/drafts', controller.createDraft);
router.get('/drafts', controller.getUserDrafts);
router.get('/drafts/stats', controller.getUserStats);
router.get('/drafts/:id', controller.getDraft);
router.put('/drafts/:id', controller.updateDraft);
router.post('/drafts/:id/submit', controller.submitDraft);
router.post('/drafts/:id/discard', controller.discardDraft);
router.delete('/drafts/:id', controller.deleteDraft);

// Revision endpoints
router.get('/drafts/:id/revisions', controller.getDraftRevisions);
router.post('/drafts/:id/revisions/:revisionId/restore', controller.restoreRevision);

export default router;
