/**
 * Notification Model
 * Model for incident notifications and communications
 */

const { v4: uuidv4 } = require('uuid');

// Notification channel enum
const NotificationChannel = {
  EMAIL: 'email',
  SMS: 'sms',
  SLACK: 'slack',
  TEAMS: 'teams',
  WEBHOOK: 'webhook',
  IN_APP: 'in_app'
};

// Notification status enum
const NotificationStatus = {
  PENDING: 'pending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  FAILED: 'failed',
  RETRYING: 'retrying'
};

// Notification priority enum
const NotificationPriority = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

/**
 * Notification class for incident communications
 */
class Notification {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.incident_id = data.incident_id;
    this.channel = data.channel || NotificationChannel.EMAIL;
    this.priority = data.priority || NotificationPriority.MEDIUM;
    this.status = data.status || NotificationStatus.PENDING;
    this.subject = data.subject || '';
    this.message = data.message || '';
    this.recipients = data.recipients || [];
    this.sender = data.sender || null;
    this.template_id = data.template_id || null;
    this.template_data = data.template_data || {};
    this.scheduled_at = data.scheduled_at || null;
    this.sent_at = data.sent_at || null;
    this.delivered_at = data.delivered_at || null;
    this.retry_count = data.retry_count || 0;
    this.max_retries = data.max_retries || 3;
    this.error_message = data.error_message || null;
    this.metadata = data.metadata || {};
    this.created_at = data.created_at || new Date();
  }

  /**
   * Mark as sent
   */
  markSent() {
    this.status = NotificationStatus.SENT;
    this.sent_at = new Date();
  }

  /**
   * Mark as delivered
   */
  markDelivered() {
    this.status = NotificationStatus.DELIVERED;
    this.delivered_at = new Date();
  }

  /**
   * Mark as failed
   */
  markFailed(error) {
    this.status = NotificationStatus.FAILED;
    this.error_message = error;
  }

  /**
   * Increment retry count
   */
  incrementRetry() {
    this.retry_count++;
    if (this.retry_count < this.max_retries) {
      this.status = NotificationStatus.RETRYING;
    } else {
      this.status = NotificationStatus.FAILED;
    }
  }

  toJSON() {
    return {
      id: this.id,
      incident_id: this.incident_id,
      channel: this.channel,
      priority: this.priority,
      status: this.status,
      subject: this.subject,
      message: this.message,
      recipients: this.recipients,
      sender: this.sender,
      template_id: this.template_id,
      template_data: this.template_data,
      scheduled_at: this.scheduled_at,
      sent_at: this.sent_at,
      delivered_at: this.delivered_at,
      retry_count: this.retry_count,
      max_retries: this.max_retries,
      error_message: this.error_message,
      metadata: this.metadata,
      created_at: this.created_at
    };
  }
}

module.exports = {
  Notification,
  NotificationChannel,
  NotificationStatus,
  NotificationPriority
};
