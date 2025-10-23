/**
 * PlaybookExecution Repository
 * Type-safe repository for PlaybookExecution model operations
 */

import { Op } from 'sequelize';
import type { PlaybookExecution } from '../utils/sequelize';
import { BaseRepository } from '../utils/BaseRepository';
import PlaybookExecutionModel from '../models/PlaybookExecution';

class PlaybookExecutionRepository extends BaseRepository<PlaybookExecution> {
  protected model = PlaybookExecutionModel;

  /**
   * Find executions by playbook ID
   */
  async findByPlaybookId(playbookId: string): Promise<PlaybookExecution[]> {
    return await this.model.findAll({
      where: { playbookId },
      order: [['startedAt', 'DESC']],
    });
  }

  /**
   * Find executions by status
   */
  async findByStatus(status: string): Promise<PlaybookExecution[]> {
    return await this.model.findAll({
      where: { status },
      order: [['startedAt', 'DESC']],
    });
  }

  /**
   * Find running executions
   */
  async findRunning(): Promise<PlaybookExecution[]> {
    return await this.model.findAll({
      where: {
        status: {
          [Op.in]: ['pending', 'running'],
        },
      },
      order: [['startedAt', 'ASC']],
    });
  }

  /**
   * Find failed executions
   */
  async findFailed(): Promise<PlaybookExecution[]> {
    return await this.model.findAll({
      where: { status: 'failed' },
      order: [['startedAt', 'DESC']],
    });
  }

  /**
   * Find successful executions
   */
  async findSuccessful(): Promise<PlaybookExecution[]> {
    return await this.model.findAll({
      where: { status: 'success' },
      order: [['startedAt', 'DESC']],
    });
  }

  /**
   * Find executions by triggered user
   */
  async findByTriggeredBy(userId: string): Promise<PlaybookExecution[]> {
    return await this.model.findAll({
      where: { triggeredBy: userId },
      order: [['startedAt', 'DESC']],
    });
  }

  /**
   * Find recent executions
   */
  async findRecent(hours: number = 24): Promise<PlaybookExecution[]> {
    const date = new Date();
    date.setHours(date.getHours() - hours);

    return await this.model.findAll({
      where: {
        startedAt: {
          [Op.gte]: date,
        },
      },
      order: [['startedAt', 'DESC']],
    });
  }

  /**
   * Update execution status
   */
  async updateStatus(
    id: string,
    status: string,
    result?: any,
    errorMessage?: string,
  ): Promise<PlaybookExecution> {
    const data: any = { status };

    // If completing, set completedAt and calculate duration
    if (['success', 'failed', 'cancelled'].includes(status)) {
      data.completedAt = new Date();

      const execution = await this.findByIdOrThrow(id);
      const startTime = new Date(execution.startedAt).getTime();
      const endTime = data.completedAt.getTime();
      data.duration = Math.floor((endTime - startTime) / 1000); // duration in seconds
    }

    if (result !== undefined) {
      data.result = result;
    }

    if (errorMessage) {
      data.errorMessage = errorMessage;
    }

    const execution = await this.findByIdOrThrow(id);
    return await execution.update(data);
  }

  /**
   * Complete execution successfully
   */
  async completeSuccess(id: string, result?: any): Promise<PlaybookExecution> {
    return await this.updateStatus(id, 'success', result);
  }

  /**
   * Complete execution with failure
   */
  async completeFailed(id: string, errorMessage: string): Promise<PlaybookExecution> {
    return await this.updateStatus(id, 'failed', undefined, errorMessage);
  }

  /**
   * Get execution statistics
   */
  async getStatistics(): Promise<{
    total: number;
    pending: number;
    running: number;
    success: number;
    failed: number;
    cancelled: number;
    averageDuration: number;
    successRate: number;
  }> {
    const [
      total,
      pending,
      running,
      success,
      failed,
      cancelled,
      completedExecutions,
    ] = await Promise.all([
      this.count(),
      this.count({ status: 'pending' }),
      this.count({ status: 'running' }),
      this.count({ status: 'success' }),
      this.count({ status: 'failed' }),
      this.count({ status: 'cancelled' }),
      this.model.findAll({
        where: {
          status: {
            [Op.in]: ['success', 'failed'],
          },
          duration: { [Op.not]: null },
        },
        attributes: ['duration'],
      }),
    ]);

    // Calculate average duration
    let averageDuration = 0;
    if (completedExecutions.length > 0) {
      const totalDuration = completedExecutions.reduce(
        (sum, exec) => sum + (exec.duration || 0),
        0,
      );
      averageDuration = Math.floor(totalDuration / completedExecutions.length);
    }

    // Calculate success rate
    const totalCompleted = success + failed;
    const successRate = totalCompleted > 0 ? (success / totalCompleted) * 100 : 0;

    return {
      total,
      pending,
      running,
      success,
      failed,
      cancelled,
      averageDuration,
      successRate: Math.round(successRate * 100) / 100,
    };
  }

  /**
   * Get statistics by playbook
   */
  async getPlaybookStatistics(playbookId: string): Promise<{
    total: number;
    success: number;
    failed: number;
    successRate: number;
    averageDuration: number;
  }> {
    const [
      total,
      success,
      failed,
      completedExecutions,
    ] = await Promise.all([
      this.count({ playbookId }),
      this.count({ playbookId, status: 'success' }),
      this.count({ playbookId, status: 'failed' }),
      this.model.findAll({
        where: {
          playbookId,
          status: {
            [Op.in]: ['success', 'failed'],
          },
          duration: { [Op.not]: null },
        },
        attributes: ['duration'],
      }),
    ]);

    // Calculate average duration
    let averageDuration = 0;
    if (completedExecutions.length > 0) {
      const totalDuration = completedExecutions.reduce(
        (sum, exec) => sum + (exec.duration || 0),
        0,
      );
      averageDuration = Math.floor(totalDuration / completedExecutions.length);
    }

    // Calculate success rate
    const totalCompleted = success + failed;
    const successRate = totalCompleted > 0 ? (success / totalCompleted) * 100 : 0;

    return {
      total,
      success,
      failed,
      successRate: Math.round(successRate * 100) / 100,
      averageDuration,
    };
  }

  /**
   * Build where clause with search support
   */
  protected override buildWhereClause(filters: any, search?: string): any {
    const where: any = { ...filters };

    if (search) {
      where[Op.or] = [
        { playbookName: { [Op.iLike]: `%${search}%` } },
        { playbookId: { [Op.iLike]: `%${search}%` } },
      ];
    }

    return where;
  }
}

// Export singleton instance
export const playbookExecutionRepository = new PlaybookExecutionRepository();
export default playbookExecutionRepository;
