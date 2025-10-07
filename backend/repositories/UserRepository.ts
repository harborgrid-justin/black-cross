/**
 * User Repository
 * Type-safe repository for User model operations
 */

import type { User, Prisma } from '../utils/prisma';
import { BaseRepository } from '../utils/BaseRepository';

class UserRepository extends BaseRepository<
  User,
  Prisma.UserCreateInput,
  Prisma.UserUpdateInput
> {
  protected modelName = 'user';

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return await this.model.findUnique({
      where: { email },
    });
  }

  /**
   * Find user by username
   */
  async findByUsername(username: string): Promise<User | null> {
    return await this.model.findUnique({
      where: { username },
    });
  }

  /**
   * Find active users
   */
  async findActive(filters: any = {}): Promise<User[]> {
    return await this.model.findMany({
      where: {
        ...filters,
        isActive: true,
      },
    });
  }

  /**
   * Find users by role
   */
  async findByRole(role: string): Promise<User[]> {
    return await this.model.findMany({
      where: { role },
    });
  }

  /**
   * Update last login timestamp
   */
  async updateLastLogin(id: string): Promise<User> {
    return await this.model.update({
      where: { id },
      data: { lastLogin: new Date() },
    });
  }

  /**
   * Deactivate user
   */
  async deactivate(id: string): Promise<User> {
    return await this.model.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Activate user
   */
  async activate(id: string): Promise<User> {
    return await this.model.update({
      where: { id },
      data: { isActive: true },
    });
  }

  /**
   * Build where clause with search support
   */
  protected override buildWhereClause(filters: any, search?: string): any {
    const where: any = { ...filters };

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    return where;
  }
}

// Export singleton instance
export const userRepository = new UserRepository();
export default userRepository;
