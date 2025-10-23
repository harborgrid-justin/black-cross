/**
 * Case Management - Controller
 * HTTP request handlers for case management operations
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
 * Create a new case
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
 * Get all cases with optional filters
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
 * Get a single case by ID
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
 * Update a case
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
 * Delete a case
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
 * Create a task for a case
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
 * Get tasks for a case
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
 * Update a task
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
 * Delete a task
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
 * Add comment to a case
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
 * Get comments for a case
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
 * Get case timeline
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
 * Create case template
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
 * Get all templates
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
 * Get case metrics
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
