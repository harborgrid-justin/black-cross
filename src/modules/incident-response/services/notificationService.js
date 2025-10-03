/**
 * Notification Service
 * Multi-channel communication and notification system
 */

const { Notification, NotificationChannel, NotificationStatus } = require('../models');
const dataStore = require('./dataStore');
const timelineService = require('./timelineService');
const { EventType } = require('../models');

class NotificationService {
  /**
   * Send notification
   */
  async sendNotification(data) {
    const notification = new Notification(data);

    try {
      // Send based on channel
      switch (notification.channel) {
        case NotificationChannel.EMAIL:
          await this.sendEmail(notification);
          break;
        case NotificationChannel.SMS:
          await this.sendSMS(notification);
          break;
        case NotificationChannel.SLACK:
          await this.sendSlack(notification);
          break;
        case NotificationChannel.TEAMS:
          await this.sendTeams(notification);
          break;
        case NotificationChannel.WEBHOOK:
          await this.sendWebhook(notification);
          break;
        case NotificationChannel.IN_APP:
          await this.sendInApp(notification);
          break;
        default:
          throw new Error('Unknown notification channel');
      }

      notification.markSent();
      
      // Simulate delivery confirmation
      setTimeout(() => {
        notification.markDelivered();
      }, 1000);

    } catch (error) {
      notification.markFailed(error.message);
      
      // Retry logic
      if (notification.retry_count < notification.max_retries) {
        notification.incrementRetry();
        // Schedule retry (in production, use a job queue)
        setTimeout(() => this.sendNotification(notification), 5000);
      }
    }

    await dataStore.createNotification(notification);

    // Create timeline event if incident-related
    if (data.incident_id) {
      await timelineService.createEvent({
        incident_id: data.incident_id,
        type: EventType.NOTIFICATION_SENT,
        title: 'Notification Sent',
        description: `Notification sent via ${notification.channel} to ${notification.recipients.length} recipient(s)`,
        metadata: {
          notification_id: notification.id,
          channel: notification.channel,
          recipients: notification.recipients
        }
      });
    }

    return notification;
  }

  /**
   * Send email notification
   */
  async sendEmail(notification) {
    // Simulate email sending
    console.log(`Sending email to ${notification.recipients.join(', ')}`);
    console.log(`Subject: ${notification.subject}`);
    console.log(`Message: ${notification.message}`);
    
    // In production, integrate with SMTP service
    await this.delay(500);
    
    return { success: true, channel: 'email' };
  }

  /**
   * Send SMS notification
   */
  async sendSMS(notification) {
    // Simulate SMS sending
    console.log(`Sending SMS to ${notification.recipients.join(', ')}`);
    console.log(`Message: ${notification.message}`);
    
    // In production, integrate with SMS gateway (Twilio, etc.)
    await this.delay(300);
    
    return { success: true, channel: 'sms' };
  }

  /**
   * Send Slack notification
   */
  async sendSlack(notification) {
    // Simulate Slack notification
    console.log(`Posting to Slack channels: ${notification.recipients.join(', ')}`);
    console.log(`Message: ${notification.message}`);
    
    // In production, integrate with Slack API
    await this.delay(400);
    
    return { success: true, channel: 'slack' };
  }

  /**
   * Send Microsoft Teams notification
   */
  async sendTeams(notification) {
    // Simulate Teams notification
    console.log(`Posting to Teams channels: ${notification.recipients.join(', ')}`);
    console.log(`Message: ${notification.message}`);
    
    // In production, integrate with Teams webhook
    await this.delay(400);
    
    return { success: true, channel: 'teams' };
  }

  /**
   * Send webhook notification
   */
  async sendWebhook(notification) {
    // Simulate webhook call
    console.log(`Calling webhooks: ${notification.recipients.join(', ')}`);
    
    // In production, make HTTP POST to webhook URLs
    await this.delay(200);
    
    return { success: true, channel: 'webhook' };
  }

  /**
   * Send in-app notification
   */
  async sendInApp(notification) {
    // Simulate in-app notification
    console.log(`Creating in-app notification for users: ${notification.recipients.join(', ')}`);
    
    // In production, would use WebSocket or push notification service
    await this.delay(100);
    
    return { success: true, channel: 'in_app' };
  }

  /**
   * Send bulk notifications
   */
  async sendBulkNotifications(notifications) {
    const results = [];
    
    for (const notificationData of notifications) {
      try {
        const notification = await this.sendNotification(notificationData);
        results.push({ success: true, notification_id: notification.id });
      } catch (error) {
        results.push({ success: false, error: error.message, data: notificationData });
      }
    }

    return results;
  }

  /**
   * Get notification by ID
   */
  async getNotification(id) {
    return await dataStore.getNotification(id);
  }

  /**
   * List notifications for incident
   */
  async listNotificationsByIncident(incidentId) {
    return await dataStore.listNotificationsByIncident(incidentId);
  }

  /**
   * Get notification templates
   */
  async getTemplates() {
    return [
      {
        id: 'incident_created',
        name: 'Incident Created',
        subject: 'New Incident: {{incident_title}}',
        message: 'A new incident has been created:\n\nTitle: {{incident_title}}\nPriority: {{priority}}\nSeverity: {{severity}}\n\nPlease review and take appropriate action.'
      },
      {
        id: 'incident_assigned',
        name: 'Incident Assigned',
        subject: 'Incident Assigned: {{incident_title}}',
        message: 'An incident has been assigned to you:\n\nTitle: {{incident_title}}\nPriority: {{priority}}\nDue: {{sla_deadline}}\n\nPlease begin investigation immediately.'
      },
      {
        id: 'incident_escalated',
        name: 'Incident Escalated',
        subject: 'URGENT: Incident Escalated - {{incident_title}}',
        message: 'An incident has been escalated:\n\nTitle: {{incident_title}}\nPriority: {{priority}}\nReason: {{escalation_reason}}\n\nImmediate attention required.'
      },
      {
        id: 'sla_warning',
        name: 'SLA Warning',
        subject: 'SLA Warning: {{incident_title}}',
        message: 'SLA deadline approaching for incident:\n\nTitle: {{incident_title}}\nTime Remaining: {{time_remaining}}\n\nPlease expedite resolution.'
      },
      {
        id: 'incident_resolved',
        name: 'Incident Resolved',
        subject: 'Incident Resolved: {{incident_title}}',
        message: 'Incident has been resolved:\n\nTitle: {{incident_title}}\nResolution Time: {{resolution_time}}\n\nThank you for your prompt response.'
      }
    ];
  }

  /**
   * Apply template to notification
   */
  applyTemplate(templateId, data) {
    // In production, fetch template from database
    const templates = {
      incident_created: {
        subject: `New Incident: ${data.incident_title}`,
        message: `A new incident has been created:\n\nTitle: ${data.incident_title}\nPriority: ${data.priority}\nSeverity: ${data.severity}`
      }
    };

    return templates[templateId] || { subject: '', message: '' };
  }

  /**
   * Configure notification preferences
   */
  async setUserPreferences(userId, preferences) {
    // In production, store in database
    return {
      user_id: userId,
      preferences: {
        email: preferences.email !== false,
        sms: preferences.sms || false,
        slack: preferences.slack || false,
        in_app: preferences.in_app !== false,
        priority_filter: preferences.priority_filter || ['critical', 'high'],
        quiet_hours: preferences.quiet_hours || { enabled: false, start: '22:00', end: '08:00' }
      }
    };
  }

  /**
   * Helper delay function
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats(incidentId) {
    const notifications = await dataStore.listNotificationsByIncident(incidentId);

    const statusDistribution = notifications.reduce((acc, n) => {
      acc[n.status] = (acc[n.status] || 0) + 1;
      return acc;
    }, {});

    const channelDistribution = notifications.reduce((acc, n) => {
      acc[n.channel] = (acc[n.channel] || 0) + 1;
      return acc;
    }, {});

    return {
      total_notifications: notifications.length,
      status_distribution: statusDistribution,
      channel_distribution: channelDistribution,
      failed_count: notifications.filter(n => n.status === NotificationStatus.FAILED).length,
      delivered_count: notifications.filter(n => n.status === NotificationStatus.DELIVERED).length
    };
  }
}

module.exports = new NotificationService();
