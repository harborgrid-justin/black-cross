/**
 * Activity Routes
 */

const express = require('express');
const activityController = require('../controllers/activityController');

const router = express.Router();

router.get('/activities', activityController.getUserActivities);
router.get('/activities/workspace/:workspaceId', activityController.getWorkspaceActivities);
router.get('/activities/:entityType/:entityId', activityController.getEntityActivities);
router.get('/activities/stats/:workspaceId', activityController.getStatistics);

module.exports = router;
