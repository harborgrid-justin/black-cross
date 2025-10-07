/**
 * Base Repository Pattern for Prisma
 * Provides common CRUD operations with type safety
 */

import type { PrismaClient } from '@prisma/client';
import { getPrisma } from './prisma';

/**
 * Generic filter type for list operations
 */
export interface ListFilters {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  [key: string]: any;
}

/**
 * Paginated response type
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Base Repository Class
 * Extend this class for model-specific repositories
 */
export abstract class BaseRepository<TModel, TCreateInput, TUpdateInput> {
  protected prisma: PrismaClient;
  protected abstract modelName: string;

  constructor() {
    this.prisma = getPrisma();
  }

  /**
   * Get the Prisma model delegate
   */
  protected get model(): any {
    return (this.prisma as any)[this.modelName];
  }

  /**
   * Create a new record
   */
  async create(data: TCreateInput): Promise<TModel> {
    return await this.model.create({ data });
  }

  /**
   * Find record by ID
   */
  async findById(id: string): Promise<TModel | null> {
    return await this.model.findUnique({ where: { id } });
  }

  /**
   * Find record by ID or throw error
   */
  async findByIdOrThrow(id: string): Promise<TModel> {
    return await this.model.findUniqueOrThrow({ where: { id } });
  }

  /**
   * Find first record matching criteria
   */
  async findFirst(where: any): Promise<TModel | null> {
    return await this.model.findFirst({ where });
  }

  /**
   * Find many records
   */
  async findMany(where: any = {}, options: any = {}): Promise<TModel[]> {
    return await this.model.findMany({
      where,
      ...options,
    });
  }

  /**
   * List records with pagination
   */
  async list(filters: ListFilters = {}): Promise<PaginatedResponse<TModel>> {
    const {
      page = 1,
      pageSize = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      ...whereFilters
    } = filters;

    const skip = (page - 1) * pageSize;
    const where = this.buildWhereClause(whereFilters, search);

    const [data, total] = await Promise.all([
      this.model.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: pageSize,
      }),
      this.model.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  /**
   * Update record by ID
   */
  async update(id: string, data: TUpdateInput): Promise<TModel> {
    return await this.model.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete record by ID
   */
  async delete(id: string): Promise<TModel> {
    return await this.model.delete({ where: { id } });
  }

  /**
   * Soft delete (set isActive to false)
   */
  async softDelete(id: string): Promise<TModel> {
    return await this.model.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Count records
   */
  async count(where: any = {}): Promise<number> {
    return await this.model.count({ where });
  }

  /**
   * Check if record exists
   */
  async exists(id: string): Promise<boolean> {
    const count = await this.model.count({ where: { id } });
    return count > 0;
  }

  /**
   * Build where clause for queries
   * Override this method in child classes for custom search logic
   */
  protected buildWhereClause(filters: any, search?: string): any {
    const where: any = { ...filters };

    // Override in child classes to implement search functionality
    if (search) {
      // Default: no search implementation
      // Child classes should override this
    }

    return where;
  }

  /**
   * Execute operation in transaction
   */
  async transaction<T>(
    callback: (repo: this) => Promise<T>
  ): Promise<T> {
    return await this.prisma.$transaction(async (tx) => {
      const txRepo = Object.create(this);
      txRepo.prisma = tx;
      return await callback(txRepo);
    });
  }
}

export default BaseRepository;
