/**
 * Enterprise Access Control System
 * Adapted from OpenCTI Platform
 * 
 * Implements capability-based access control with:
 * - Fine-grained permissions
 * - Organization-level access
 * - Resource-level access rights
 * - Admin bypass mechanisms
 */

import type { User } from '../../models/User';
import { CAPABILITIES, type Capability, isPrivilegedCapability } from './capabilities';

/**
 * Member access rights for shared resources
 */
export enum MemberAccessRight {
  ADMIN = 'admin',
  EDIT = 'edit',
  VIEW = 'view',
  NONE = 'none'
}

/**
 * Authorized member interface for resource sharing
 */
export interface AuthorizedMember {
  id: string;
  access_right: MemberAccessRight;
}

/**
 * Entity with access control
 */
export interface AccessControlledEntity {
  id: string;
  authorized_members?: AuthorizedMember[];
  created_by?: string;
  organization_id?: string;
}

/**
 * Check if a user has a specific capability
 */
export const isUserHasCapability = (
  user: User | null | undefined,
  capability: Capability
): boolean => {
  if (!user || !user.capabilities) {
    return false;
  }
  
  // System bypass
  if (user.capabilities.includes(CAPABILITIES.BYPASS_ENTERPRISE)) {
    return true;
  }
  
  // Check for specific capability
  return user.capabilities.includes(capability);
};

/**
 * Check if user has ANY of the provided capabilities
 */
export const isUserHasAnyCapability = (
  user: User | null | undefined,
  capabilities: Capability[]
): boolean => {
  if (!user) {
    return false;
  }
  
  // Admin bypass
  if (isUserHasCapability(user, CAPABILITIES.BYPASS_ENTERPRISE)) {
    return true;
  }
  
  return capabilities.some(cap => isUserHasCapability(user, cap));
};

/**
 * Check if user has ALL of the provided capabilities
 */
export const isUserHasAllCapabilities = (
  user: User | null | undefined,
  capabilities: Capability[]
): boolean => {
  if (!user) {
    return false;
  }
  
  // Admin bypass
  if (isUserHasCapability(user, CAPABILITIES.BYPASS_ENTERPRISE)) {
    return true;
  }
  
  return capabilities.every(cap => isUserHasCapability(user, cap));
};

/**
 * Check if user is an admin
 */
export const isUserAdmin = (user: User | null | undefined): boolean => {
  return isUserHasCapability(user, CAPABILITIES.BYPASS_ENTERPRISE);
};

/**
 * Check if user is an organization admin
 */
export const isUserOrgAdmin = (user: User | null | undefined): boolean => {
  if (!user) {
    return false;
  }
  
  return isUserHasCapability(user, CAPABILITIES.VIRTUAL_ORGANIZATION_ADMIN) ||
         isUserHasCapability(user, CAPABILITIES.BYPASS_ENTERPRISE);
};

/**
 * Check if user is ONLY an organization admin (not a full admin)
 */
export const isOnlyOrgAdmin = (user: User | null | undefined): boolean => {
  if (!user) {
    return false;
  }
  
  return isUserHasCapability(user, CAPABILITIES.VIRTUAL_ORGANIZATION_ADMIN) &&
         !isUserHasCapability(user, CAPABILITIES.BYPASS_ENTERPRISE);
};

/**
 * Get user's access right for a specific entity
 */
export const getUserAccessRight = (
  user: User,
  entity: AccessControlledEntity
): MemberAccessRight => {
  // Admin has full access
  if (isUserAdmin(user)) {
    return MemberAccessRight.ADMIN;
  }
  
  // Check if user is the creator
  if (entity.created_by && entity.created_by === user.id) {
    return MemberAccessRight.ADMIN;
  }
  
  // Check authorized members
  if (!entity.authorized_members || entity.authorized_members.length === 0) {
    return MemberAccessRight.NONE;
  }
  
  const member = entity.authorized_members.find(m => m.id === user.id);
  if (!member) {
    return MemberAccessRight.NONE;
  }
  
  return member.access_right as MemberAccessRight;
};

/**
 * Check if user can access an entity with required access level
 */
export const canAccessEntity = (
  user: User | null | undefined,
  entity: AccessControlledEntity,
  requiredLevel: MemberAccessRight = MemberAccessRight.VIEW
): boolean => {
  if (!user) {
    return false;
  }
  
  // Admin bypass
  if (isUserAdmin(user)) {
    return true;
  }
  
  const userAccess = getUserAccessRight(user, entity);
  
  // Map access levels to numeric values for comparison
  const accessLevels: Record<MemberAccessRight, number> = {
    [MemberAccessRight.NONE]: 0,
    [MemberAccessRight.VIEW]: 1,
    [MemberAccessRight.EDIT]: 2,
    [MemberAccessRight.ADMIN]: 3
  };
  
  return accessLevels[userAccess] >= accessLevels[requiredLevel];
};

/**
 * Check if user can view an entity
 */
export const canViewEntity = (
  user: User | null | undefined,
  entity: AccessControlledEntity
): boolean => {
  return canAccessEntity(user, entity, MemberAccessRight.VIEW);
};

/**
 * Check if user can edit an entity
 */
export const canEditEntity = (
  user: User | null | undefined,
  entity: AccessControlledEntity
): boolean => {
  return canAccessEntity(user, entity, MemberAccessRight.EDIT);
};

/**
 * Check if user can delete an entity
 */
export const canDeleteEntity = (
  user: User | null | undefined,
  entity: AccessControlledEntity
): boolean => {
  return canAccessEntity(user, entity, MemberAccessRight.ADMIN);
};

/**
 * Check if user belongs to the same organization as the entity
 */
export const isInSameOrganization = (
  user: User,
  entity: AccessControlledEntity
): boolean => {
  if (!user.organization_id || !entity.organization_id) {
    return false;
  }
  
  return user.organization_id === entity.organization_id;
};

/**
 * Filter entities based on user access
 */
export const filterEntitiesByAccess = <T extends AccessControlledEntity>(
  user: User | null | undefined,
  entities: T[],
  requiredLevel: MemberAccessRight = MemberAccessRight.VIEW
): T[] => {
  if (!user) {
    return [];
  }
  
  // Admin sees all
  if (isUserAdmin(user)) {
    return entities;
  }
  
  return entities.filter(entity => canAccessEntity(user, entity, requiredLevel));
};

/**
 * Add authorized member to an entity
 */
export const addAuthorizedMember = (
  entity: AccessControlledEntity,
  userId: string,
  accessRight: MemberAccessRight
): AuthorizedMember[] => {
  const members = entity.authorized_members || [];
  
  // Check if user already has access
  const existing = members.find(m => m.id === userId);
  if (existing) {
    // Update access right
    return members.map(m => 
      m.id === userId ? { ...m, access_right: accessRight } : m
    );
  }
  
  // Add new member
  return [...members, { id: userId, access_right: accessRight }];
};

/**
 * Remove authorized member from an entity
 */
export const removeAuthorizedMember = (
  entity: AccessControlledEntity,
  userId: string
): AuthorizedMember[] => {
  const members = entity.authorized_members || [];
  return members.filter(m => m.id !== userId);
};

/**
 * Check if user can grant/revoke access to others
 */
export const canManageAccess = (
  user: User | null | undefined,
  entity: AccessControlledEntity
): boolean => {
  if (!user) {
    return false;
  }
  
  // Admin can manage all access
  if (isUserAdmin(user)) {
    return true;
  }
  
  // Users with SETTINGS_SET_ACCESSES capability can manage access
  if (isUserHasCapability(user, CAPABILITIES.SETTINGS_SET_ACCESSES)) {
    return true;
  }
  
  // Entity admins can manage access
  return getUserAccessRight(user, entity) === MemberAccessRight.ADMIN;
};

// Re-export for convenience
export { CAPABILITIES, type Capability, isPrivilegedCapability } from './capabilities';
export { ROLE_TEMPLATES, getCapabilitiesForRole } from './capabilities';
