/**
 * Access Control Middleware
 * Provides Express middleware for capability and entity-level access control
 */

import { Request, Response, NextFunction } from 'express';
import {
  isUserHasCapability,
  canAccessEntity,
  MemberAccessRight,
  type Capability,
  type AccessControlledEntity
} from '../utils/access';

/**
 * Require a specific capability to access a route
 * 
 * @param capability The required capability
 * @param message Optional custom error message
 */
export const requireCapability = (capability: Capability, message?: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    if (!isUserHasCapability(req.user, capability)) {
      return res.status(403).json({
        success: false,
        error: message || 'Insufficient permissions',
        required_capability: capability
      });
    }
    
    next();
  };
};

/**
 * Require ANY of the provided capabilities
 * 
 * @param capabilities Array of capabilities (user needs at least one)
 */
export const requireAnyCapability = (...capabilities: Capability[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    const hasAny = capabilities.some(cap => isUserHasCapability(req.user!, cap));
    
    if (!hasAny) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        required_capabilities: capabilities
      });
    }
    
    next();
  };
};

/**
 * Require ALL of the provided capabilities
 * 
 * @param capabilities Array of capabilities (user needs all of them)
 */
export const requireAllCapabilities = (...capabilities: Capability[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    const missingCapabilities = capabilities.filter(
      cap => !isUserHasCapability(req.user!, cap)
    );
    
    if (missingCapabilities.length > 0) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        missing_capabilities: missingCapabilities
      });
    }
    
    next();
  };
};

/**
 * Require specific access level to an entity
 * Entity must be loaded and attached to req.entity or returned by entityGetter
 * 
 * @param entityGetter Function to get entity from request
 * @param requiredLevel Required access level (default: VIEW)
 */
export const requireEntityAccess = (
  entityGetter: (req: Request) => Promise<AccessControlledEntity | null>,
  requiredLevel: MemberAccessRight = MemberAccessRight.VIEW
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }
      
      const entity = await entityGetter(req);
      
      if (!entity) {
        return res.status(404).json({
          success: false,
          error: 'Entity not found'
        });
      }
      
      if (!canAccessEntity(req.user, entity, requiredLevel)) {
        return res.status(403).json({
          success: false,
          error: 'Insufficient access rights',
          required_level: requiredLevel
        });
      }
      
      // Attach entity to request for use in handler
      req.entity = entity;
      next();
    } catch (error: any) {
      next(error);
    }
  };
};

/**
 * Require user to be the creator of an entity
 * 
 * @param entityGetter Function to get entity from request
 */
export const requireCreator = (
  entityGetter: (req: Request) => Promise<AccessControlledEntity | null>
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }
      
      const entity = await entityGetter(req);
      
      if (!entity) {
        return res.status(404).json({
          success: false,
          error: 'Entity not found'
        });
      }
      
      if (entity.created_by !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'Only the creator can perform this action'
        });
      }
      
      req.entity = entity;
      next();
    } catch (error: any) {
      next(error);
    }
  };
};

/**
 * Helper: Get entity by ID from URL parameter
 */
export const getEntityById = (Model: any, paramName: string = 'id') => {
  return async (req: Request): Promise<AccessControlledEntity | null> => {
    const id = req.params[paramName];
    if (!id) {
      return null;
    }
    
    const entity = await Model.findByPk(id);
    return entity ? entity.toJSON() : null;
  };
};

// Augment Express Request type
declare global {
  namespace Express {
    interface Request {
      entity?: AccessControlledEntity;
    }
  }
}
