/**
 * Task Routes
 */

const express = require('express');

const router = express.Router();
const taskController = require('../controllers/taskController');
const { taskSchema, updateTaskSchema, addCommentSchema } = require('../validators/taskValidator');

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

// Task CRUD routes
router.post('/tasks', validate(taskSchema), taskController.createTask);
router.get('/tasks', taskController.listTasks);
router.get('/tasks/:id', taskController.getTask);
router.patch('/tasks/:id', validate(updateTaskSchema), taskController.updateTask);

// Task operations
router.put('/tasks/:id/assign', taskController.assignTask);
router.put('/tasks/:id/progress', taskController.updateProgress);
router.post('/tasks/:id/comments', validate(addCommentSchema), taskController.addComment);
router.get('/tasks/:id/dependencies', taskController.getDependencies);
router.get('/tasks/workload/:userId', taskController.getUserWorkload);

module.exports = router;
