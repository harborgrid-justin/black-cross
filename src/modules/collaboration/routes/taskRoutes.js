/**
 * Task Routes
 */

const express = require('express');
const taskController = require('../controllers/taskController');
const { taskSchema, updateTaskSchema, addCommentSchema } = require('../validators/taskValidator');

const router = express.Router();

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, error: error.details[0].message });
  }
  next();
};

router.post('/tasks', validate(taskSchema), taskController.createTask);
router.get('/tasks', taskController.listTasks);
router.get('/tasks/:id', taskController.getTask);
router.patch('/tasks/:id', validate(updateTaskSchema), taskController.updateTask);
router.delete('/tasks/:id', taskController.deleteTask);
router.post('/tasks/:id/comments', validate(addCommentSchema), taskController.addComment);
router.get('/tasks/analytics/:workspaceId', taskController.getAnalytics);

module.exports = router;
