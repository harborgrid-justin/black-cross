/**
 * Notification System - Controller
 * HTTP request handlers for notification operations
 */

import type { Request, Response } from 'express';
import { notificationService } from './service';
import { CreateNotificationRequest, CreateRuleRequest, UpdatePreferencesRequest } from './types';

/**
 * Create a new notification
 */
export async function createNotification(req: Request, res: Response): Promise<void> {
  try {
    const request: CreateNotificationRequest = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const notifications = await notificationService.createNotification(request, userId);

    res.status(201).json({
      success: true,
      data: notifications,
      message: `Created ${notifications.length} notification(s)`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create notification';
    res.status(400).json({ success: false, error: message });
  }
}

/**
 * Get user's notifications
 */
export async function getUserNotifications(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const filters = {
      unread: req.query.unread === 'true',
      category: req.query.category as any,
      severity: req.query.severity as any,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
    };

    const notifications = await notificationService.getUserNotifications(userId, filters);

    res.json({
      success: true,
      data: notifications,
      count: notifications.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch notifications';
    res.status(500).json({ success: false, error: message });
  }
}

/**
 * Get notification statistics
 */
export async function getUserStats(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const stats = await notificationService.getUserStats(userId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch statistics';
    res.status(500).json({ success: false, error: message });
  }
}

/**
 * Mark notification as read
 */
export async function markAsRead(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const notification = await notificationService.markAsRead(id, userId);

    res.json({
      success: true,
      data: notification,
      message: 'Notification marked as read',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to mark as read';
    res.status(400).json({ success: false, error: message });
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const count = await notificationService.markAllAsRead(userId);

    res.json({
      success: true,
      message: `Marked ${count} notification(s) as read`,
      count,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to mark all as read';
    res.status(500).json({ success: false, error: message });
  }
}

/**
 * Delete a notification
 */
export async function deleteNotification(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    await notificationService.deleteNotification(id, userId);

    res.json({
      success: true,
      message: 'Notification deleted',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete notification';
    res.status(400).json({ success: false, error: message });
  }
}

/**
 * Get user preferences
 */
export async function getPreferences(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const preferences = await notificationService.getPreferences(userId);

    res.json({
      success: true,
      data: preferences,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch preferences';
    res.status(500).json({ success: false, error: message });
  }
}

/**
 * Update user preferences
 */
export async function updatePreferences(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const updates: UpdatePreferencesRequest = req.body;
    const preferences = await notificationService.updatePreferences(userId, updates);

    res.json({
      success: true,
      data: preferences,
      message: 'Preferences updated',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update preferences';
    res.status(400).json({ success: false, error: message });
  }
}

/**
 * Create a notification rule
 */
export async function createRule(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const request: CreateRuleRequest = req.body;
    const rule = await notificationService.createRule(request, userId);

    res.status(201).json({
      success: true,
      data: rule,
      message: 'Notification rule created',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create rule';
    res.status(400).json({ success: false, error: message });
  }
}

/**
 * Get all notification rules
 */
export async function getRules(req: Request, res: Response): Promise<void> {
  try {
    const rules = await notificationService.getRules();

    res.json({
      success: true,
      data: rules,
      count: rules.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch rules';
    res.status(500).json({ success: false, error: message });
  }
}

/**
 * Update a notification rule
 */
export async function updateRule(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const updates = req.body;

    const rule = await notificationService.updateRule(id, updates);

    res.json({
      success: true,
      data: rule,
      message: 'Notification rule updated',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update rule';
    res.status(400).json({ success: false, error: message });
  }
}

/**
 * Delete a notification rule
 */
export async function deleteRule(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    await notificationService.deleteRule(id);

    res.json({
      success: true,
      message: 'Notification rule deleted',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete rule';
    res.status(400).json({ success: false, error: message });
  }
}
