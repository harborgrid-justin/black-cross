/**
 * Sequelize Filter Adapter
 * Adapted from OpenCTI Platform
 * 
 * Converts FilterGroup objects to Sequelize WHERE clauses
 * Enables complex filtering at the database level
 */

import { Op } from 'sequelize';
import type { FilterGroup, Filter, FilterOperator } from './filter-types';

export class SequelizeFilterAdapter {
  /**
   * Convert a FilterGroup to a Sequelize WHERE clause
   * @param filterGroup The filter group to convert
   * @returns Sequelize WHERE object
   */
  convertToWhere(filterGroup: FilterGroup): any {
    return this.convertGroup(filterGroup);
  }

  /**
   * Convert a filter group recursively
   */
  private convertGroup(group: FilterGroup): any {
    // Process all direct filters
    const filterConditions = group.filters.map(f => this.convertFilter(f));
    
    // Process all nested filter groups
    const groupConditions = group.filterGroups.map(g => this.convertGroup(g));
    
    // Combine all conditions
    const allConditions = [...filterConditions, ...groupConditions];

    // If no conditions, return empty object
    if (allConditions.length === 0) {
      return {};
    }

    // Apply boolean logic
    switch (group.mode) {
      case 'and':
        return allConditions.length === 1 ? allConditions[0] : { [Op.and]: allConditions };
      case 'or':
        return { [Op.or]: allConditions };
      case 'not':
        return { [Op.not]: allConditions.length === 1 ? allConditions[0] : { [Op.and]: allConditions } };
      default:
        return {};
    }
  }

  /**
   * Convert a single filter to Sequelize syntax
   */
  private convertFilter(filter: Filter): any {
    const operator = this.getSequelizeOperator(filter.operator);
    let values = filter.values;

    // Special handling for pattern matching operators
    if (filter.operator === 'contains' || filter.operator === 'not_contains') {
      values = values.map(v => `%${v}%`);
    } else if (filter.operator === 'starts_with') {
      values = values.map(v => `${v}%`);
    } else if (filter.operator === 'ends_with') {
      values = values.map(v => `%${v}`);
    }

    // Special handling for nil operators
    if (filter.operator === 'nil') {
      return { [filter.key]: { [Op.is]: null } };
    }
    if (filter.operator === 'not_nil') {
      return { [Op.not]: { [filter.key]: { [Op.is]: null } } };
    }

    // Handle multiple values with mode
    if (values.length > 1 && filter.mode === 'and') {
      // For AND mode with multiple values, create multiple conditions
      return {
        [Op.and]: values.map(v => ({
          [filter.key]: { [operator]: v }
        }))
      };
    }

    // Standard case: single value or OR mode
    const value = values.length === 1 ? values[0] : values;
    return { [filter.key]: { [operator]: value } };
  }

  /**
   * Map our FilterOperator to Sequelize Op symbol
   */
  private getSequelizeOperator(operator: FilterOperator): symbol {
    const operatorMap: Record<FilterOperator, symbol> = {
      eq: Op.eq,
      not_eq: Op.ne,
      gt: Op.gt,
      gte: Op.gte,
      lt: Op.lt,
      lte: Op.lte,
      contains: Op.like,
      not_contains: Op.notLike,
      starts_with: Op.like,
      ends_with: Op.like,
      in: Op.in,
      not_in: Op.notIn,
      nil: Op.is,
      not_nil: Op.not
    };

    return operatorMap[operator] || Op.eq;
  }

  /**
   * Helper: Create a simple equality filter
   */
  static simpleFilter(key: string, value: string): any {
    return { [key]: { [Op.eq]: value } };
  }

  /**
   * Helper: Create a simple contains filter
   */
  static containsFilter(key: string, value: string): any {
    return { [key]: { [Op.like]: `%${value}%` } };
  }

  /**
   * Helper: Create a simple in filter
   */
  static inFilter(key: string, values: string[]): any {
    return { [key]: { [Op.in]: values } };
  }
}

/**
 * Singleton instance for convenience
 */
export const sequelizeFilterAdapter = new SequelizeFilterAdapter();

/**
 * Convenience function to convert FilterGroup to WHERE clause
 */
export const filterGroupToWhere = (filterGroup: FilterGroup): any => {
  return sequelizeFilterAdapter.convertToWhere(filterGroup);
};
