/**
 * Background Task System - Type Definitions
 * Adapted from OpenCTI Platform
 * 
 * Provides long-running task orchestration with:
 * - Progress tracking
 * - Task cancellation
 * - Error recovery
 * - Result storage
 */

export enum TaskStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export interface BackgroundTask {
  id: string;
  type: string;
  status: TaskStatus;
  progress: number;
  started_at?: Date;
  completed_at?: Date;
  error?: string;
  user_id: string;
  metadata: Record<string, any>;
  result?: any;
}

export interface TaskInput {
  type: string;
  user_id: string;
  metadata?: Record<string, any>;
}

export interface TaskExecutor {
  /**
   * Execute the task
   * @param task The task to execute
   * @returns The task result
   */
  execute(task: BackgroundTask): Promise<any>;
  
  /**
   * Cancel a running task
   * @param task The task to cancel
   */
  cancel(task: BackgroundTask): Promise<void>;
}

export interface TaskProgressUpdate {
  task_id: string;
  progress: number;
  message?: string;
}
