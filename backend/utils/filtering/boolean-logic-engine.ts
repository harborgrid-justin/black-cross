/**
 * Boolean Logic Engine
 * Adapted from OpenCTI Platform
 * 
 * Evaluates complex filter groups against entities using boolean logic.
 * Supports AND, OR, NOT operations with nested groups.
 */

import type { FilterGroup, Filter, FilterOperator } from './filter-types';

export class BooleanLogicEngine {
  /**
   * Evaluate a filter group against an entity
   * @param filterGroup The filter group to evaluate
   * @param entity The entity to test against
   * @returns true if entity matches the filter criteria
   */
  evaluate<T extends Record<string, any>>(filterGroup: FilterGroup, entity: T): boolean {
    return this.evaluateGroup(filterGroup, entity);
  }

  /**
   * Evaluate a single filter group
   */
  private evaluateGroup<T extends Record<string, any>>(group: FilterGroup, entity: T): boolean {
    // Evaluate all direct filters
    const filterResults = group.filters.map(f => this.evaluateFilter(f, entity));
    
    // Evaluate all nested filter groups
    const groupResults = group.filterGroups.map(g => this.evaluateGroup(g, entity));
    
    // Combine all results
    const allResults = [...filterResults, ...groupResults];
    
    // If no filters, return true (empty filter matches everything)
    if (allResults.length === 0) {
      return true;
    }

    // Apply boolean logic based on mode
    switch (group.mode) {
      case 'and':
        return allResults.every(result => result === true);
      case 'or':
        return allResults.some(result => result === true);
      case 'not':
        return !allResults.every(result => result === true);
      default:
        return true;
    }
  }

  /**
   * Evaluate a single filter against an entity
   */
  private evaluateFilter<T extends Record<string, any>>(filter: Filter, entity: T): boolean {
    const value = this.getNestedValue(entity, filter.key);
    
    // Handle nil/not_nil operators
    if (filter.operator === 'nil') {
      return value === null || value === undefined;
    }
    if (filter.operator === 'not_nil') {
      return value !== null && value !== undefined;
    }

    // If value is null/undefined and operator isn't nil, return false
    if (value === null || value === undefined) {
      return false;
    }

    // Apply operator
    return this.applyOperator(value, filter.operator, filter.values, filter.mode);
  }

  /**
   * Apply a specific operator to compare value against filter values
   */
  private applyOperator(
    value: any,
    operator: FilterOperator,
    filterValues: string[],
    mode: 'and' | 'or' = 'or'
  ): boolean {
    const stringValue = String(value).toLowerCase();

    // For operators that work on lists of values
    const results = filterValues.map(filterValue => {
      const stringFilterValue = String(filterValue).toLowerCase();
      const numericValue = Number(value);
      const numericFilterValue = Number(filterValue);

      switch (operator) {
        case 'eq':
          return stringValue === stringFilterValue;
        
        case 'not_eq':
          return stringValue !== stringFilterValue;
        
        case 'gt':
          return !isNaN(numericValue) && !isNaN(numericFilterValue) && numericValue > numericFilterValue;
        
        case 'gte':
          return !isNaN(numericValue) && !isNaN(numericFilterValue) && numericValue >= numericFilterValue;
        
        case 'lt':
          return !isNaN(numericValue) && !isNaN(numericFilterValue) && numericValue < numericFilterValue;
        
        case 'lte':
          return !isNaN(numericValue) && !isNaN(numericFilterValue) && numericValue <= numericFilterValue;
        
        case 'contains':
          return stringValue.includes(stringFilterValue);
        
        case 'not_contains':
          return !stringValue.includes(stringFilterValue);
        
        case 'starts_with':
          return stringValue.startsWith(stringFilterValue);
        
        case 'ends_with':
          return stringValue.endsWith(stringFilterValue);
        
        case 'in':
          return stringValue === stringFilterValue;
        
        case 'not_in':
          return stringValue !== stringFilterValue;
        
        default:
          console.warn(`Unknown operator: ${operator}`);
          return false;
      }
    });

    // Apply mode (and/or) to results
    return mode === 'and' ? results.every(Boolean) : results.some(Boolean);
  }

  /**
   * Get a nested property value from an object using dot notation
   * e.g., "user.profile.email" => obj.user.profile.email
   */
  private getNestedValue(obj: any, path: string): any {
    const keys = path.split('.');
    let current = obj;

    for (const key of keys) {
      if (current === null || current === undefined) {
        return undefined;
      }
      current = current[key];
    }

    return current;
  }
}

/**
 * Singleton instance for convenience
 */
export const booleanLogicEngine = new BooleanLogicEngine();
