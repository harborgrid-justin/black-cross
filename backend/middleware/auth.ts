/**
 * Authentication & Authorization Middleware
 * Protects API endpoints with JWT-based authentication
 *
 * Features:
 * - JWT token verification
 * - Role-based access control (RBAC)
 * - User context injection
 * - Token blacklist support
 */

import jwt, { type JwtPayload } from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import {  AuthenticationError, AuthorizationError  } from './errorHandler';
import {  logger  } from '../utils/logger';
import config from '../config';
import { JWT } from '../constants';

interface DecodedToken extends JwtPayload {
  id?: string;
  sub?: string;
  email: string;
  role?: string;
}

/**
 * Verify JWT token and attach user to request
 * @throws {AuthenticationError} If token is missing or invalid
 */
function authenticate(req: Request, res: Response, next: NextFunction): void {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('No authentication token provided');
    }

    const token = authHeader.substring(7);

    // Verify token
    const decoded = jwt.verify(token, config.security.jwt.secret) as DecodedToken;

    // Attach user to request
    req.user = {
      id: decoded.id || decoded.sub || '',
      email: decoded.email,
      role: decoded.role || 'viewer',
    };

    logger.debug('User authenticated', {
      userId: req.user.id,
      role: req.user.role,
      correlationId: req.correlationId,
    });

    next();
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.name === 'JsonWebTokenError') {
        return next(new AuthenticationError('Invalid authentication token'));
      }
      if (error.name === 'TokenExpiredError') {
        return next(new AuthenticationError('Authentication token has expired'));
      }
    }
    return next(error);
  }
}

/**
 * Optional authentication - doesn't fail if no token
 * Useful for endpoints that behave differently for authenticated users
 */
function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, config.security.jwt.secret) as DecodedToken;

    req.user = {
      id: decoded.id || decoded.sub || '',
      email: decoded.email,
      role: decoded.role || 'viewer',
    };

    logger.debug('User authenticated (optional)', {
      userId: req.user.id,
      role: req.user.role,
      correlationId: req.correlationId,
    });
  } catch (error: unknown) {
    // Silently ignore authentication errors for optional auth
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.debug('Optional authentication failed', {
      error: errorMessage,
      correlationId: req.correlationId,
    });
  }

  next();
}

/**
 * Require specific role(s) to access endpoint
 * @param allowedRoles - Role or array of roles allowed to access
 * @returns Express middleware
 */
function authorize(...allowedRoles: string[]): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AuthenticationError('Authentication required'));
    }

    const userRole = req.user.role;
    const roles = Array.isArray(allowedRoles[0]) ? allowedRoles[0] : allowedRoles;

    if (!roles.includes(userRole)) {
      logger.warn('Authorization failed', {
        userId: req.user.id,
        userRole,
        requiredRoles: roles,
        path: req.path,
        method: req.method,
        correlationId: req.correlationId,
      });

      return next(new AuthorizationError(
        `Access denied. Required role: ${roles.join(' or ')}`,
      ));
    }

    logger.debug('User authorized', {
      userId: req.user.id,
      userRole,
      correlationId: req.correlationId,
    });

    next();
  };
}

/**
 * Require admin role
 */
function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  return authorize('admin')(req, res, next);
}

/**
 * Require analyst or admin role
 */
function requireAnalyst(req: Request, res: Response, next: NextFunction): void {
  return authorize('admin', 'analyst')(req, res, next);
}

/**
 * Generate JWT token for user
 * @param user - User object
 * @returns JWT token
 */
interface UserData {
  id: string;
  email: string;
  role: string;
}

function generateToken(user: UserData): string {
  return jwt.sign(
    {
      id: user.id,
      sub: user.id,
      email: user.email,
      role: user.role || 'viewer',
    },
    config.security.jwt.secret,
    {
      expiresIn: config.security.jwt.expiration || JWT.DEFAULT_EXPIRATION,
      issuer: JWT.ISSUER,
      audience: JWT.AUDIENCE,
    },
  );
}

/**
 * Refresh token middleware - requires valid token
 */
function refreshToken(req: Request, res: Response, next: NextFunction): void {
  try {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    // Generate new token with same user data
    const newToken = generateToken({
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
    });

    // Attach new token to response
    res.locals.newToken = newToken;

    next();
  } catch (error: unknown) {
    next(error);
  }
}

export default {
  authenticate,
  optionalAuth,
  authorize,
  requireAdmin,
  requireAnalyst,
  generateToken,
  refreshToken,
};

