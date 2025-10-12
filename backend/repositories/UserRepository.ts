/**
 * User Repository
 * Type-safe repository for User model operations
 */

import { Op } from 'sequelize';
import type { User } from '../utils/sequelize';
import { BaseRepository } from '../utils/BaseRepository';
import UserModel from '../models/User';

class UserRepository extends BaseRepository<User> {
  protected model = UserModel;

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return await this.model.findOne({
      where: { email },
    });
  }

  /**
   * Find user by username
   */
  async findByUsername(username: string): Promise<User | null> {
    return await this.model.findOne({
      where: { username },
    });
  }

  /**
   * Find active users
   */
  async findActive(filters: any = {}): Promise<User[]> {
    return await this.model.findAll({
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
    return await this.model.findAll({
      where: { role },
    });
  }

  /**
   * Update last login timestamp
   */
  async updateLastLogin(id: string): Promise<User> {
    const user = await this.findByIdOrThrow(id);
    return await user.update({ lastLogin: new Date() });
  }

  /**
   * Deactivate user
   */
  async deactivate(id: string): Promise<User> {
    const user = await this.findByIdOrThrow(id);
    return await user.update({ isActive: false });
  }

  /**
   * Activate user
   */
  async activate(id: string): Promise<User> {
    const user = await this.findByIdOrThrow(id);
    return await user.update({ isActive: true });
  }

  /**
   * Build where clause with search support
   */
  protected override buildWhereClause(filters: any, search?: string): any {
    const where: any = { ...filters };

    if (search) {
      where[Op.or] = [
        { email: { [Op.iLike]: `%${search}%` } },
        { username: { [Op.iLike]: `%${search}%` } },
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
      ];
    }

    return where;
  }
}

// Export singleton instance
export const userRepository = new UserRepository();
export default userRepository;
