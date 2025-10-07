/**
 * Prisma Utilities
 * Helper functions and type exports for Prisma Client
 */

import { PrismaClient, Prisma } from '@prisma/client';
import dbManager from '../config/database';

// Re-export commonly used Prisma types
type PrismaClientType = InstanceType<typeof PrismaClient>;

// Get model types from Prisma client
export type User = Prisma.UserGetPayload<{}>;
export type Incident = Prisma.IncidentGetPayload<{}>;
export type Vulnerability = Prisma.VulnerabilityGetPayload<{}>;
export type Asset = Prisma.AssetGetPayload<{}>;
export type AuditLog = Prisma.AuditLogGetPayload<{}>;

/**
 * Get Prisma Client instance
 * Provides a convenient way to access the Prisma client
 */
export function getPrisma(): PrismaClient {
  return dbManager.getPrismaClient();
}

// Export Prisma namespace for use in repositories
export { Prisma };

/**
 * Type-safe Prisma query helpers
 */
export const prismaHelpers = {
  /**
   * Check if a record exists by ID
   */
  async exists<T extends keyof PrismaClient>(
    model: T,
    id: string
  ): Promise<boolean> {
    const prisma = getPrisma();
    const count = await (prisma[model] as any).count({
      where: { id },
    });
    return count > 0;
  },

  /**
   * Get a record by ID or throw error
   */
  async getByIdOrThrow<T extends keyof PrismaClient>(
    model: T,
    id: string
  ): Promise<any> {
    const prisma = getPrisma();
    const record = await (prisma[model] as any).findUniqueOrThrow({
      where: { id },
    });
    return record;
  },

  /**
   * Soft delete (set isActive to false instead of deleting)
   */
  async softDelete<T extends keyof PrismaClient>(
    model: T,
    id: string
  ): Promise<any> {
    const prisma = getPrisma();
    return await (prisma[model] as any).update({
      where: { id },
      data: { isActive: false },
    });
  },

  /**
   * Paginate results
   */
  async paginate<T extends keyof PrismaClient>(
    model: T,
    page: number = 1,
    pageSize: number = 20,
    where: any = {},
    orderBy: any = { createdAt: 'desc' }
  ): Promise<{
    data: any[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const prisma = getPrisma();
    const skip = (page - 1) * pageSize;

    const [data, total] = await Promise.all([
      (prisma[model] as any).findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
      }),
      (prisma[model] as any).count({ where }),
    ]);

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
  callback: (prisma: PrismaClient) => Promise<T>
): Promise<T> {
  const prisma = getPrisma();
  return await prisma.$transaction(async (tx) => {
    return await callback(tx as PrismaClient);
  });
}

/**
 * Raw query helper
 * Execute raw SQL queries with type safety
 */
export async function rawQuery<T = any>(
  query: string,
  ...params: any[]
): Promise<T[]> {
  const prisma = getPrisma();
  return await (prisma as any).$queryRawUnsafe(query, ...params);
}

/**
 * Execute raw SQL (for INSERT, UPDATE, DELETE)
 */
export async function executeRaw(
  query: string,
  ...params: any[]
): Promise<number> {
  const prisma = getPrisma();
  return await prisma.$executeRawUnsafe(query, ...params);
}

/**
 * Health check helper
 */
export async function checkPrismaHealth(): Promise<boolean> {
  try {
    const prisma = getPrisma();
    await (prisma as any).$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    return false;
  }
}

export default {
  getPrisma,
  prismaHelpers,
  transaction,
  rawQuery,
  executeRaw,
  checkPrismaHealth,
};
