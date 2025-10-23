/**
 * Notification System - Type Definitions
 * Real-time notification and alerting system
 */

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
  created_at: Date;
  read_at?: Date;
  sent_at?: Date;
  expires_at?: Date;
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
    start: string; // HH:MM format
    end: string;   // HH:MM format
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
  created_at: Date;
  updated_at: Date;
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

/**
 * Request/Response types
 */
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
  expires_at?: Date;
}

export interface UpdatePreferencesRequest {
  enabled?: boolean;
  channels?: NotificationChannel[];
  categories?: NotificationCategory[];
  severity_threshold?: NotificationSeverity;
  quiet_hours?: {
    start: string;
    end: string;
  };
  email_frequency?: 'immediate' | 'hourly' | 'daily' | 'weekly';
  email_address?: string;
  webhook_url?: string;
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
