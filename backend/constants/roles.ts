/**
 * User Roles and Permissions Constants
 */

/**
 * User roles
 */
export const ROLES = {
  ADMIN: 'admin',
  ANALYST: 'analyst',
  VIEWER: 'viewer',
} as const;

/**
 * Role hierarchy (higher number = more permissions)
 */
export const ROLE_HIERARCHY = {
  [ROLES.VIEWER]: 1,
  [ROLES.ANALYST]: 2,
  [ROLES.ADMIN]: 3,
} as const;

/**
 * Role descriptions
 */
export const ROLE_DESCRIPTIONS = {
  [ROLES.ADMIN]: 'Full system access with all permissions',
  [ROLES.ANALYST]: 'Can view, create, and modify security data',
  [ROLES.VIEWER]: 'Read-only access to security data',
} as const;

/**
 * All roles as array
 */
export const ALL_ROLES = Object.values(ROLES);

/**
 * Role combinations for authorization
 */
export const ROLE_GROUPS = {
  ADMIN_ONLY: [ROLES.ADMIN],
  ADMIN_AND_ANALYST: [ROLES.ADMIN, ROLES.ANALYST],
  ALL: ALL_ROLES,
} as const;
