/**
 * Workspace Routes
 */

const express = require('express');
const workspaceController = require('../controllers/workspaceController');
const { workspaceSchema, updateWorkspaceSchema, addMemberSchema } = require('../validators/workspaceValidator');

const router = express.Router();

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

// Workspace routes
router.post('/workspaces', validate(workspaceSchema), workspaceController.createWorkspace);
router.get('/workspaces', workspaceController.listWorkspaces);
router.get('/workspaces/:id', workspaceController.getWorkspace);
router.put('/workspaces/:id', validate(updateWorkspaceSchema), workspaceController.updateWorkspace);
router.delete('/workspaces/:id', workspaceController.deleteWorkspace);
router.post('/workspaces/:id/members', validate(addMemberSchema), workspaceController.addMember);
router.delete('/workspaces/:id/members/:memberId', workspaceController.removeMember);

module.exports = router;
