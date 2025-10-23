/**
 * Background Task Manager Tests
 */

import { BackgroundTaskManager } from '../task-manager';
import { TaskStatus, type TaskExecutor, type BackgroundTask } from '../task-types';

describe('BackgroundTaskManager', () => {
  let manager: BackgroundTaskManager;

  beforeEach(() => {
    manager = new BackgroundTaskManager(2); // Max 2 concurrent tasks
  });

  describe('Task Creation', () => {
    it('should create a new task', async () => {
      const task = await manager.createTask({
        type: 'test',
        user_id: 'user1',
        metadata: { foo: 'bar' }
      });

      expect(task).toBeDefined();
      expect(task.id).toBeDefined();
      expect(task.type).toBe('test');
      expect(task.status).toBe(TaskStatus.PENDING);
      expect(task.progress).toBe(0);
      expect(task.user_id).toBe('user1');
      expect(task.metadata.foo).toBe('bar');
    });

    it('should emit task:created event', async () => {
      const handler = jest.fn();
      manager.on('task:created', handler);

      await manager.createTask({
        type: 'test',
        user_id: 'user1'
      });

      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('Task Execution', () => {
    it('should execute a task successfully', async () => {
      const executor: TaskExecutor = {
        execute: jest.fn().mockResolvedValue({ result: 'success' }),
        cancel: jest.fn()
      };

      manager.registerExecutor('test', executor);

      const task = await manager.createTask({
        type: 'test',
        user_id: 'user1'
      });

      // Wait for task to complete
      await new Promise(resolve => {
        manager.on('task:completed', (completedTask) => {
          if (completedTask.id === task.id) {
            resolve(null);
          }
        });
      });

      const completedTask = manager.getTask(task.id);
      expect(completedTask?.status).toBe(TaskStatus.COMPLETED);
      expect(completedTask?.progress).toBe(100);
      expect(completedTask?.result).toEqual({ result: 'success' });
      expect(executor.execute).toHaveBeenCalledTimes(1);
    });

    it('should handle task execution errors', async () => {
      const executor: TaskExecutor = {
        execute: jest.fn().mockRejectedValue(new Error('Test error')),
        cancel: jest.fn()
      };

      manager.registerExecutor('test', executor);

      const task = await manager.createTask({
        type: 'test',
        user_id: 'user1'
      });

      // Wait for task to fail
      await new Promise(resolve => {
        manager.on('task:failed', (failedTask) => {
          if (failedTask.id === task.id) {
            resolve(null);
          }
        });
      });

      const failedTask = manager.getTask(task.id);
      expect(failedTask?.status).toBe(TaskStatus.FAILED);
      expect(failedTask?.error).toBe('Test error');
    });

    it('should respect concurrent task limit', async () => {
      let executingCount = 0;
      let maxConcurrent = 0;

      const executor: TaskExecutor = {
        execute: async () => {
          executingCount++;
          maxConcurrent = Math.max(maxConcurrent, executingCount);
          await new Promise(resolve => setTimeout(resolve, 100));
          executingCount--;
          return { success: true };
        },
        cancel: jest.fn()
      };

      manager.registerExecutor('test', executor);

      // Create 5 tasks (max concurrent is 2)
      const tasks = await Promise.all([
        manager.createTask({ type: 'test', user_id: 'user1' }),
        manager.createTask({ type: 'test', user_id: 'user1' }),
        manager.createTask({ type: 'test', user_id: 'user1' }),
        manager.createTask({ type: 'test', user_id: 'user1' }),
        manager.createTask({ type: 'test', user_id: 'user1' })
      ]);

      // Wait for all tasks to complete
      await Promise.all(
        tasks.map(task => new Promise(resolve => {
          manager.on('task:completed', (completedTask) => {
            if (completedTask.id === task.id) {
              resolve(null);
            }
          });
          manager.on('task:failed', (failedTask) => {
            if (failedTask.id === task.id) {
              resolve(null);
            }
          });
        }))
      );

      // Max concurrent should not exceed limit
      expect(maxConcurrent).toBeLessThanOrEqual(2);
    });
  });

  describe('Task Cancellation', () => {
    it('should cancel a pending task', async () => {
      const task = await manager.createTask({
        type: 'test',
        user_id: 'user1'
      });

      await manager.cancelTask(task.id);

      const cancelledTask = manager.getTask(task.id);
      expect(cancelledTask?.status).toBe(TaskStatus.CANCELLED);
    });

    it('should call executor cancel method for running tasks', async () => {
      const executor: TaskExecutor = {
        execute: jest.fn().mockImplementation(() => 
          new Promise(resolve => setTimeout(resolve, 5000))
        ),
        cancel: jest.fn()
      };

      manager.registerExecutor('test', executor);

      const task = await manager.createTask({
        type: 'test',
        user_id: 'user1'
      });

      // Wait for task to start
      await new Promise(resolve => {
        manager.on('task:started', (startedTask) => {
          if (startedTask.id === task.id) {
            resolve(null);
          }
        });
      });

      await manager.cancelTask(task.id);

      expect(executor.cancel).toHaveBeenCalled();
    });
  });

  describe('Task Progress', () => {
    it('should update task progress', async () => {
      const task = await manager.createTask({
        type: 'test',
        user_id: 'user1'
      });

      await manager.updateTaskProgress(task.id, 50, 'Half done');

      const updatedTask = manager.getTask(task.id);
      expect(updatedTask?.progress).toBe(50);
      expect(updatedTask?.metadata.progress_message).toBe('Half done');
    });

    it('should emit progress events', async () => {
      const handler = jest.fn();
      manager.on('task:progress', handler);

      const task = await manager.createTask({
        type: 'test',
        user_id: 'user1'
      });

      await manager.updateTaskProgress(task.id, 50);

      expect(handler).toHaveBeenCalled();
    });
  });

  describe('Task Retrieval', () => {
    it('should get user tasks', async () => {
      await manager.createTask({ type: 'test', user_id: 'user1' });
      await manager.createTask({ type: 'test', user_id: 'user1' });
      await manager.createTask({ type: 'test', user_id: 'user2' });

      const user1Tasks = manager.getUserTasks('user1');
      const user2Tasks = manager.getUserTasks('user2');

      expect(user1Tasks).toHaveLength(2);
      expect(user2Tasks).toHaveLength(1);
    });

    it('should get running tasks count', async () => {
      const executor: TaskExecutor = {
        execute: () => new Promise(resolve => setTimeout(resolve, 1000)),
        cancel: jest.fn()
      };

      manager.registerExecutor('test', executor);

      await manager.createTask({ type: 'test', user_id: 'user1' });
      await manager.createTask({ type: 'test', user_id: 'user1' });

      // Wait a bit for tasks to start
      await new Promise(resolve => setTimeout(resolve, 100));

      const count = manager.getRunningTasksCount();
      expect(count).toBeGreaterThan(0);
    });
  });

  describe('Task Cleanup', () => {
    it('should clean up old completed tasks', async () => {
      const task = await manager.createTask({
        type: 'test',
        user_id: 'user1'
      });

      // Manually set as old completed task
      const taskObj = manager.getTask(task.id);
      if (taskObj) {
        taskObj.status = TaskStatus.COMPLETED;
        taskObj.completed_at = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000); // 10 days ago
      }

      const cleaned = await manager.cleanupOldTasks(7);

      expect(cleaned).toBe(1);
      expect(manager.getTask(task.id)).toBeUndefined();
    });
  });
});
