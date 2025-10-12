/**
 * Sequelize Utilities
 * Helper functions and type exports for Sequelize models
 */

import type { Sequelize } from 'sequelize-typescript';
import dbManager from '../config/database';
import * as Models from '../models';

// Re-export model types
export type User = InstanceType<typeof Models.User>;
export type Incident = InstanceType<typeof Models.Incident>;
export type Vulnerability = InstanceType<typeof Models.Vulnerability>;
export type Asset = InstanceType<typeof Models.Asset>;
export type AuditLog = InstanceType<typeof Models.AuditLog>;
export type IOC = InstanceType<typeof Models.IOC>;
export type ThreatActor = InstanceType<typeof Models.ThreatActor>;
export type PlaybookExecution = InstanceType<typeof Models.PlaybookExecution>;

/**
 * Get Sequelize instance
 * Provides a convenient way to access the Sequelize instance
 */
export function getSequelize(): Sequelize {
  return dbManager.getSequelizeInstance();
}

// Export models for direct access
export { Models };

/**
 * Type-safe Sequelize query helpers
 */
export const sequelizeHelpers = {
  /**
   * Check if a record exists by ID
   */
  async exists(
    Model: any,
    id: string
  ): Promise<boolean> {
    const count = await Model.count({
      where: { id },
    });
    return count > 0;
  },

  /**
   * Get a record by ID or throw error
   */
  async getByIdOrThrow(
    Model: any,
    id: string
  ): Promise<any> {
    const record = await Model.findByPk(id);
    if (!record) {
      throw new Error(`Record with id ${id} not found`);
    }
    return record;
  },

  /**
   * Soft delete (set isActive to false instead of deleting)
   */
  async softDelete(
    Model: any,
    id: string
  ): Promise<any> {
    return await Model.update(
      { isActive: false },
      { where: { id } }
    );
  },

  /**
   * Paginate results
   */
  async paginate(
    Model: any,
    page: number = 1,
    pageSize: number = 20,
    where: any = {},
    order: any = [['createdAt', 'DESC']]
  ): Promise<{
    data: any[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const offset = (page - 1) * pageSize;

    const { rows: data, count: total } = await Model.findAndCountAll({
      where,
      order,
      offset,
      limit: pageSize,
    });

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  },
};

/**
 * Transaction helper
 * Execute multiple operations in a transaction
 */
export async function transaction<T>(
  callback: (sequelize: Sequelize) => Promise<T>
): Promise<T> {
  const sequelize = getSequelize();
  return await sequelize.transaction(async (t) => {
    return await callback(sequelize);
  });
}

/**
 * Raw query helper
 * Execute raw SQL queries
 */
export async function rawQuery<T = any>(
  query: string,
  options?: any
): Promise<T[]> {
  const sequelize = getSequelize();
  const [results] = await sequelize.query(query, options);
  return results as T[];
}

/**
 * Health check helper
 */
export async function checkSequelizeHealth(): Promise<boolean> {
  try {
    const sequelize = getSequelize();
    await sequelize.authenticate();
    return true;
  } catch (error) {
    return false;
  }
}

export default {
  getSequelize,
  sequelizeHelpers,
  transaction,
  rawQuery,
  checkSequelizeHealth,
};
