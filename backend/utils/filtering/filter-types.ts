/**
 * Advanced Filtering System - Type Definitions
 * Adapted from OpenCTI Platform
 * 
 * Provides boolean logic filtering capabilities with support for:
 * - Complex nested filter groups (AND/OR/NOT)
 * - Multiple operators (eq, contains, gt, lt, etc.)
 * - Type-safe filter construction
 * - Sequelize ORM integration
 */

export interface FilterGroup {
  mode: FilterMode;
  filters: Filter[];
  filterGroups: FilterGroup[];
}

export type FilterMode = 'and' | 'or' | 'not';

export interface Filter {
  key: string;
  operator: FilterOperator;
  values: string[];
  mode?: 'and' | 'or';
}

export type FilterOperator = 
  | 'eq'           // Equal
  | 'not_eq'       // Not equal
  | 'gt'           // Greater than
  | 'gte'          // Greater than or equal
  | 'lt'           // Less than
  | 'lte'          // Less than or equal
  | 'contains'     // Contains (case-insensitive)
  | 'not_contains' // Does not contain
  | 'starts_with'  // Starts with
  | 'ends_with'    // Ends with
  | 'in'           // In list
  | 'not_in'       // Not in list
  | 'nil'          // Is null
  | 'not_nil';     // Is not null

/**
 * Factory function to create an empty filter group
 */
export const emptyFilterGroup = (mode: FilterMode = 'and'): FilterGroup => ({
  mode,
  filters: [],
  filterGroups: []
});

/**
 * Add a filter to a filter group
 */
export const addFilter = (
  group: FilterGroup,
  filter: Filter
): FilterGroup => ({
  ...group,
  filters: [...group.filters, filter]
});

/**
 * Add a nested filter group
 */
export const addFilterGroup = (
  parent: FilterGroup,
  child: FilterGroup
): FilterGroup => ({
  ...parent,
  filterGroups: [...parent.filterGroups, child]
});

/**
 * Validate that a filter group is well-formed
 */
export const validateFilterGroup = (group: FilterGroup): string[] => {
  const errors: string[] = [];

  // Validate mode
  if (!['and', 'or', 'not'].includes(group.mode)) {
    errors.push(`Invalid filter mode: ${group.mode}`);
  }

  // Validate filters
  for (const filter of group.filters) {
    if (!filter.key) {
      errors.push('Filter missing key');
    }
    if (!filter.operator) {
      errors.push('Filter missing operator');
    }
    if (!Array.isArray(filter.values)) {
      errors.push('Filter values must be an array');
    }
    if (filter.values.length === 0 && !['nil', 'not_nil'].includes(filter.operator)) {
      errors.push(`Filter '${filter.key}' has no values`);
    }
  }

  // Validate nested groups recursively
  for (const childGroup of group.filterGroups) {
    errors.push(...validateFilterGroup(childGroup));
  }

  return errors;
};

/**
 * Check if filter group has any filters
 */
export const hasFilters = (group: FilterGroup): boolean => {
  return group.filters.length > 0 || group.filterGroups.some(hasFilters);
};
