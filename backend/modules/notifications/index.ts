/**
 * Notification System - Router
 * API endpoints for notification management
 */

import { Router } from 'express';
import * as controller from './controller';

const router = Router();

// Notification endpoints
router.post('/notifications', controller.createNotification);
router.get('/notifications', controller.getUserNotifications);
router.get('/notifications/stats', controller.getUserStats);
router.put('/notifications/:id/read', controller.markAsRead);
router.post('/notifications/mark-all-read', controller.markAllAsRead);
router.delete('/notifications/:id', controller.deleteNotification);

// Preferences endpoints
router.get('/notifications/preferences', controller.getPreferences);
router.put('/notifications/preferences', controller.updatePreferences);

// Rules endpoints
router.post('/notifications/rules', controller.createRule);
router.get('/notifications/rules', controller.getRules);
router.put('/notifications/rules/:id', controller.updateRule);
router.delete('/notifications/rules/:id', controller.deleteRule);

export default router;
