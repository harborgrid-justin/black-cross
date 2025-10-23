/**
 * Background Task Manager
 * Adapted from OpenCTI Platform
 * 
 * Orchestrates long-running tasks with progress tracking,
 * cancellation support, and resource management.
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import type { BackgroundTask, TaskInput, TaskExecutor, TaskStatus } from './task-types';
import { TaskStatus as TaskStatusEnum } from './task-types';

export class BackgroundTaskManager extends EventEmitter {
  private tasks: Map<string, BackgroundTask> = new Map();
  private executors: Map<string, TaskExecutor> = new Map();
  private runningTasks: Set<string> = new Set();
  private maxConcurrent: number = 5;
  private taskStorage: Map<string, BackgroundTask> = new Map(); // In-memory storage for demo

  constructor(maxConcurrent: number = 5) {
    super();
    this.maxConcurrent = maxConcurrent;
  }

  /**
   * Register a task executor for a specific task type
   */
  registerExecutor(type: string, executor: TaskExecutor): void {
    this.executors.set(type, executor);
  }

  /**
   * Create a new background task
   */
  async createTask(input: TaskInput): Promise<BackgroundTask> {
    const task: BackgroundTask = {
      id: uuidv4(),
      type: input.type,
      status: TaskStatusEnum.PENDING,
      progress: 0,
      user_id: input.user_id,
      metadata: input.metadata || {}
    };

    // Store task
    this.tasks.set(task.id, task);
    await this.persistTask(task);
    
    // Emit event
    this.emit('task:created', task);
    
    // Try to execute immediately if slots available
    this.tryExecuteNext();
    
    return task;
  }

  /**
   * Execute a task
   */
  async executeTask(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    // Check if already running
    if (this.runningTasks.has(taskId)) {
      return;
    }

    // Check concurrent limit
    if (this.runningTasks.size >= this.maxConcurrent) {
      return;
    }

    const executor = this.executors.get(task.type);
    if (!executor) {
      throw new Error(`No executor registered for task type: ${task.type}`);
    }

    // Mark as running
    this.runningTasks.add(taskId);
    task.status = TaskStatusEnum.RUNNING;
    task.started_at = new Date();
    task.progress = 0;
    await this.persistTask(task);
    this.emit('task:started', task);

    try {
      // Execute the task
      const result = await executor.execute(task);
      
      // Mark as completed
      task.status = TaskStatusEnum.COMPLETED;
      task.completed_at = new Date();
      task.progress = 100;
      task.result = result;
      
      this.emit('task:completed', task);
    } catch (error: any) {
      // Mark as failed
      task.status = TaskStatusEnum.FAILED;
      task.completed_at = new Date();
      task.error = error.message || 'Unknown error';
      
      this.emit('task:failed', task, error);
    } finally {
      await this.persistTask(task);
      this.runningTasks.delete(taskId);
      
      // Try to execute next pending task
      this.tryExecuteNext();
    }
  }

  /**
   * Cancel a running task
   */
  async cancelTask(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    // If running, call executor's cancel method
    if (task.status === TaskStatusEnum.RUNNING) {
      const executor = this.executors.get(task.type);
      if (executor) {
        try {
          await executor.cancel(task);
        } catch (error: any) {
          console.error(`Error cancelling task ${taskId}:`, error);
        }
      }
    }

    // Mark as cancelled
    task.status = TaskStatusEnum.CANCELLED;
    task.completed_at = new Date();
    await this.persistTask(task);
    this.emit('task:cancelled', task);
    
    this.runningTasks.delete(taskId);
    this.tryExecuteNext();
  }

  /**
   * Update task progress
   */
  async updateTaskProgress(taskId: string, progress: number, message?: string): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    task.progress = Math.min(100, Math.max(0, progress));
    if (message) {
      task.metadata.progress_message = message;
    }
    
    await this.persistTask(task);
    this.emit('task:progress', task);
  }

  /**
   * Get a task by ID
   */
  getTask(taskId: string): BackgroundTask | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * Get all tasks for a user
   */
  getUserTasks(userId: string): BackgroundTask[] {
    return Array.from(this.tasks.values())
      .filter(task => task.user_id === userId)
      .sort((a, b) => {
        const aTime = a.started_at?.getTime() || 0;
        const bTime = b.started_at?.getTime() || 0;
        return bTime - aTime;
      });
  }

  /**
   * Get running tasks count
   */
  getRunningTasksCount(): number {
    return this.runningTasks.size;
  }

  /**
   * Try to execute the next pending task if slots are available
   */
  private tryExecuteNext(): void {
    if (this.runningTasks.size >= this.maxConcurrent) {
      return;
    }

    const pendingTask = Array.from(this.tasks.values())
      .find(t => t.status === TaskStatusEnum.PENDING);

    if (pendingTask) {
      this.executeTask(pendingTask.id).catch(error => {
        console.error(`Error executing task ${pendingTask.id}:`, error);
      });
    }
  }

  /**
   * Persist task to storage
   * In a real implementation, this would save to database
   */
  private async persistTask(task: BackgroundTask): Promise<void> {
    this.taskStorage.set(task.id, { ...task });
    // TODO: Save to database
    // await BackgroundTaskModel.upsert(task);
  }

  /**
   * Load tasks from storage
   * In a real implementation, this would load from database
   */
  async loadTasks(): Promise<void> {
    // TODO: Load from database
    // const tasks = await BackgroundTaskModel.findAll();
    // tasks.forEach(task => this.tasks.set(task.id, task));
  }

  /**
   * Clean up completed tasks older than specified days
   */
  async cleanupOldTasks(daysOld: number = 7): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    let cleaned = 0;
    for (const [id, task] of this.tasks.entries()) {
      if (
        task.completed_at &&
        task.completed_at < cutoffDate &&
        (task.status === TaskStatusEnum.COMPLETED || 
         task.status === TaskStatusEnum.FAILED ||
         task.status === TaskStatusEnum.CANCELLED)
      ) {
        this.tasks.delete(id);
        this.taskStorage.delete(id);
        cleaned++;
      }
    }

    return cleaned;
  }
}

/**
 * Singleton instance
 */
export const taskManager = new BackgroundTaskManager();

/**
 * Helper function to create and execute a task
 */
export const createAndExecuteTask = async (
  type: string,
  userId: string,
  metadata?: Record<string, any>
): Promise<BackgroundTask> => {
  return await taskManager.createTask({ type, user_id: userId, metadata });
};
