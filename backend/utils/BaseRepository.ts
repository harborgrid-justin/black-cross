/**
 * Base Repository Pattern for Sequelize
 * Provides common CRUD operations with type safety
 */

import type { Model, ModelStatic, WhereOptions, FindOptions } from 'sequelize';
import { getSequelize } from './prisma';

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
export abstract class BaseRepository<TModel extends Model> {
  protected abstract model: ModelStatic<TModel>;

  constructor() {
    // Sequelize is already initialized through DatabaseManager
    getSequelize();
  }

  /**
   * Create a new record
   */
  async create(data: any): Promise<TModel> {
    return await this.model.create(data);
  }

  /**
   * Find record by ID
   */
  async findById(id: string): Promise<TModel | null> {
    return await this.model.findByPk(id);
  }

  /**
   * Find record by ID or throw error
   */
  async findByIdOrThrow(id: string): Promise<TModel> {
    const record = await this.model.findByPk(id);
    if (!record) {
      throw new Error(`${this.model.name} with id ${id} not found`);
    }
    return record;
  }

  /**
   * Find first record matching criteria
   */
  async findFirst(where: WhereOptions<any>): Promise<TModel | null> {
    return await this.model.findOne({ where });
  }

  /**
   * Find many records
   */
  async findMany(where: WhereOptions<any> = {}, options: FindOptions<any> = {}): Promise<TModel[]> {
    return await this.model.findAll({
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

    const offset = (page - 1) * pageSize;
    const where = this.buildWhereClause(whereFilters, search);

    const { rows: data, count: total } = await this.model.findAndCountAll({
      where,
      order: [[sortBy, sortOrder.toUpperCase()]],
      offset,
      limit: pageSize,
    });

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
  async update(id: string, data: any): Promise<TModel> {
    const record = await this.findByIdOrThrow(id);
    return await record.update(data);
  }

  /**
   * Delete record by ID
   */
  async delete(id: string): Promise<void> {
    const record = await this.findByIdOrThrow(id);
    await record.destroy();
  }

  /**
   * Soft delete (set isActive to false)
   */
  async softDelete(id: string): Promise<TModel> {
    const record = await this.findByIdOrThrow(id);
    return await record.update({ isActive: false } as any);
  }

  /**
   * Count records
   */
  async count(where: WhereOptions<any> = {}): Promise<number> {
    return await this.model.count({ where });
  }

  /**
   * Check if record exists
   */
  async exists(id: string): Promise<boolean> {
    const count = await this.model.count({ where: { id } as any });
    return count > 0;
  }

  /**
   * Build where clause for queries
   * Override this method in child classes for custom search logic
   */
  protected buildWhereClause(filters: any, search?: string): WhereOptions<any> {
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
    const sequelize = getSequelize();
    return await sequelize.transaction(async () => {
      return await callback(this);
    });
  }
}

export default BaseRepository;
