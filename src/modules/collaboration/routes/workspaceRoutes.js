/**
 * Workspace Routes
 */

const express = require('express');

const router = express.Router();
const workspaceController = require('../controllers/workspaceController');
const { workspaceSchema, updateWorkspaceSchema, addMemberSchema } = require('../validators/workspaceValidator');

// Validation middleware
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }
  next();
};

// Workspace CRUD routes
router.post('/workspaces', validate(workspaceSchema), workspaceController.createWorkspace);
router.get('/workspaces', workspaceController.listWorkspaces);
router.get('/workspaces/:id', workspaceController.getWorkspace);
router.put('/workspaces/:id', validate(updateWorkspaceSchema), workspaceController.updateWorkspace);

// Workspace member management
router.post('/workspaces/:id/members', validate(addMemberSchema), workspaceController.addMember);
router.delete('/workspaces/:id/members/:userId', workspaceController.removeMember);

// Workspace analytics and operations
router.get('/workspaces/:id/analytics', workspaceController.getAnalytics);
router.post('/workspaces/:id/archive', workspaceController.archiveWorkspace);

module.exports = router;
