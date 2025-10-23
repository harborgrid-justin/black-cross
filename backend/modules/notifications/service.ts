/**
 * Notification System - Service Layer
 * Business logic for notifications and alerts
 */

import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from 'events';
import {
  Notification,
  NotificationPreferences,
  NotificationRule,
  NotificationStats,
  CreateNotificationRequest,
  NotificationSeverity,
  NotificationCategory,
  NotificationChannel,
  NotificationStatus,
  CreateRuleRequest,
  UpdatePreferencesRequest,
} from './types';

/**
 * In-memory storage for demo purposes
 * In production, this would use a database
 */
class NotificationService extends EventEmitter {
  private notifications: Map<string, Notification> = new Map();
  private preferences: Map<string, NotificationPreferences> = new Map();
  private rules: Map<string, NotificationRule> = new Map();

  /**
   * Create a new notification
   */
  async createNotification(
    request: CreateNotificationRequest,
    created_by: string
  ): Promise<Notification[]> {
    const createdNotifications: Notification[] = [];

    for (const userId of request.user_ids) {
      // Check user preferences
      const prefs = this.preferences.get(userId);
      
      // Apply preference filters
      if (prefs && !this.shouldSendNotification(request, prefs)) {
        continue;
      }

      const notification: Notification = {
        id: uuidv4(),
        title: request.title,
        message: request.message,
        severity: request.severity,
        category: request.category,
        user_id: userId,
        entity_type: request.entity_type,
        entity_id: request.entity_id,
        channels: request.channels || [NotificationChannel.IN_APP, NotificationChannel.WEBSOCKET],
        status: NotificationStatus.PENDING,
        metadata: request.metadata || {},
        created_at: new Date(),
        expires_at: request.expires_at,
      };

      this.notifications.set(notification.id, notification);
      createdNotifications.push(notification);

      // Send notification through channels
      await this.sendThroughChannels(notification);

      // Emit event for real-time updates
      this.emit('notification:created', notification);
    }

    return createdNotifications;
  }

  /**
   * Get notifications for a user
   */
  async getUserNotifications(
    userId: string,
    filters?: {
      unread?: boolean;
      category?: NotificationCategory;
      severity?: NotificationSeverity;
      limit?: number;
    }
  ): Promise<Notification[]> {
    let userNotifications = Array.from(this.notifications.values())
      .filter((n) => n.user_id === userId);

    // Apply filters
    if (filters?.unread) {
      userNotifications = userNotifications.filter((n) => !n.read_at);
    }

    if (filters?.category) {
      userNotifications = userNotifications.filter((n) => n.category === filters.category);
    }

    if (filters?.severity) {
      userNotifications = userNotifications.filter((n) => n.severity === filters.severity);
    }

    // Sort by created_at descending
    userNotifications.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());

    // Apply limit
    if (filters?.limit) {
      userNotifications = userNotifications.slice(0, filters.limit);
    }

    return userNotifications;
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<Notification> {
    const notification = this.notifications.get(notificationId);

    if (!notification) {
      throw new Error('Notification not found');
    }

    if (notification.user_id !== userId) {
      throw new Error('Access denied');
    }

    notification.status = NotificationStatus.READ;
    notification.read_at = new Date();

    this.notifications.set(notificationId, notification);
    this.emit('notification:read', notification);

    return notification;
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<number> {
    let count = 0;

    for (const notification of this.notifications.values()) {
      if (notification.user_id === userId && !notification.read_at) {
        notification.status = NotificationStatus.READ;
        notification.read_at = new Date();
        this.notifications.set(notification.id, notification);
        count++;
      }
    }

    this.emit('notifications:bulk_read', { userId, count });
    return count;
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    const notification = this.notifications.get(notificationId);

    if (!notification) {
      throw new Error('Notification not found');
    }

    if (notification.user_id !== userId) {
      throw new Error('Access denied');
    }

    this.notifications.delete(notificationId);
    this.emit('notification:deleted', { notificationId, userId });
  }

  /**
   * Get notification statistics for a user
   */
  async getUserStats(userId: string): Promise<NotificationStats> {
    const userNotifications = Array.from(this.notifications.values())
      .filter((n) => n.user_id === userId);

    const stats: NotificationStats = {
      total: userNotifications.length,
      unread: userNotifications.filter((n) => !n.read_at).length,
      by_severity: {
        [NotificationSeverity.INFO]: 0,
        [NotificationSeverity.SUCCESS]: 0,
        [NotificationSeverity.WARNING]: 0,
        [NotificationSeverity.ERROR]: 0,
        [NotificationSeverity.CRITICAL]: 0,
      },
      by_category: {
        [NotificationCategory.THREAT]: 0,
        [NotificationCategory.INCIDENT]: 0,
        [NotificationCategory.VULNERABILITY]: 0,
        [NotificationCategory.COMPLIANCE]: 0,
        [NotificationCategory.SYSTEM]: 0,
        [NotificationCategory.USER]: 0,
        [NotificationCategory.AUTOMATION]: 0,
      },
      by_status: {
        [NotificationStatus.PENDING]: 0,
        [NotificationStatus.SENT]: 0,
        [NotificationStatus.DELIVERED]: 0,
        [NotificationStatus.READ]: 0,
        [NotificationStatus.FAILED]: 0,
      },
    };

    userNotifications.forEach((n) => {
      stats.by_severity[n.severity]++;
      stats.by_category[n.category]++;
      stats.by_status[n.status]++;
    });

    return stats;
  }

  /**
   * Get user preferences
   */
  async getPreferences(userId: string): Promise<NotificationPreferences> {
    let prefs = this.preferences.get(userId);

    if (!prefs) {
      // Create default preferences
      prefs = {
        user_id: userId,
        enabled: true,
        channels: [NotificationChannel.IN_APP, NotificationChannel.WEBSOCKET],
        categories: Object.values(NotificationCategory),
        severity_threshold: NotificationSeverity.INFO,
        email_frequency: 'immediate',
      };
      this.preferences.set(userId, prefs);
    }

    return prefs;
  }

  /**
   * Update user preferences
   */
  async updatePreferences(
    userId: string,
    updates: UpdatePreferencesRequest
  ): Promise<NotificationPreferences> {
    const prefs = await this.getPreferences(userId);

    Object.assign(prefs, updates);
    this.preferences.set(userId, prefs);

    this.emit('preferences:updated', prefs);
    return prefs;
  }

  /**
   * Create a notification rule
   */
  async createRule(request: CreateRuleRequest, userId: string): Promise<NotificationRule> {
    const rule: NotificationRule = {
      id: uuidv4(),
      name: request.name,
      description: request.description,
      enabled: request.enabled,
      event_type: request.event_type,
      conditions: request.conditions,
      notification_template: request.notification_template,
      target_users: request.target_users,
      target_roles: request.target_roles,
      created_by: userId,
      created_at: new Date(),
      updated_at: new Date(),
    };

    this.rules.set(rule.id, rule);
    this.emit('rule:created', rule);

    return rule;
  }

  /**
   * Get all notification rules
   */
  async getRules(): Promise<NotificationRule[]> {
    return Array.from(this.rules.values());
  }

  /**
   * Update a notification rule
   */
  async updateRule(ruleId: string, updates: Partial<NotificationRule>): Promise<NotificationRule> {
    const rule = this.rules.get(ruleId);

    if (!rule) {
      throw new Error('Rule not found');
    }

    Object.assign(rule, updates, { updated_at: new Date() });
    this.rules.set(ruleId, rule);

    this.emit('rule:updated', rule);
    return rule;
  }

  /**
   * Delete a notification rule
   */
  async deleteRule(ruleId: string): Promise<void> {
    const rule = this.rules.get(ruleId);

    if (!rule) {
      throw new Error('Rule not found');
    }

    this.rules.delete(ruleId);
    this.emit('rule:deleted', { ruleId });
  }

  /**
   * Process event and trigger rules
   */
  async processEvent(eventType: string, eventData: any): Promise<void> {
    const matchingRules = Array.from(this.rules.values())
      .filter((rule) => rule.enabled && rule.event_type === eventType);

    for (const rule of matchingRules) {
      // Check if conditions match
      if (this.evaluateConditions(rule.conditions, eventData)) {
        // Create notification from template
        const userIds = rule.target_users || [];

        await this.createNotification(
          {
            title: this.interpolate(rule.notification_template.title, eventData),
            message: this.interpolate(rule.notification_template.message, eventData),
            severity: rule.notification_template.severity,
            category: rule.notification_template.category,
            user_ids: userIds,
            channels: rule.notification_template.channels,
            metadata: { rule_id: rule.id, event_data: eventData },
          },
          rule.created_by
        );
      }
    }
  }

  /**
   * Helper: Check if notification should be sent based on preferences
   */
  private shouldSendNotification(
    request: CreateNotificationRequest,
    prefs: NotificationPreferences
  ): boolean {
    if (!prefs.enabled) {
      return false;
    }

    // Check category filter
    if (!prefs.categories.includes(request.category)) {
      return false;
    }

    // Check severity threshold
    const severityLevels = {
      [NotificationSeverity.INFO]: 0,
      [NotificationSeverity.SUCCESS]: 1,
      [NotificationSeverity.WARNING]: 2,
      [NotificationSeverity.ERROR]: 3,
      [NotificationSeverity.CRITICAL]: 4,
    };

    if (severityLevels[request.severity] < severityLevels[prefs.severity_threshold]) {
      return false;
    }

    // Check quiet hours
    if (prefs.quiet_hours) {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      if (currentTime >= prefs.quiet_hours.start && currentTime <= prefs.quiet_hours.end) {
        return false;
      }
    }

    return true;
  }

  /**
   * Helper: Send notification through configured channels
   */
  private async sendThroughChannels(notification: Notification): Promise<void> {
    for (const channel of notification.channels) {
      try {
        switch (channel) {
          case NotificationChannel.WEBSOCKET:
            this.emit('notification:websocket', notification);
            break;
          case NotificationChannel.EMAIL:
            // Email sending would be implemented here
            break;
          case NotificationChannel.WEBHOOK:
            // Webhook calling would be implemented here
            break;
          case NotificationChannel.IN_APP:
            // In-app notification (already stored)
            break;
        }

        notification.status = NotificationStatus.SENT;
        notification.sent_at = new Date();
      } catch (error) {
        notification.status = NotificationStatus.FAILED;
        console.error(`Failed to send notification via ${channel}:`, error);
      }
    }

    this.notifications.set(notification.id, notification);
  }

  /**
   * Helper: Evaluate rule conditions
   */
  private evaluateConditions(conditions: Record<string, any>, data: any): boolean {
    // Simple condition evaluation
    // In production, this would be more sophisticated
    for (const [key, value] of Object.entries(conditions)) {
      if (data[key] !== value) {
        return false;
      }
    }
    return true;
  }

  /**
   * Helper: Interpolate template variables
   */
  private interpolate(template: string, data: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => data[key] || '');
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
