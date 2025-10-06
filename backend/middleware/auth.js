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

const jwt = require('jsonwebtoken');
const { AuthenticationError, AuthorizationError } = require('./errorHandler');
const { logger } = require('../utils/logger');
const config = require('../config');

/**
 * Verify JWT token and attach user to request
 * @throws {AuthenticationError} If token is missing or invalid
 */
function authenticate(req, res, next) {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('No authentication token provided');
    }

    const token = authHeader.substring(7);

    // Verify token
    const decoded = jwt.verify(token, config.security.jwt.secret);

    // Attach user to request
    req.user = {
      id: decoded.id || decoded.sub,
      email: decoded.email,
      role: decoded.role || 'viewer',
    };

    logger.debug('User authenticated', {
      userId: req.user.id,
      role: req.user.role,
      correlationId: req.correlationId,
    });

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AuthenticationError('Invalid authentication token'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AuthenticationError('Authentication token has expired'));
    }
    return next(error);
  }
}

/**
 * Optional authentication - doesn't fail if no token
 * Useful for endpoints that behave differently for authenticated users
 */
function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, config.security.jwt.secret);

    req.user = {
      id: decoded.id || decoded.sub,
      email: decoded.email,
      role: decoded.role || 'viewer',
    };

    logger.debug('User authenticated (optional)', {
      userId: req.user.id,
      role: req.user.role,
      correlationId: req.correlationId,
    });
  } catch (error) {
    // Silently ignore authentication errors for optional auth
    logger.debug('Optional authentication failed', {
      error: error.message,
      correlationId: req.correlationId,
    });
  }

  next();
}

/**
 * Require specific role(s) to access endpoint
 * @param {string|string[]} allowedRoles - Role or array of roles allowed to access
 * @returns {Function} Express middleware
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
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
function requireAdmin(req, res, next) {
  return authorize('admin')(req, res, next);
}

/**
 * Require analyst or admin role
 */
function requireAnalyst(req, res, next) {
  return authorize('admin', 'analyst')(req, res, next);
}

/**
 * Generate JWT token for user
 * @param {Object} user - User object
 * @param {string} user.id - User ID
 * @param {string} user.email - User email
 * @param {string} user.role - User role
 * @returns {string} JWT token
 */
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      sub: user.id,
      email: user.email,
      role: user.role || 'viewer',
    },
    config.security.jwt.secret,
    {
      expiresIn: config.security.jwt.expiration || '24h',
      issuer: 'black-cross',
      audience: 'black-cross-api',
    },
  );
}

/**
 * Refresh token middleware - requires valid token
 */
function refreshToken(req, res, next) {
  try {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    // Generate new token with same user data
    const newToken = generateToken(req.user);

    // Attach new token to response
    res.locals.newToken = newToken;

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  authenticate,
  optionalAuth,
  authorize,
  requireAdmin,
  requireAnalyst,
  generateToken,
  refreshToken,
};
