/**
 * @fileoverview Notification System API service.
 * 
 * Provides methods for managing real-time notifications including creation,
 * preferences, rules, and statistics.
 * 
 * @module services/notificationService
 */

import { apiClient } from './api';
import type { ApiResponse, PaginatedResponse } from '@/types';

/**
 * Notification severity levels
 */
export enum NotificationSeverity {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

/**
 * Notification categories for grouping and filtering
 */
export enum NotificationCategory {
  THREAT = 'threat',
  INCIDENT = 'incident',
  VULNERABILITY = 'vulnerability',
  COMPLIANCE = 'compliance',
  SYSTEM = 'system',
  USER = 'user',
  AUTOMATION = 'automation',
}

/**
 * Notification delivery channels
 */
export enum NotificationChannel {
  IN_APP = 'in_app',
  EMAIL = 'email',
  WEBHOOK = 'webhook',
  WEBSOCKET = 'websocket',
}

/**
 * Notification status
 */
export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
}

/**
 * Core notification interface
 */
export interface Notification {
  id: string;
  title: string;
  message: string;
  severity: NotificationSeverity;
  category: NotificationCategory;
  user_id: string;
  entity_type?: string;
  entity_id?: string;
  channels: NotificationChannel[];
  status: NotificationStatus;
  metadata?: Record<string, any>;
  created_at: string;
  read_at?: string;
  sent_at?: string;
  expires_at?: string;
}

/**
 * Notification preferences per user
 */
export interface NotificationPreferences {
  user_id: string;
  enabled: boolean;
  channels: NotificationChannel[];
  categories: NotificationCategory[];
  severity_threshold: NotificationSeverity;
  quiet_hours?: {
    start: string;
    end: string;
  };
  email_frequency?: 'immediate' | 'hourly' | 'daily' | 'weekly';
  email_address?: string;
  webhook_url?: string;
}

/**
 * Notification rule for automatic notifications
 */
export interface NotificationRule {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  event_type: string;
  conditions: Record<string, any>;
  notification_template: {
    title: string;
    message: string;
    severity: NotificationSeverity;
    category: NotificationCategory;
    channels: NotificationChannel[];
  };
  target_users?: string[];
  target_roles?: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

/**
 * Notification statistics
 */
export interface NotificationStats {
  total: number;
  unread: number;
  by_severity: Record<NotificationSeverity, number>;
  by_category: Record<NotificationCategory, number>;
  by_status: Record<NotificationStatus, number>;
}

export interface CreateNotificationRequest {
  title: string;
  message: string;
  severity: NotificationSeverity;
  category: NotificationCategory;
  user_ids: string[];
  channels?: NotificationChannel[];
  entity_type?: string;
  entity_id?: string;
  metadata?: Record<string, any>;
  expires_at?: string;
}

export interface CreateRuleRequest {
  name: string;
  description?: string;
  enabled: boolean;
  event_type: string;
  conditions: Record<string, any>;
  notification_template: {
    title: string;
    message: string;
    severity: NotificationSeverity;
    category: NotificationCategory;
    channels: NotificationChannel[];
  };
  target_users?: string[];
  target_roles?: string[];
}

/**
 * Service for handling notification API operations.
 * 
 * @namespace notificationService
 */
export const notificationService = {
  /**
   * Creates a new notification.
   * 
   * @async
   * @param {CreateNotificationRequest} data - Notification data
   * @returns {Promise<ApiResponse<Notification>>} Created notification
   */
  async createNotification(data: CreateNotificationRequest): Promise<ApiResponse<Notification>> {
    return apiClient.post<ApiResponse<Notification>>('/notifications', data);
  },

  /**
   * Retrieves all notifications for the current user.
   * 
   * @async
   * @param {object} [filters] - Optional filters
   * @returns {Promise<PaginatedResponse<Notification>>} Paginated notifications
   */
  async getNotifications(filters?: {
    severity?: NotificationSeverity;
    category?: NotificationCategory;
    status?: NotificationStatus;
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<Notification>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    return apiClient.get<PaginatedResponse<Notification>>(
      `/notifications?${params.toString()}`
    );
  },

  /**
   * Gets notification statistics for the current user.
   * 
   * @async
   * @returns {Promise<ApiResponse<NotificationStats>>} Notification statistics
   */
  async getStats(): Promise<ApiResponse<NotificationStats>> {
    return apiClient.get<ApiResponse<NotificationStats>>('/notifications/stats');
  },

  /**
   * Marks a notification as read.
   * 
   * @async
   * @param {string} id - Notification ID
   * @returns {Promise<ApiResponse<Notification>>} Updated notification
   */
  async markAsRead(id: string): Promise<ApiResponse<Notification>> {
    return apiClient.put<ApiResponse<Notification>>(`/notifications/${id}/read`, {});
  },

  /**
   * Marks all notifications as read.
   * 
   * @async
   * @returns {Promise<ApiResponse<void>>} Empty response
   */
  async markAllAsRead(): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>('/notifications/mark-all-read', {});
  },

  /**
   * Deletes a notification.
   * 
   * @async
   * @param {string} id - Notification ID
   * @returns {Promise<ApiResponse<void>>} Empty response
   */
  async deleteNotification(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/notifications/${id}`);
  },

  /**
   * Gets notification preferences for the current user.
   * 
   * @async
   * @returns {Promise<ApiResponse<NotificationPreferences>>} User preferences
   */
  async getPreferences(): Promise<ApiResponse<NotificationPreferences>> {
    return apiClient.get<ApiResponse<NotificationPreferences>>('/notifications/preferences');
  },

  /**
   * Updates notification preferences for the current user.
   * 
   * @async
   * @param {Partial<NotificationPreferences>} data - Updated preferences
   * @returns {Promise<ApiResponse<NotificationPreferences>>} Updated preferences
   */
  async updatePreferences(data: Partial<NotificationPreferences>): Promise<ApiResponse<NotificationPreferences>> {
    return apiClient.put<ApiResponse<NotificationPreferences>>('/notifications/preferences', data);
  },

  /**
   * Creates a notification rule.
   * 
   * @async
   * @param {CreateRuleRequest} data - Rule data
   * @returns {Promise<ApiResponse<NotificationRule>>} Created rule
   */
  async createRule(data: CreateRuleRequest): Promise<ApiResponse<NotificationRule>> {
    return apiClient.post<ApiResponse<NotificationRule>>('/notifications/rules', data);
  },

  /**
   * Gets all notification rules.
   * 
   * @async
   * @returns {Promise<ApiResponse<NotificationRule[]>>} List of rules
   */
  async getRules(): Promise<ApiResponse<NotificationRule[]>> {
    return apiClient.get<ApiResponse<NotificationRule[]>>('/notifications/rules');
  },

  /**
   * Updates a notification rule.
   * 
   * @async
   * @param {string} id - Rule ID
   * @param {Partial<CreateRuleRequest>} data - Updated rule data
   * @returns {Promise<ApiResponse<NotificationRule>>} Updated rule
   */
  async updateRule(id: string, data: Partial<CreateRuleRequest>): Promise<ApiResponse<NotificationRule>> {
    return apiClient.put<ApiResponse<NotificationRule>>(`/notifications/rules/${id}`, data);
  },

  /**
   * Deletes a notification rule.
   * 
   * @async
   * @param {string} id - Rule ID
   * @returns {Promise<ApiResponse<void>>} Empty response
   */
  async deleteRule(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/notifications/rules/${id}`);
  },
};
