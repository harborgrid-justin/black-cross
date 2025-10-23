/**
 * Access Control Tests
 */

import {
  isUserHasCapability,
  isUserHasAnyCapability,
  isUserHasAllCapabilities,
  isUserAdmin,
  isUserOrgAdmin,
  isOnlyOrgAdmin,
  getUserAccessRight,
  canAccessEntity,
  canViewEntity,
  canEditEntity,
  canDeleteEntity,
  filterEntitiesByAccess,
  addAuthorizedMember,
  removeAuthorizedMember,
  canManageAccess,
  MemberAccessRight,
  CAPABILITIES,
  type AccessControlledEntity
} from '../index';
import type { User } from '../../../models/User';

describe('Access Control System', () => {
  const mockUser = (capabilities: string[] = []): User => ({
    id: 'user1',
    capabilities,
    organization_id: 'org1'
  } as User);

  const mockEntity = (
    authorized_members: any[] = [],
    created_by?: string
  ): AccessControlledEntity => ({
    id: 'entity1',
    authorized_members,
    created_by,
    organization_id: 'org1'
  });

  describe('isUserHasCapability', () => {
    it('should return true for user with capability', () => {
      const user = mockUser([CAPABILITIES.KNOWLEDGE_READ]);
      expect(isUserHasCapability(user, CAPABILITIES.KNOWLEDGE_READ)).toBe(true);
    });

    it('should return false for user without capability', () => {
      const user = mockUser([CAPABILITIES.KNOWLEDGE_READ]);
      expect(isUserHasCapability(user, CAPABILITIES.KNOWLEDGE_DELETE)).toBe(false);
    });

    it('should return true for admin with BYPASS_ENTERPRISE', () => {
      const user = mockUser([CAPABILITIES.BYPASS_ENTERPRISE]);
      expect(isUserHasCapability(user, CAPABILITIES.KNOWLEDGE_DELETE)).toBe(true);
      expect(isUserHasCapability(user, CAPABILITIES.USER_DELETE)).toBe(true);
    });

    it('should return false for null user', () => {
      expect(isUserHasCapability(null, CAPABILITIES.KNOWLEDGE_READ)).toBe(false);
    });
  });

  describe('isUserHasAnyCapability', () => {
    it('should return true if user has at least one capability', () => {
      const user = mockUser([CAPABILITIES.KNOWLEDGE_READ]);
      expect(isUserHasAnyCapability(user, [
        CAPABILITIES.KNOWLEDGE_READ,
        CAPABILITIES.KNOWLEDGE_CREATE
      ])).toBe(true);
    });

    it('should return false if user has none of the capabilities', () => {
      const user = mockUser([CAPABILITIES.KNOWLEDGE_READ]);
      expect(isUserHasAnyCapability(user, [
        CAPABILITIES.KNOWLEDGE_DELETE,
        CAPABILITIES.KNOWLEDGE_CREATE
      ])).toBe(false);
    });
  });

  describe('isUserHasAllCapabilities', () => {
    it('should return true if user has all capabilities', () => {
      const user = mockUser([
        CAPABILITIES.KNOWLEDGE_READ,
        CAPABILITIES.KNOWLEDGE_CREATE
      ]);
      expect(isUserHasAllCapabilities(user, [
        CAPABILITIES.KNOWLEDGE_READ,
        CAPABILITIES.KNOWLEDGE_CREATE
      ])).toBe(true);
    });

    it('should return false if user is missing any capability', () => {
      const user = mockUser([CAPABILITIES.KNOWLEDGE_READ]);
      expect(isUserHasAllCapabilities(user, [
        CAPABILITIES.KNOWLEDGE_READ,
        CAPABILITIES.KNOWLEDGE_CREATE
      ])).toBe(false);
    });
  });

  describe('isUserAdmin', () => {
    it('should return true for admin', () => {
      const user = mockUser([CAPABILITIES.BYPASS_ENTERPRISE]);
      expect(isUserAdmin(user)).toBe(true);
    });

    it('should return false for non-admin', () => {
      const user = mockUser([CAPABILITIES.KNOWLEDGE_READ]);
      expect(isUserAdmin(user)).toBe(false);
    });
  });

  describe('isUserOrgAdmin', () => {
    it('should return true for org admin', () => {
      const user = mockUser([CAPABILITIES.VIRTUAL_ORGANIZATION_ADMIN]);
      expect(isUserOrgAdmin(user)).toBe(true);
    });

    it('should return true for full admin', () => {
      const user = mockUser([CAPABILITIES.BYPASS_ENTERPRISE]);
      expect(isUserOrgAdmin(user)).toBe(true);
    });

    it('should return false for regular user', () => {
      const user = mockUser([CAPABILITIES.KNOWLEDGE_READ]);
      expect(isUserOrgAdmin(user)).toBe(false);
    });
  });

  describe('isOnlyOrgAdmin', () => {
    it('should return true for org admin only', () => {
      const user = mockUser([CAPABILITIES.VIRTUAL_ORGANIZATION_ADMIN]);
      expect(isOnlyOrgAdmin(user)).toBe(true);
    });

    it('should return false for full admin', () => {
      const user = mockUser([
        CAPABILITIES.VIRTUAL_ORGANIZATION_ADMIN,
        CAPABILITIES.BYPASS_ENTERPRISE
      ]);
      expect(isOnlyOrgAdmin(user)).toBe(false);
    });
  });

  describe('getUserAccessRight', () => {
    it('should return ADMIN for admin users', () => {
      const user = mockUser([CAPABILITIES.BYPASS_ENTERPRISE]);
      const entity = mockEntity();
      expect(getUserAccessRight(user, entity)).toBe(MemberAccessRight.ADMIN);
    });

    it('should return ADMIN for creator', () => {
      const user = mockUser();
      const entity = mockEntity([], user.id);
      expect(getUserAccessRight(user, entity)).toBe(MemberAccessRight.ADMIN);
    });

    it('should return correct access right from authorized members', () => {
      const user = mockUser();
      const entity = mockEntity([
        { id: user.id, access_right: MemberAccessRight.EDIT }
      ]);
      expect(getUserAccessRight(user, entity)).toBe(MemberAccessRight.EDIT);
    });

    it('should return NONE if user is not authorized', () => {
      const user = mockUser();
      const entity = mockEntity([
        { id: 'otheruser', access_right: MemberAccessRight.ADMIN }
      ]);
      expect(getUserAccessRight(user, entity)).toBe(MemberAccessRight.NONE);
    });
  });

  describe('canAccessEntity', () => {
    it('should allow access with sufficient rights', () => {
      const user = mockUser();
      const entity = mockEntity([
        { id: user.id, access_right: MemberAccessRight.EDIT }
      ]);
      
      expect(canAccessEntity(user, entity, MemberAccessRight.VIEW)).toBe(true);
      expect(canAccessEntity(user, entity, MemberAccessRight.EDIT)).toBe(true);
      expect(canAccessEntity(user, entity, MemberAccessRight.ADMIN)).toBe(false);
    });

    it('should deny access with insufficient rights', () => {
      const user = mockUser();
      const entity = mockEntity([
        { id: user.id, access_right: MemberAccessRight.VIEW }
      ]);
      
      expect(canAccessEntity(user, entity, MemberAccessRight.EDIT)).toBe(false);
      expect(canAccessEntity(user, entity, MemberAccessRight.ADMIN)).toBe(false);
    });

    it('should allow admin full access', () => {
      const user = mockUser([CAPABILITIES.BYPASS_ENTERPRISE]);
      const entity = mockEntity();
      
      expect(canAccessEntity(user, entity, MemberAccessRight.ADMIN)).toBe(true);
    });
  });

  describe('canViewEntity, canEditEntity, canDeleteEntity', () => {
    it('should work correctly for different access levels', () => {
      const user = mockUser();
      const entity = mockEntity([
        { id: user.id, access_right: MemberAccessRight.EDIT }
      ]);
      
      expect(canViewEntity(user, entity)).toBe(true);
      expect(canEditEntity(user, entity)).toBe(true);
      expect(canDeleteEntity(user, entity)).toBe(false);
    });
  });

  describe('filterEntitiesByAccess', () => {
    it('should filter entities based on access rights', () => {
      const user = mockUser();
      const entities = [
        mockEntity([{ id: user.id, access_right: MemberAccessRight.VIEW }]),
        mockEntity([{ id: 'otheruser', access_right: MemberAccessRight.VIEW }]),
        mockEntity([{ id: user.id, access_right: MemberAccessRight.EDIT }])
      ];
      
      const accessible = filterEntitiesByAccess(user, entities);
      expect(accessible).toHaveLength(2);
    });

    it('should return all entities for admin', () => {
      const user = mockUser([CAPABILITIES.BYPASS_ENTERPRISE]);
      const entities = [
        mockEntity(),
        mockEntity(),
        mockEntity()
      ];
      
      const accessible = filterEntitiesByAccess(user, entities);
      expect(accessible).toHaveLength(3);
    });
  });

  describe('addAuthorizedMember', () => {
    it('should add new member', () => {
      const entity = mockEntity();
      const updated = addAuthorizedMember(entity, 'user2', MemberAccessRight.VIEW);
      
      expect(updated).toHaveLength(1);
      expect(updated[0]).toEqual({
        id: 'user2',
        access_right: MemberAccessRight.VIEW
      });
    });

    it('should update existing member', () => {
      const entity = mockEntity([
        { id: 'user2', access_right: MemberAccessRight.VIEW }
      ]);
      const updated = addAuthorizedMember(entity, 'user2', MemberAccessRight.EDIT);
      
      expect(updated).toHaveLength(1);
      expect(updated[0].access_right).toBe(MemberAccessRight.EDIT);
    });
  });

  describe('removeAuthorizedMember', () => {
    it('should remove member', () => {
      const entity = mockEntity([
        { id: 'user2', access_right: MemberAccessRight.VIEW },
        { id: 'user3', access_right: MemberAccessRight.EDIT }
      ]);
      const updated = removeAuthorizedMember(entity, 'user2');
      
      expect(updated).toHaveLength(1);
      expect(updated[0].id).toBe('user3');
    });
  });

  describe('canManageAccess', () => {
    it('should allow admin to manage access', () => {
      const user = mockUser([CAPABILITIES.BYPASS_ENTERPRISE]);
      const entity = mockEntity();
      
      expect(canManageAccess(user, entity)).toBe(true);
    });

    it('should allow entity admin to manage access', () => {
      const user = mockUser();
      const entity = mockEntity([
        { id: user.id, access_right: MemberAccessRight.ADMIN }
      ]);
      
      expect(canManageAccess(user, entity)).toBe(true);
    });

    it('should allow users with SETTINGS_SET_ACCESSES to manage access', () => {
      const user = mockUser([CAPABILITIES.SETTINGS_SET_ACCESSES]);
      const entity = mockEntity();
      
      expect(canManageAccess(user, entity)).toBe(true);
    });

    it('should deny access management for regular users', () => {
      const user = mockUser();
      const entity = mockEntity([
        { id: user.id, access_right: MemberAccessRight.EDIT }
      ]);
      
      expect(canManageAccess(user, entity)).toBe(false);
    });
  });
});
