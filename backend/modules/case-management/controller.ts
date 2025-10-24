/**
 * Case Management - Controller
 *
 * HTTP request handlers for case management operations. This controller provides
 * RESTful endpoints for managing security cases, tasks, comments, templates, and
 * metrics. All handlers follow the standard Express middleware pattern and return
 * JSON responses with consistent success/error structure.
 *
 * @module case-management/controller
 */

import type { Request, Response } from 'express';
import { caseManagementService } from './service';
import {
  CreateCaseRequest,
  UpdateCaseRequest,
  CreateTaskRequest,
  UpdateTaskRequest,
  CreateCommentRequest,
  CreateTemplateRequest,
  CaseFilters,
} from './types';

/**
 * Creates a new security case in the system.
 *
 * This endpoint allows authenticated users to create a new case with details such as
 * title, description, priority, category, and assignment information. The case is
 * automatically associated with the authenticated user as the creator.
 *
 * @async
 * @param {Request} req - Express request object containing the case data in body
 * @param {CreateCaseRequest} req.body - Case creation data (title, description, priority, category, etc.)
 * @param {Object} req.user - Authenticated user object from authentication middleware
 * @param {string} req.user.id - ID of the authenticated user creating the case
 * @param {Response} res - Express response object
 * @returns {Promise<void>} Resolves when response is sent
 *
 * @throws {Error} When case creation fails due to validation errors or database issues
 *
 * @example
 * // POST /api/v1/case-management
 * // Request body:
 * {
 *   "title": "Suspicious login attempts",
 *   "description": "Multiple failed login attempts detected",
 *   "priority": "high",
 *   "category": "security_incident",
 *   "assignee_id": "user-123"
 * }
 *
 * // Response (201):
 * {
 *   "success": true,
 *   "data": {
 *     "id": "case-456",
 *     "title": "Suspicious login attempts",
 *     "status": "open",
 *     "created_at": "2025-10-24T10:00:00Z"
 *   },
 *   "message": "Case created successfully"
 * }
 *
 * // Error Response (401):
 * {
 *   "success": false,
 *   "error": "Unauthorized"
 * }
 *
 * // Error Response (400):
 * {
 *   "success": false,
 *   "error": "Failed to create case"
 * }
 */
export async function createCase(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const request: CreateCaseRequest = req.body;
    const caseData = await caseManagementService.createCase(request, userId);

    res.status(201).json({
      success: true,
      data: caseData,
      message: 'Case created successfully',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create case';
    res.status(400).json({ success: false, error: message });
  }
}

/**
 * Retrieves all cases with optional filtering and search capabilities.
 *
 * This endpoint supports comprehensive filtering by status, priority, category, assignee,
 * creator, tags, overdue status, and text search. All query parameters are optional,
 * allowing for flexible case retrieval. The search parameter performs text matching
 * across case titles and descriptions.
 *
 * @async
 * @param {Request} req - Express request object with optional query parameters
 * @param {string} [req.query.status] - Filter by case status (e.g., 'open', 'in_progress', 'closed')
 * @param {string} [req.query.priority] - Filter by priority level (e.g., 'low', 'medium', 'high', 'critical')
 * @param {string} [req.query.category] - Filter by case category (e.g., 'security_incident', 'investigation')
 * @param {string} [req.query.assignee_id] - Filter by assigned user ID
 * @param {string} [req.query.created_by] - Filter by creator user ID
 * @param {string} [req.query.tags] - Comma-separated list of tags to filter by
 * @param {string} [req.query.overdue] - Filter overdue cases when set to 'true'
 * @param {string} [req.query.search] - Text search across case titles and descriptions
 * @param {Response} res - Express response object
 * @returns {Promise<void>} Resolves when response is sent
 *
 * @throws {Error} When case retrieval fails due to database issues
 *
 * @example
 * // GET /api/v1/case-management?status=open&priority=high&search=malware
 *
 * // Response (200):
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "id": "case-123",
 *       "title": "Malware investigation",
 *       "status": "open",
 *       "priority": "high",
 *       "category": "security_incident",
 *       "created_at": "2025-10-24T10:00:00Z"
 *     }
 *   ],
 *   "count": 1
 * }
 *
 * // Error Response (500):
 * {
 *   "success": false,
 *   "error": "Failed to fetch cases"
 * }
 */
export async function getCases(req: Request, res: Response): Promise<void> {
  try {
    const filters: CaseFilters = {
      status: req.query.status as any,
      priority: req.query.priority as any,
      category: req.query.category as any,
      assignee_id: req.query.assignee_id as string,
      created_by: req.query.created_by as string,
      tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
      overdue: req.query.overdue === 'true',
      search: req.query.search as string,
    };

    const cases = await caseManagementService.getCases(filters);

    res.json({
      success: true,
      data: cases,
      count: cases.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch cases';
    res.status(500).json({ success: false, error: message });
  }
}

/**
 * Retrieves a single case by its unique identifier.
 *
 * This endpoint fetches detailed information about a specific case, including all
 * associated metadata, status, priority, and relationships. Returns a 404 error
 * if the case with the specified ID does not exist.
 *
 * @async
 * @param {Request} req - Express request object with route parameters
 * @param {string} req.params.id - Unique identifier of the case to retrieve
 * @param {Response} res - Express response object
 * @returns {Promise<void>} Resolves when response is sent
 *
 * @throws {Error} When case retrieval fails due to database issues
 *
 * @example
 * // GET /api/v1/case-management/case-123
 *
 * // Response (200):
 * {
 *   "success": true,
 *   "data": {
 *     "id": "case-123",
 *     "title": "Security incident investigation",
 *     "description": "Detailed case description",
 *     "status": "in_progress",
 *     "priority": "high",
 *     "category": "security_incident",
 *     "assignee_id": "user-456",
 *     "created_by": "user-789",
 *     "created_at": "2025-10-24T10:00:00Z",
 *     "updated_at": "2025-10-24T12:00:00Z"
 *   }
 * }
 *
 * // Error Response (404):
 * {
 *   "success": false,
 *   "error": "Case not found"
 * }
 *
 * // Error Response (500):
 * {
 *   "success": false,
 *   "error": "Failed to fetch case"
 * }
 */
export async function getCase(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const caseData = await caseManagementService.getCase(id);

    if (!caseData) {
      res.status(404).json({ success: false, error: 'Case not found' });
      return;
    }

    res.json({
      success: true,
      data: caseData,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch case';
    res.status(500).json({ success: false, error: message });
  }
}

/**
 * Updates an existing case with new information.
 *
 * This endpoint allows authenticated users to modify case details such as title,
 * description, status, priority, assignee, and other metadata. Only provided fields
 * in the request body will be updated; omitted fields remain unchanged. The update
 * is tracked with the authenticated user's ID for audit purposes.
 *
 * @async
 * @param {Request} req - Express request object with route parameters and update data
 * @param {string} req.params.id - Unique identifier of the case to update
 * @param {UpdateCaseRequest} req.body - Partial case data with fields to update
 * @param {Object} req.user - Authenticated user object from authentication middleware
 * @param {string} req.user.id - ID of the authenticated user performing the update
 * @param {Response} res - Express response object
 * @returns {Promise<void>} Resolves when response is sent
 *
 * @throws {Error} When case update fails due to validation errors, non-existent case, or database issues
 *
 * @example
 * // PATCH /api/v1/case-management/case-123
 * // Request body:
 * {
 *   "status": "resolved",
 *   "priority": "medium",
 *   "resolution_notes": "Issue resolved by updating firewall rules"
 * }
 *
 * // Response (200):
 * {
 *   "success": true,
 *   "data": {
 *     "id": "case-123",
 *     "status": "resolved",
 *     "priority": "medium",
 *     "resolution_notes": "Issue resolved by updating firewall rules",
 *     "updated_at": "2025-10-24T14:00:00Z"
 *   },
 *   "message": "Case updated successfully"
 * }
 *
 * // Error Response (401):
 * {
 *   "success": false,
 *   "error": "Unauthorized"
 * }
 *
 * // Error Response (400):
 * {
 *   "success": false,
 *   "error": "Failed to update case"
 * }
 */
export async function updateCase(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const updates: UpdateCaseRequest = req.body;
    const caseData = await caseManagementService.updateCase(id, updates, userId);

    res.json({
      success: true,
      data: caseData,
      message: 'Case updated successfully',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update case';
    res.status(400).json({ success: false, error: message });
  }
}

/**
 * Deletes a case from the system.
 *
 * This endpoint permanently removes a case and all associated data including tasks,
 * comments, and timeline entries. This operation cannot be undone. Consider implementing
 * soft deletes or archival for production use cases requiring audit trails.
 *
 * @async
 * @param {Request} req - Express request object with route parameters
 * @param {string} req.params.id - Unique identifier of the case to delete
 * @param {Response} res - Express response object
 * @returns {Promise<void>} Resolves when response is sent
 *
 * @throws {Error} When case deletion fails due to non-existent case or database issues
 *
 * @remarks
 * This is a destructive operation. All related tasks, comments, and timeline entries
 * associated with the case will also be deleted. Ensure proper authorization checks
 * are in place before allowing case deletion.
 *
 * @example
 * // DELETE /api/v1/case-management/case-123
 *
 * // Response (200):
 * {
 *   "success": true,
 *   "message": "Case deleted successfully"
 * }
 *
 * // Error Response (400):
 * {
 *   "success": false,
 *   "error": "Failed to delete case"
 * }
 */
export async function deleteCase(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    await caseManagementService.deleteCase(id);

    res.json({
      success: true,
      message: 'Case deleted successfully',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete case';
    res.status(400).json({ success: false, error: message });
  }
}

/**
 * Creates a new task associated with a specific case.
 *
 * This endpoint allows authenticated users to create tasks within a case for tracking
 * specific action items, investigations, or remediation steps. Tasks can be assigned
 * to users, have due dates, and track completion status independently from the parent case.
 *
 * @async
 * @param {Request} req - Express request object with route parameters and task data
 * @param {string} req.params.id - Unique identifier of the case to add the task to
 * @param {CreateTaskRequest} req.body - Task creation data (title, description, assignee, due date, etc.)
 * @param {Object} req.user - Authenticated user object from authentication middleware
 * @param {string} req.user.id - ID of the authenticated user creating the task
 * @param {Response} res - Express response object
 * @returns {Promise<void>} Resolves when response is sent
 *
 * @throws {Error} When task creation fails due to validation errors, non-existent case, or database issues
 *
 * @example
 * // POST /api/v1/case-management/case-123/tasks
 * // Request body:
 * {
 *   "title": "Review firewall logs",
 *   "description": "Analyze firewall logs for suspicious activity",
 *   "assignee_id": "user-456",
 *   "due_date": "2025-10-25T18:00:00Z",
 *   "priority": "high"
 * }
 *
 * // Response (201):
 * {
 *   "success": true,
 *   "data": {
 *     "id": "task-789",
 *     "case_id": "case-123",
 *     "title": "Review firewall logs",
 *     "status": "pending",
 *     "priority": "high",
 *     "created_at": "2025-10-24T10:00:00Z"
 *   },
 *   "message": "Task created successfully"
 * }
 *
 * // Error Response (401):
 * {
 *   "success": false,
 *   "error": "Unauthorized"
 * }
 *
 * // Error Response (400):
 * {
 *   "success": false,
 *   "error": "Failed to create task"
 * }
 */
export async function createTask(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const request: CreateTaskRequest = req.body;
    const task = await caseManagementService.createTask(id, request, userId);

    res.status(201).json({
      success: true,
      data: task,
      message: 'Task created successfully',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create task';
    res.status(400).json({ success: false, error: message });
  }
}

/**
 * Retrieves all tasks associated with a specific case.
 *
 * This endpoint returns a list of all tasks created for a given case, including
 * task details such as title, description, status, assignee, priority, and due dates.
 * Tasks are useful for breaking down case work into manageable action items.
 *
 * @async
 * @param {Request} req - Express request object with route parameters
 * @param {string} req.params.id - Unique identifier of the case whose tasks to retrieve
 * @param {Response} res - Express response object
 * @returns {Promise<void>} Resolves when response is sent
 *
 * @throws {Error} When task retrieval fails due to database issues
 *
 * @example
 * // GET /api/v1/case-management/case-123/tasks
 *
 * // Response (200):
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "id": "task-789",
 *       "case_id": "case-123",
 *       "title": "Review firewall logs",
 *       "status": "in_progress",
 *       "assignee_id": "user-456",
 *       "created_at": "2025-10-24T10:00:00Z"
 *     },
 *     {
 *       "id": "task-790",
 *       "case_id": "case-123",
 *       "title": "Update security policies",
 *       "status": "pending",
 *       "assignee_id": "user-789",
 *       "created_at": "2025-10-24T11:00:00Z"
 *     }
 *   ],
 *   "count": 2
 * }
 *
 * // Error Response (500):
 * {
 *   "success": false,
 *   "error": "Failed to fetch tasks"
 * }
 */
export async function getCaseTasks(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const tasks = await caseManagementService.getCaseTasks(id);

    res.json({
      success: true,
      data: tasks,
      count: tasks.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch tasks';
    res.status(500).json({ success: false, error: message });
  }
}

/**
 * Updates an existing task with new information.
 *
 * This endpoint allows authenticated users to modify task details such as title,
 * description, status, assignee, priority, and due date. Only provided fields in
 * the request body will be updated; omitted fields remain unchanged. Common use
 * cases include marking tasks as complete, reassigning tasks, or updating priorities.
 *
 * @async
 * @param {Request} req - Express request object with route parameters and update data
 * @param {string} req.params.taskId - Unique identifier of the task to update
 * @param {UpdateTaskRequest} req.body - Partial task data with fields to update
 * @param {Object} req.user - Authenticated user object from authentication middleware
 * @param {string} req.user.id - ID of the authenticated user performing the update
 * @param {Response} res - Express response object
 * @returns {Promise<void>} Resolves when response is sent
 *
 * @throws {Error} When task update fails due to validation errors, non-existent task, or database issues
 *
 * @example
 * // PATCH /api/v1/case-management/tasks/task-789
 * // Request body:
 * {
 *   "status": "completed",
 *   "completion_notes": "Reviewed all logs, no anomalies found"
 * }
 *
 * // Response (200):
 * {
 *   "success": true,
 *   "data": {
 *     "id": "task-789",
 *     "status": "completed",
 *     "completion_notes": "Reviewed all logs, no anomalies found",
 *     "completed_at": "2025-10-24T15:30:00Z",
 *     "updated_at": "2025-10-24T15:30:00Z"
 *   },
 *   "message": "Task updated successfully"
 * }
 *
 * // Error Response (401):
 * {
 *   "success": false,
 *   "error": "Unauthorized"
 * }
 *
 * // Error Response (400):
 * {
 *   "success": false,
 *   "error": "Failed to update task"
 * }
 */
export async function updateTask(req: Request, res: Response): Promise<void> {
  try {
    const { taskId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const updates: UpdateTaskRequest = req.body;
    const task = await caseManagementService.updateTask(taskId, updates, userId);

    res.json({
      success: true,
      data: task,
      message: 'Task updated successfully',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update task';
    res.status(400).json({ success: false, error: message });
  }
}

/**
 * Deletes a task from the system.
 *
 * This endpoint permanently removes a task from its associated case. This operation
 * cannot be undone. The task will be removed from all task lists and any timeline
 * entries related to the task may be affected. Use with caution in production environments.
 *
 * @async
 * @param {Request} req - Express request object with route parameters
 * @param {string} req.params.taskId - Unique identifier of the task to delete
 * @param {Response} res - Express response object
 * @returns {Promise<void>} Resolves when response is sent
 *
 * @throws {Error} When task deletion fails due to non-existent task or database issues
 *
 * @remarks
 * This is a destructive operation. Consider implementing soft deletes or requiring
 * additional authorization for task deletion in production systems.
 *
 * @example
 * // DELETE /api/v1/case-management/tasks/task-789
 *
 * // Response (200):
 * {
 *   "success": true,
 *   "message": "Task deleted successfully"
 * }
 *
 * // Error Response (400):
 * {
 *   "success": false,
 *   "error": "Failed to delete task"
 * }
 */
export async function deleteTask(req: Request, res: Response): Promise<void> {
  try {
    const { taskId } = req.params;

    await caseManagementService.deleteTask(taskId);

    res.json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete task';
    res.status(400).json({ success: false, error: message });
  }
}

/**
 * Adds a comment to a specific case.
 *
 * This endpoint allows authenticated users to add comments to cases for collaboration,
 * documentation, and communication purposes. Comments are timestamped and associated
 * with the authenticated user, creating an audit trail of case discussions. Comments
 * can include rich text content and are displayed in chronological order.
 *
 * @async
 * @param {Request} req - Express request object with route parameters and comment data
 * @param {string} req.params.id - Unique identifier of the case to add the comment to
 * @param {CreateCommentRequest} req.body - Comment creation data (content, mentions, etc.)
 * @param {Object} req.user - Authenticated user object from authentication middleware
 * @param {string} req.user.id - ID of the authenticated user creating the comment
 * @param {Response} res - Express response object
 * @returns {Promise<void>} Resolves when response is sent
 *
 * @throws {Error} When comment creation fails due to validation errors, non-existent case, or database issues
 *
 * @example
 * // POST /api/v1/case-management/case-123/comments
 * // Request body:
 * {
 *   "content": "Investigation reveals that the issue originated from outdated SSL certificates"
 * }
 *
 * // Response (201):
 * {
 *   "success": true,
 *   "data": {
 *     "id": "comment-456",
 *     "case_id": "case-123",
 *     "user_id": "user-789",
 *     "content": "Investigation reveals that the issue originated from outdated SSL certificates",
 *     "created_at": "2025-10-24T12:30:00Z"
 *   },
 *   "message": "Comment added successfully"
 * }
 *
 * // Error Response (401):
 * {
 *   "success": false,
 *   "error": "Unauthorized"
 * }
 *
 * // Error Response (400):
 * {
 *   "success": false,
 *   "error": "Failed to add comment"
 * }
 */
export async function addComment(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const request: CreateCommentRequest = req.body;
    const comment = await caseManagementService.addComment(id, request, userId);

    res.status(201).json({
      success: true,
      data: comment,
      message: 'Comment added successfully',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to add comment';
    res.status(400).json({ success: false, error: message });
  }
}

/**
 * Retrieves all comments associated with a specific case.
 *
 * This endpoint returns a chronologically ordered list of all comments added to a case,
 * including comment content, author information, and timestamps. Comments provide context
 * and collaboration history for case investigations and decision-making processes.
 *
 * @async
 * @param {Request} req - Express request object with route parameters
 * @param {string} req.params.id - Unique identifier of the case whose comments to retrieve
 * @param {Response} res - Express response object
 * @returns {Promise<void>} Resolves when response is sent
 *
 * @throws {Error} When comment retrieval fails due to database issues
 *
 * @example
 * // GET /api/v1/case-management/case-123/comments
 *
 * // Response (200):
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "id": "comment-456",
 *       "case_id": "case-123",
 *       "user_id": "user-789",
 *       "content": "Investigation reveals outdated SSL certificates",
 *       "created_at": "2025-10-24T12:30:00Z"
 *     },
 *     {
 *       "id": "comment-457",
 *       "case_id": "case-123",
 *       "user_id": "user-101",
 *       "content": "Certificates have been updated",
 *       "created_at": "2025-10-24T14:00:00Z"
 *     }
 *   ],
 *   "count": 2
 * }
 *
 * // Error Response (500):
 * {
 *   "success": false,
 *   "error": "Failed to fetch comments"
 * }
 */
export async function getCaseComments(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const comments = await caseManagementService.getCaseComments(id);

    res.json({
      success: true,
      data: comments,
      count: comments.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch comments';
    res.status(500).json({ success: false, error: message });
  }
}

/**
 * Retrieves the chronological timeline of all events for a specific case.
 *
 * This endpoint returns a comprehensive, time-ordered history of all activities related
 * to a case, including case creation, status changes, task updates, comments, and other
 * significant events. The timeline provides a complete audit trail for case tracking and
 * post-incident analysis.
 *
 * @async
 * @param {Request} req - Express request object with route parameters
 * @param {string} req.params.id - Unique identifier of the case whose timeline to retrieve
 * @param {Response} res - Express response object
 * @returns {Promise<void>} Resolves when response is sent
 *
 * @throws {Error} When timeline retrieval fails due to database issues
 *
 * @remarks
 * The timeline includes various event types such as:
 * - Case creation and updates
 * - Status transitions
 * - Task creation and completion
 * - Comments and discussions
 * - Assignment changes
 * - Priority modifications
 *
 * @example
 * // GET /api/v1/case-management/case-123/timeline
 *
 * // Response (200):
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "id": "event-1",
 *       "case_id": "case-123",
 *       "event_type": "case_created",
 *       "user_id": "user-789",
 *       "description": "Case created",
 *       "timestamp": "2025-10-24T10:00:00Z"
 *     },
 *     {
 *       "id": "event-2",
 *       "case_id": "case-123",
 *       "event_type": "status_changed",
 *       "user_id": "user-789",
 *       "description": "Status changed from 'open' to 'in_progress'",
 *       "timestamp": "2025-10-24T11:00:00Z"
 *     },
 *     {
 *       "id": "event-3",
 *       "case_id": "case-123",
 *       "event_type": "comment_added",
 *       "user_id": "user-101",
 *       "description": "Comment added",
 *       "timestamp": "2025-10-24T12:30:00Z"
 *     }
 *   ],
 *   "count": 3
 * }
 *
 * // Error Response (500):
 * {
 *   "success": false,
 *   "error": "Failed to fetch timeline"
 * }
 */
export async function getCaseTimeline(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const timeline = await caseManagementService.getCaseTimeline(id);

    res.json({
      success: true,
      data: timeline,
      count: timeline.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch timeline';
    res.status(500).json({ success: false, error: message });
  }
}

/**
 * Creates a reusable case template for standardized case creation.
 *
 * This endpoint allows authenticated users to create templates that define preset
 * configurations for cases, including predefined tasks, checklists, categories, and
 * priorities. Templates accelerate case creation and ensure consistency across similar
 * incident types or investigation scenarios.
 *
 * @async
 * @param {Request} req - Express request object with template data
 * @param {CreateTemplateRequest} req.body - Template creation data (name, description, default fields, task templates)
 * @param {Object} req.user - Authenticated user object from authentication middleware
 * @param {string} req.user.id - ID of the authenticated user creating the template
 * @param {Response} res - Express response object
 * @returns {Promise<void>} Resolves when response is sent
 *
 * @throws {Error} When template creation fails due to validation errors or database issues
 *
 * @remarks
 * Templates can include:
 * - Predefined case categories and priorities
 * - Default task lists and workflows
 * - Standard field values
 * - Investigation checklists
 * - Response procedures
 *
 * @example
 * // POST /api/v1/case-management/templates
 * // Request body:
 * {
 *   "name": "Phishing Investigation Template",
 *   "description": "Standard template for investigating phishing incidents",
 *   "category": "security_incident",
 *   "priority": "high",
 *   "default_tasks": [
 *     {"title": "Identify affected users", "priority": "high"},
 *     {"title": "Analyze email headers", "priority": "medium"},
 *     {"title": "Block sender domains", "priority": "high"}
 *   ]
 * }
 *
 * // Response (201):
 * {
 *   "success": true,
 *   "data": {
 *     "id": "template-789",
 *     "name": "Phishing Investigation Template",
 *     "category": "security_incident",
 *     "created_by": "user-123",
 *     "created_at": "2025-10-24T10:00:00Z"
 *   },
 *   "message": "Template created successfully"
 * }
 *
 * // Error Response (401):
 * {
 *   "success": false,
 *   "error": "Unauthorized"
 * }
 *
 * // Error Response (400):
 * {
 *   "success": false,
 *   "error": "Failed to create template"
 * }
 */
export async function createTemplate(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const request: CreateTemplateRequest = req.body;
    const template = await caseManagementService.createTemplate(request, userId);

    res.status(201).json({
      success: true,
      data: template,
      message: 'Template created successfully',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create template';
    res.status(400).json({ success: false, error: message });
  }
}

/**
 * Retrieves all available case templates.
 *
 * This endpoint returns a list of all case templates that can be used for creating
 * new cases. Templates provide standardized configurations for common incident types,
 * investigation scenarios, and response procedures, enabling quick and consistent
 * case initialization.
 *
 * @async
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>} Resolves when response is sent
 *
 * @throws {Error} When template retrieval fails due to database issues
 *
 * @example
 * // GET /api/v1/case-management/templates
 *
 * // Response (200):
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "id": "template-789",
 *       "name": "Phishing Investigation Template",
 *       "description": "Standard template for investigating phishing incidents",
 *       "category": "security_incident",
 *       "created_by": "user-123",
 *       "created_at": "2025-10-24T10:00:00Z"
 *     },
 *     {
 *       "id": "template-790",
 *       "name": "Malware Analysis Template",
 *       "description": "Template for malware investigation and remediation",
 *       "category": "malware_incident",
 *       "created_by": "user-456",
 *       "created_at": "2025-10-23T14:00:00Z"
 *     }
 *   ],
 *   "count": 2
 * }
 *
 * // Error Response (500):
 * {
 *   "success": false,
 *   "error": "Failed to fetch templates"
 * }
 */
export async function getTemplates(req: Request, res: Response): Promise<void> {
  try {
    const templates = await caseManagementService.getTemplates();

    res.json({
      success: true,
      data: templates,
      count: templates.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch templates';
    res.status(500).json({ success: false, error: message });
  }
}

/**
 * Retrieves aggregated metrics and statistics for case management.
 *
 * This endpoint provides analytical insights into case data, including counts by status,
 * priority, category, and other dimensions. Metrics support optional filtering to analyze
 * specific subsets of cases. This data is useful for dashboards, reporting, and performance
 * monitoring of security operations.
 *
 * @async
 * @param {Request} req - Express request object with optional query parameters
 * @param {string} [req.query.status] - Filter metrics by case status
 * @param {string} [req.query.priority] - Filter metrics by priority level
 * @param {string} [req.query.category] - Filter metrics by case category
 * @param {string} [req.query.assignee_id] - Filter metrics by assigned user ID
 * @param {Response} res - Express response object
 * @returns {Promise<void>} Resolves when response is sent
 *
 * @throws {Error} When metrics calculation fails due to database issues
 *
 * @remarks
 * Metrics typically include:
 * - Total case counts by status (open, in progress, closed, etc.)
 * - Priority distribution (low, medium, high, critical)
 * - Category breakdown (security incident, investigation, etc.)
 * - Average resolution time
 * - Overdue case counts
 * - Assignment statistics
 *
 * @example
 * // GET /api/v1/case-management/metrics?status=open&priority=high
 *
 * // Response (200):
 * {
 *   "success": true,
 *   "data": {
 *     "total_cases": 45,
 *     "by_status": {
 *       "open": 12,
 *       "in_progress": 20,
 *       "resolved": 10,
 *       "closed": 3
 *     },
 *     "by_priority": {
 *       "low": 5,
 *       "medium": 15,
 *       "high": 20,
 *       "critical": 5
 *     },
 *     "by_category": {
 *       "security_incident": 25,
 *       "investigation": 12,
 *       "compliance_review": 8
 *     },
 *     "overdue_count": 7,
 *     "avg_resolution_time_hours": 48.5
 *   }
 * }
 *
 * // Error Response (500):
 * {
 *   "success": false,
 *   "error": "Failed to fetch metrics"
 * }
 */
export async function getMetrics(req: Request, res: Response): Promise<void> {
  try {
    const filters: CaseFilters = {
      status: req.query.status as any,
      priority: req.query.priority as any,
      category: req.query.category as any,
      assignee_id: req.query.assignee_id as string,
    };

    const metrics = await caseManagementService.getMetrics(filters);

    res.json({
      success: true,
      data: metrics,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch metrics';
    res.status(500).json({ success: false, error: message });
  }
}
