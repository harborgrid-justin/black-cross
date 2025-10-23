/**
 * Playbook Automation Module - Main Router
 */

import express from 'express';
import { playbookController } from './controller';
import { requireCapability } from '../../middleware/access-control';
import { CAPABILITIES } from '../../utils/access';

const router = express.Router();

// Playbook CRUD
router.post('/',
  requireCapability(CAPABILITIES.PLAYBOOK_CREATE),
  playbookController.create.bind(playbookController)
);

router.get('/',
  requireCapability(CAPABILITIES.PLAYBOOK_READ),
  playbookController.list.bind(playbookController)
);

router.get('/:id',
  requireCapability(CAPABILITIES.PLAYBOOK_READ),
  playbookController.get.bind(playbookController)
);

router.put('/:id',
  requireCapability(CAPABILITIES.PLAYBOOK_UPDATE),
  playbookController.update.bind(playbookController)
);

router.delete('/:id',
  requireCapability(CAPABILITIES.PLAYBOOK_DELETE),
  playbookController.delete.bind(playbookController)
);

// Playbook execution
router.post('/:id/execute',
  requireCapability(CAPABILITIES.PLAYBOOK_EXECUTE),
  playbookController.execute.bind(playbookController)
);

router.get('/executions/:executionId',
  requireCapability(CAPABILITIES.PLAYBOOK_READ),
  playbookController.getExecution.bind(playbookController)
);

router.post('/executions/:executionId/cancel',
  requireCapability(CAPABILITIES.PLAYBOOK_EXECUTE),
  playbookController.cancelExecution.bind(playbookController)
);

export default router;
