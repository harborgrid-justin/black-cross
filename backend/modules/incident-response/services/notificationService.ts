/**
 * Notification Service
 * Communication and notification system
 */

import Incident from '../models/Incident';
import logger from '../utils/logger';

class NotificationService {
  /**
   * Send notification for an incident
   */
  async sendNotification(incidentId, notificationData, userId) {
    try {
      const incident = await Incident.findOne({ $or: [{ id: incidentId }, { ticket_number: incidentId }] });
      if (!incident) {
        throw new Error('Incident not found');
      }

      const notification = {
        channel: notificationData.channel || 'email',
        recipient: notificationData.recipient,
        message: notificationData.message || this._generateDefaultMessage(incident),
        sent_at: new Date(),
        sent_by: userId,
      };

      incident.communications.push(notification);
      incident.timeline.push({
        event_type: 'updated',
        description: `Notification sent to ${notification.recipient} via ${notification.channel}`,
        user_id: userId,
      });

      await incident.save();
      logger.info(`Notification sent for incident ${incident.ticket_number}`);

      // In production, integrate with actual notification services (email, Slack, etc.)
      await this._deliverNotification(notification);

      return notification;
    } catch (error) {
      logger.error('Error sending notification:', error);
      throw error;
    }
  }

  /**
   * Send bulk notifications
   */
  async sendBulkNotifications(incidentId, recipients, message, userId, channel = 'email') {
    try {
      const results = [];
      for (const recipient of recipients) {
        try {
          const notification = await this.sendNotification(
            incidentId,
            { recipient, message, channel },
            userId,
          );
          results.push({ recipient, status: 'sent', notification });
        } catch (error) {
          results.push({ recipient, status: 'failed', error: error.message });
        }
      }
      return results;
    } catch (error) {
      logger.error('Error sending bulk notifications:', error);
      throw error;
    }
  }

  /**
   * Get all communications for an incident
   */
  async getCommunications(incidentId) {
    try {
      const incident = await Incident.findOne({ $or: [{ id: incidentId }, { ticket_number: incidentId }] })
        .select('communications');

      if (!incident) {
        throw new Error('Incident not found');
      }

      return incident.communications;
    } catch (error) {
      logger.error('Error fetching communications:', error);
      throw error;
    }
  }

  /**
   * Generate default notification message
   */
  _generateDefaultMessage(incident) {
    return `
Incident Alert: ${incident.ticket_number}

Title: ${incident.title}
Priority: ${incident.priority}
Severity: ${incident.severity}
Status: ${incident.status}

Description: ${incident.description}

This is an automated notification from the Black-Cross Incident Response System.
    `.trim();
  }

  /**
   * Deliver notification (integration point)
   */
  async _deliverNotification(notification) {
    // In production, integrate with:
    // - Email service (SendGrid, SES, etc.)
    // - Slack API
    // - Microsoft Teams
    // - PagerDuty
    // - SMS service

    logger.info(`Delivering ${notification.channel} notification to ${notification.recipient}`);

    // Simulated delivery
    return {
      delivered: true,
      channel: notification.channel,
      recipient: notification.recipient,
      timestamp: new Date(),
    };
  }

  /**
   * Auto-notify based on incident events
   */
  async autoNotify(incident, event) {
    try {
      const notificationRules = this._getNotificationRules(incident, event);
      const results = [];

      for (const rule of notificationRules) {
        try {
          const notification = await this.sendNotification(
            incident.id,
            {
              recipient: rule.recipient,
              channel: rule.channel,
              message: rule.message,
            },
            'system',
          );
          results.push(notification);
        } catch (error) {
          logger.error('Error sending auto-notification:', error);
        }
      }

      return results;
    } catch (error) {
      logger.error('Error auto-notifying:', error);
      throw error;
    }
  }

  /**
   * Get notification rules based on incident and event
   */
  _getNotificationRules(incident, event) {
    const rules = [];

    // Critical incidents always notify security team
    if (incident.priority === 'critical') {
      rules.push({
        recipient: 'security-team@example.com',
        channel: 'email',
        message: `CRITICAL incident ${incident.ticket_number} requires immediate attention`,
      });
    }

    // SLA breaches notify management
    if (event === 'sla_breach') {
      rules.push({
        recipient: 'management@example.com',
        channel: 'email',
        message: `SLA breach for incident ${incident.ticket_number}`,
      });
    }

    // Assigned user gets notified
    if (incident.assigned_to && event === 'assigned') {
      rules.push({
        recipient: incident.assigned_to,
        channel: 'email',
        message: `You have been assigned incident ${incident.ticket_number}`,
      });
    }

    return rules;
  }
}

export default new NotificationService();
