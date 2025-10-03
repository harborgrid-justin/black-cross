/**
 * Schedule Service
 * Business logic for automated report scheduling
 */

const ReportSchedule = require('../models/ReportSchedule');
const reportService = require('./reportService');
const logger = require('../utils/logger');

class ScheduleService {
  /**
   * Create a new report schedule
   */
  async createSchedule(scheduleData) {
    try {
      const schedule = new ReportSchedule(scheduleData);

      // Calculate next execution time
      schedule.next_execution = this.calculateNextExecution(schedule.schedule, schedule.timezone);

      await schedule.save();

      logger.info('Report schedule created', { scheduleId: schedule.id });
      return schedule;
    } catch (error) {
      logger.error('Error creating report schedule', { error: error.message });
      throw error;
    }
  }

  /**
   * Get schedule by ID
   */
  async getSchedule(scheduleId) {
    try {
      const schedule = await ReportSchedule.findOne({ id: scheduleId });

      if (!schedule) {
        throw new Error('Report schedule not found');
      }

      return schedule;
    } catch (error) {
      logger.error('Error retrieving report schedule', { scheduleId, error: error.message });
      throw error;
    }
  }

  /**
   * Update schedule
   */
  async updateSchedule(scheduleId, updates) {
    try {
      const schedule = await ReportSchedule.findOneAndUpdate(
        { id: scheduleId },
        { $set: updates },
        { new: true, runValidators: true },
      );

      if (!schedule) {
        throw new Error('Report schedule not found');
      }

      // Recalculate next execution if schedule changed
      if (updates.schedule || updates.timezone) {
        schedule.next_execution = this.calculateNextExecution(schedule.schedule, schedule.timezone);
        await schedule.save();
      }

      logger.info('Report schedule updated', { scheduleId });
      return schedule;
    } catch (error) {
      logger.error('Error updating report schedule', { scheduleId, error: error.message });
      throw error;
    }
  }

  /**
   * Delete schedule
   */
  async deleteSchedule(scheduleId) {
    try {
      const result = await ReportSchedule.deleteOne({ id: scheduleId });

      if (result.deletedCount === 0) {
        throw new Error('Report schedule not found');
      }

      logger.info('Report schedule deleted', { scheduleId });
      return { success: true };
    } catch (error) {
      logger.error('Error deleting report schedule', { scheduleId, error: error.message });
      throw error;
    }
  }

  /**
   * List schedules with filters
   */
  async listSchedules(filters = {}) {
    try {
      const {
        enabled,
        created_by,
        page = 1,
        limit = 20,
      } = filters;

      const query = {};
      if (enabled !== undefined) query.enabled = enabled;
      // eslint-disable-next-line camelcase
      if (created_by) query.created_by = created_by;

      const skip = (page - 1) * limit;

      const schedules = await ReportSchedule.find(query)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit);

      const total = await ReportSchedule.countDocuments(query);

      return {
        schedules,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Error listing report schedules', { error: error.message });
      throw error;
    }
  }

  /**
   * Execute scheduled reports that are due
   */
  async executeScheduledReports() {
    try {
      const now = new Date();
      const dueSchedules = await ReportSchedule.find({
        enabled: true,
        next_execution: { $lte: now },
      });

      logger.info(`Found ${dueSchedules.length} schedules to execute`);

      // eslint-disable-next-line no-restricted-syntax
      for (const schedule of dueSchedules) {
        try {
          // Check conditions if any
          if (schedule.conditions && schedule.conditions.enabled) {
            // eslint-disable-next-line no-await-in-loop
            const shouldExecute = await this.evaluateConditions(schedule.conditions.rules);
            if (!shouldExecute) {
              logger.info('Schedule conditions not met, skipping', { scheduleId: schedule.id });
              // eslint-disable-next-line no-continue
              continue;
            }
          }

          // Generate report
          // eslint-disable-next-line no-await-in-loop
          const report = await reportService.generateReport(
            schedule.template_id,
            schedule.parameters,
            schedule.created_by,
          );

          // Update schedule execution info
          schedule.last_execution = {
            date: new Date(),
            status: 'success',
            report_id: report.id,
          };
          schedule.execution_count += 1;
          schedule.next_execution = this.calculateNextExecution(
            schedule.schedule,
            schedule.timezone,
          );
          schedule.failure_count = 0;

          // eslint-disable-next-line no-await-in-loop
          await schedule.save();

          // Send to recipients (simulated)
          // eslint-disable-next-line no-await-in-loop
          await this.distributeReport(report, schedule.recipients);

          logger.info('Scheduled report executed successfully', {
            scheduleId: schedule.id,
            reportId: report.id,
          });
        } catch (error) {
          schedule.last_execution = {
            date: new Date(),
            status: 'failed',
          };
          schedule.failure_count += 1;
          schedule.next_execution = this.calculateNextExecution(
            schedule.schedule,
            schedule.timezone,
          );

          await schedule.save();

          logger.error('Failed to execute scheduled report', {
            scheduleId: schedule.id,
            error: error.message,
          });
        }
      }

      return { executed: dueSchedules.length };
    } catch (error) {
      logger.error('Error executing scheduled reports', { error: error.message });
      throw error;
    }
  }

  /**
   * Calculate next execution time based on cron expression
   */
  calculateNextExecution(cronExpression, _timezone = 'UTC') {
    // Simple implementation - in production use a library like node-cron
    const now = new Date();
    const nextExecution = new Date(now.getTime() + 60 * 60 * 1000); // Add 1 hour
    return nextExecution;
  }

  /**
   * Evaluate conditions for conditional report generation
   */
  async evaluateConditions(_rules) {
    // Simplified condition evaluation
    // In production, implement proper rule engine
    return true;
  }

  /**
   * Distribute report to recipients
   */
  async distributeReport(report, recipients) {
    // eslint-disable-next-line no-restricted-syntax
    for (const recipient of recipients) {
      try {
        // Simulate distribution based on delivery method
        logger.info('Report distributed', {
          reportId: report.id,
          recipient: recipient.email || recipient.user_id,
          method: recipient.delivery_method,
        });
      } catch (error) {
        logger.error('Failed to distribute report', {
          reportId: report.id,
          error: error.message,
        });
      }
    }
  }
}

module.exports = new ScheduleService();
