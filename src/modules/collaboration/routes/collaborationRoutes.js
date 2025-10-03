/**
 * Collaboration Routes
 * Combines all collaboration sub-feature routes
 */

const express = require('express');

const router = express.Router();
const collaborationController = require('../controllers/collaborationController');
const { roleSchema, assignRoleSchema } = require('../validators/roleValidator');
const { articleSchema, updateArticleSchema } = require('../validators/knowledgeValidator');
const { messageSchema, reactionSchema } = require('../validators/messageValidator');

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

// RBAC routes
router.post('/roles', validate(roleSchema), collaborationController.createRole);
router.get('/roles', collaborationController.listRoles);
router.get('/roles/:id', collaborationController.getRole);
router.put('/users/:id/roles', validate(assignRoleSchema), collaborationController.assignRole);

// Real-time collaboration session routes
router.post('/sessions', collaborationController.startSession);
router.get('/sessions', collaborationController.listSessions);
router.get('/sessions/:id', collaborationController.getSession);
router.post('/sessions/:id/join', collaborationController.joinSession);
router.post('/sessions/:id/leave', collaborationController.leaveSession);

// Knowledge Base routes
router.post('/kb/articles', validate(articleSchema), collaborationController.createArticle);
router.get('/kb/articles/:id', collaborationController.getArticle);
router.put('/kb/articles/:id', validate(updateArticleSchema), collaborationController.updateArticle);
router.get('/kb/search', collaborationController.searchKnowledgeBase);
router.post('/kb/articles/:id/publish', collaborationController.publishArticle);

// Messaging routes
router.post('/messages', validate(messageSchema), collaborationController.sendMessage);
router.get('/messages/channels/:channelId', collaborationController.getMessages);
router.delete('/messages/:id', collaborationController.deleteMessage);
router.post('/messages/:id/reactions', validate(reactionSchema), collaborationController.addReaction);

// Activity and notification routes
router.get('/activities', collaborationController.getActivities);
router.get('/activities/feed', collaborationController.getPersonalFeed);
router.put('/activities/:id/read', collaborationController.markActivityAsRead);
router.get('/activities/unread-count', collaborationController.getUnreadCount);
router.put('/users/notifications/preferences', collaborationController.updateNotificationPreferences);

module.exports = router;
