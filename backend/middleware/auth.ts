/**
 * Authentication & Authorization Middleware
 *
 * Provides comprehensive JWT-based authentication and role-based access control (RBAC)
 * for protecting API endpoints in the Black-Cross threat intelligence platform.
 *
 * This module implements a multi-layered security approach including:
 * - JWT token verification with signature validation and expiration checking
 * - Role-based access control (RBAC) with support for multiple roles
 * - Token blacklist support for revoked tokens and user-level invalidation
 * - User context injection into Express request objects
 * - Optional authentication for public endpoints with user-specific features
 * - Token refresh mechanism for maintaining sessions
 *
 * @module middleware/auth
 * @see {@link https://jwt.io/} for JWT specification
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * // Protect an endpoint with authentication
 * router.get('/profile', authenticate, getProfile);
 *
 * // Require admin role
 * router.delete('/users/:id', authenticate, requireAdmin, deleteUser);
 *
 * // Require analyst or admin role
 * router.post('/incidents', authenticate, requireAnalyst, createIncident);
 *
 * // Custom role authorization
 * router.put('/settings', authenticate, authorize('admin', 'manager'), updateSettings);
 *
 * // Optional authentication for endpoints that enhance features for authenticated users
 * router.get('/public-data', optionalAuth, getPublicData);
 * ```
 */

import jwt, { type JwtPayload } from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import { AuthenticationError, AuthorizationError } from './errorHandler';
import { logger } from '../utils/logger';
import config from '../config';
import { JWT } from '../constants';
import { tokenBlacklist } from '../utils/tokenBlacklist';

/**
 * Decoded JWT token payload structure.
 *
 * Extends the standard JWT payload with application-specific user information.
 * The token contains user identity, role information, and standard JWT claims
 * for security validation.
 *
 * @interface DecodedToken
 * @extends {JwtPayload}
 *
 * @property {string} [id] - User's unique identifier (legacy field, use sub if available)
 * @property {string} [sub] - JWT standard subject claim containing user ID
 * @property {string} email - User's email address for identification
 * @property {string} [role] - User's role for authorization (e.g., 'admin', 'analyst', 'viewer')
 * @property {number} [iat] - Inherited from JwtPayload - Token issued at timestamp (seconds since epoch)
 * @property {number} [exp] - Inherited from JwtPayload - Token expiration timestamp (seconds since epoch)
 * @property {string} [iss] - Inherited from JwtPayload - Token issuer
 * @property {string} [aud] - Inherited from JwtPayload - Token audience
 *
 * @example
 * ```typescript
 * const decoded: DecodedToken = {
 *   id: 'user-123',
 *   sub: 'user-123',
 *   email: 'analyst@example.com',
 *   role: 'analyst',
 *   iat: 1634567890,
 *   exp: 1634654290,
 *   iss: 'black-cross-platform',
 *   aud: 'black-cross-api'
 * };
 * ```
 */
interface DecodedToken extends JwtPayload {
  id?: string;
  sub?: string;
  email: string;
  role?: string;
}

/**
 * Express middleware for JWT token authentication.
 *
 * Verifies the JWT token from the Authorization header, validates its signature and expiration,
 * checks against token blacklists, and attaches the authenticated user information to the
 * request object for downstream middleware and route handlers.
 *
 * This middleware performs comprehensive security checks:
 * 1. Validates Authorization header format (must be "Bearer <token>")
 * 2. Verifies JWT signature using the configured secret key
 * 3. Checks token expiration timestamp
 * 4. Validates against individual token blacklist (for revoked tokens)
 * 5. Validates against user-level blacklist (for security events like password changes)
 * 6. Injects user context into req.user for authorization checks
 *
 * @async
 * @function authenticate
 * @param {Request} req - Express request object with Authorization header
 * @param {Response} res - Express response object (not modified by this middleware)
 * @param {NextFunction} next - Express next function to pass control to next middleware
 * @returns {Promise<void>} Resolves when authentication succeeds, calls next() with error on failure
 *
 * @throws {AuthenticationError} When Authorization header is missing or malformed
 * @throws {AuthenticationError} When JWT token signature is invalid
 * @throws {AuthenticationError} When JWT token has expired
 * @throws {AuthenticationError} When token is found in the blacklist (revoked)
 * @throws {AuthenticationError} When user's tokens have been invalidated due to security events
 *
 * @example
 * ```typescript
 * // Protect a route with authentication
 * import auth from './middleware/auth';
 * router.get('/api/v1/profile', auth.authenticate, getProfileHandler);
 *
 * // Access authenticated user in route handler
 * async function getProfileHandler(req: Request, res: Response) {
 *   const userId = req.user.id; // User ID injected by authenticate middleware
 *   const userRole = req.user.role; // User role for authorization
 *   // ... fetch and return user profile
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Chain with authorization middleware
 * router.delete(
 *   '/api/v1/incidents/:id',
 *   auth.authenticate,
 *   auth.requireAdmin,
 *   deleteIncidentHandler
 * );
 * ```
 *
 * @remarks
 * The middleware expects the Authorization header in the format: "Bearer <JWT_TOKEN>"
 * After successful authentication, req.user will contain: { id, email, role }
 * The middleware uses the tokenBlacklist utility for revocation checks, which supports
 * both individual token revocation and user-level token invalidation.
 *
 * @see {@link optionalAuth} for non-required authentication
 * @see {@link authorize} for role-based authorization
 */
async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AuthenticationError('No authentication token provided');
    }

    const token = authHeader.substring(7);

    // Verify token signature and expiration
    const decoded = jwt.verify(token, config.security.jwt.secret) as DecodedToken;

    // Check if token is blacklisted
    if (await tokenBlacklist.isBlacklisted(token)) {
      logger.warn('Blacklisted token used', {
        userId: decoded.id || decoded.sub,
        correlationId: req.correlationId,
      });
      throw new AuthenticationError('Token has been revoked');
    }

    // Check if all user tokens were invalidated
    const userId = decoded.id || decoded.sub || '';
    const tokenIssuedAt = decoded.iat || 0;
    if (await tokenBlacklist.isUserBlacklisted(userId, tokenIssuedAt)) {
      logger.warn('User tokens invalidated', {
        userId,
        correlationId: req.correlationId,
      });
      throw new AuthenticationError('Token invalidated due to security update');
    }

    // Attach user to request
    req.user = {
      id: userId,
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
 * Express middleware for optional JWT token authentication.
 *
 * Attempts to authenticate the user if a valid JWT token is provided in the Authorization
 * header, but unlike {@link authenticate}, it does not fail the request if no token is
 * present or if the token is invalid. This is useful for public endpoints that provide
 * enhanced functionality or personalized content for authenticated users.
 *
 * Behavior:
 * - If a valid token is present: Attaches user information to req.user
 * - If no token is present: Continues without attaching req.user
 * - If token is invalid/expired: Logs the error and continues without attaching req.user
 *
 * @function optionalAuth
 * @param {Request} req - Express request object with optional Authorization header
 * @param {Response} res - Express response object (not modified by this middleware)
 * @param {NextFunction} next - Express next function to pass control to next middleware
 * @returns {void} Always calls next() to continue the middleware chain
 *
 * @example
 * ```typescript
 * // Public endpoint that shows different data for authenticated users
 * router.get('/api/v1/threat-feeds', optionalAuth, getThreatFeedsHandler);
 *
 * async function getThreatFeedsHandler(req: Request, res: Response) {
 *   if (req.user) {
 *     // User is authenticated - show personalized feeds
 *     return res.json(await getPersonalizedFeeds(req.user.id));
 *   }
 *   // User is not authenticated - show public feeds
 *   return res.json(await getPublicFeeds());
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Endpoint that shows more detailed information for authenticated users
 * router.get('/api/v1/iocs/:id', optionalAuth, getIOCDetailsHandler);
 *
 * async function getIOCDetailsHandler(req: Request, res: Response) {
 *   const ioc = await getIOC(req.params.id);
 *   const detailLevel = req.user?.role === 'admin' ? 'full' : 'basic';
 *   return res.json(filterIOCDetails(ioc, detailLevel));
 * }
 * ```
 *
 * @remarks
 * This middleware never throws errors or calls next() with an error parameter.
 * Authentication failures are logged at debug level but do not interrupt request processing.
 * Unlike {@link authenticate}, this middleware does not check token blacklists for performance
 * reasons, as it's typically used for non-critical features.
 *
 * @see {@link authenticate} for required authentication
 */
function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
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
 * Creates an authorization middleware that enforces role-based access control (RBAC).
 *
 * This higher-order function returns an Express middleware that validates the authenticated
 * user's role against a list of allowed roles. It must be used after the {@link authenticate}
 * middleware, as it requires req.user to be populated with user information.
 *
 * The middleware checks if the user's role matches any of the provided allowed roles. If the
 * user's role is not in the allowed list, it throws an AuthorizationError. If authentication
 * is missing (req.user is undefined), it throws an AuthenticationError.
 *
 * @function authorize
 * @param {...string} allowedRoles - One or more role names that are permitted to access the endpoint
 * @returns {Function} Express middleware function that performs role-based authorization
 *
 * @throws {AuthenticationError} When req.user is not present (authentication middleware not applied)
 * @throws {AuthorizationError} When user's role is not in the allowedRoles list
 *
 * @example
 * ```typescript
 * // Single role authorization - only admins
 * router.delete('/api/v1/users/:id', authenticate, authorize('admin'), deleteUser);
 *
 * // Multiple roles authorization - admins or analysts
 * router.post('/api/v1/incidents', authenticate, authorize('admin', 'analyst'), createIncident);
 *
 * // Multiple roles - managers, admins, or analysts
 * router.put(
 *   '/api/v1/threat-actors/:id',
 *   authenticate,
 *   authorize('admin', 'analyst', 'manager'),
 *   updateThreatActor
 * );
 * ```
 *
 * @example
 * ```typescript
 * // Combining with other middleware
 * router.post(
 *   '/api/v1/reports',
 *   authenticate,          // First authenticate the user
 *   authorize('admin', 'analyst'), // Then check role
 *   validateReport,        // Then validate request body
 *   createReportHandler    // Finally execute handler
 * );
 * ```
 *
 * @remarks
 * - This middleware must be placed after {@link authenticate} in the middleware chain
 * - Role comparison is case-sensitive (use lowercase: 'admin', not 'Admin')
 * - Authorization failures are logged with user ID, role, required roles, and request details
 * - The default role for users without an explicit role is 'viewer'
 * - Consider using convenience functions {@link requireAdmin} or {@link requireAnalyst} for common cases
 *
 * @see {@link authenticate} which must precede this middleware
 * @see {@link requireAdmin} for admin-only authorization
 * @see {@link requireAnalyst} for analyst or admin authorization
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
 * Convenience middleware that requires admin role for endpoint access.
 *
 * This is a shorthand wrapper around {@link authorize}('admin') that restricts access
 * to only users with the 'admin' role. It must be used after the {@link authenticate}
 * middleware in the middleware chain.
 *
 * @function requireAdmin
 * @param {Request} req - Express request object with req.user populated by authenticate middleware
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function to pass control to next middleware
 * @returns {void} Calls next() if user is admin, or next(error) if not authorized
 *
 * @throws {AuthenticationError} When req.user is not present (authentication middleware not applied)
 * @throws {AuthorizationError} When user's role is not 'admin'
 *
 * @example
 * ```typescript
 * // Restrict user deletion to admins only
 * router.delete('/api/v1/users/:id', authenticate, requireAdmin, deleteUserHandler);
 *
 * // Protect system configuration endpoints
 * router.put('/api/v1/config/security', authenticate, requireAdmin, updateSecurityConfig);
 *
 * // Admin-only audit log access
 * router.get('/api/v1/audit-logs', authenticate, requireAdmin, getAuditLogsHandler);
 * ```
 *
 * @remarks
 * This is functionally equivalent to using authorize('admin') but provides clearer intent
 * in route definitions. Use this for endpoints that should only be accessible to system
 * administrators, such as user management, system configuration, and audit logs.
 *
 * @see {@link authenticate} which must precede this middleware
 * @see {@link authorize} for custom role combinations
 * @see {@link requireAnalyst} for analyst or admin access
 */
function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  return authorize('admin')(req, res, next);
}

/**
 * Convenience middleware that requires analyst or admin role for endpoint access.
 *
 * This is a shorthand wrapper around {@link authorize}('admin', 'analyst') that restricts
 * access to users with either 'analyst' or 'admin' roles. It's designed for threat intelligence
 * operations where both analysts and administrators need access. Must be used after the
 * {@link authenticate} middleware in the middleware chain.
 *
 * @function requireAnalyst
 * @param {Request} req - Express request object with req.user populated by authenticate middleware
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function to pass control to next middleware
 * @returns {void} Calls next() if user is analyst or admin, or next(error) if not authorized
 *
 * @throws {AuthenticationError} When req.user is not present (authentication middleware not applied)
 * @throws {AuthorizationError} When user's role is neither 'analyst' nor 'admin'
 *
 * @example
 * ```typescript
 * // Analyst-level access for creating incidents
 * router.post('/api/v1/incidents', authenticate, requireAnalyst, createIncidentHandler);
 *
 * // Threat intelligence analysis endpoints
 * router.post('/api/v1/threat-actors', authenticate, requireAnalyst, createThreatActorHandler);
 * router.put('/api/v1/iocs/:id', authenticate, requireAnalyst, updateIOCHandler);
 *
 * // Vulnerability assessment operations
 * router.post('/api/v1/vulnerabilities', authenticate, requireAnalyst, createVulnerabilityHandler);
 * ```
 *
 * @remarks
 * This is functionally equivalent to using authorize('admin', 'analyst') but provides clearer
 * intent in route definitions. Use this for core threat intelligence and security analysis
 * operations that require analyst-level expertise. Analysts have broad access to create and
 * modify threat intelligence data, while viewers have read-only access.
 *
 * Role hierarchy: admin > analyst > viewer
 *
 * @see {@link authenticate} which must precede this middleware
 * @see {@link authorize} for custom role combinations
 * @see {@link requireAdmin} for admin-only access
 */
function requireAnalyst(req: Request, res: Response, next: NextFunction): void {
  return authorize('admin', 'analyst')(req, res, next);
}

/**
 * User data structure required for JWT token generation.
 *
 * Contains the essential user information that will be encoded into the JWT payload.
 * This data is used to create authenticated sessions and populate the req.user object
 * during token verification.
 *
 * @interface UserData
 *
 * @property {string} id - Unique user identifier (UUID or database primary key)
 * @property {string} email - User's email address for identification and communication
 * @property {string} role - User's role for authorization (e.g., 'admin', 'analyst', 'viewer')
 *
 * @example
 * ```typescript
 * const userData: UserData = {
 *   id: 'user-uuid-123',
 *   email: 'analyst@blackcross.io',
 *   role: 'analyst'
 * };
 * const token = generateToken(userData);
 * ```
 *
 * @see {@link generateToken} which uses this interface
 * @see {@link DecodedToken} for the decoded JWT payload structure
 */
interface UserData {
  id: string;
  email: string;
  role: string;
}

/**
 * Generates a signed JWT token for user authentication.
 *
 * Creates a JSON Web Token containing user identity and role information, signed with
 * the application's secret key. The token includes standard JWT claims (sub, iat, exp,
 * iss, aud) along with custom user data (id, email, role). Tokens are configured with
 * expiration time and can be verified by the {@link authenticate} middleware.
 *
 * The generated token should be:
 * - Sent to the client after successful login
 * - Stored securely (e.g., in httpOnly cookies or secure storage)
 * - Included in subsequent API requests via the Authorization header
 *
 * @function generateToken
 * @param {UserData} user - User data to encode in the token (id, email, role)
 * @returns {string} Signed JWT token string ready to be sent to client
 *
 * @example
 * ```typescript
 * // After successful login
 * import auth from './middleware/auth';
 *
 * async function loginHandler(req: Request, res: Response) {
 *   const user = await validateCredentials(req.body.email, req.body.password);
 *
 *   const token = auth.generateToken({
 *     id: user.id,
 *     email: user.email,
 *     role: user.role
 *   });
 *
 *   res.json({
 *     success: true,
 *     token,
 *     user: {
 *       id: user.id,
 *       email: user.email,
 *       role: user.role
 *     }
 *   });
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Client-side usage (send token in Authorization header)
 * const response = await fetch('/api/v1/incidents', {
 *   headers: {
 *     'Authorization': `Bearer ${token}`,
 *     'Content-Type': 'application/json'
 *   }
 * });
 * ```
 *
 * @remarks
 * Token configuration:
 * - Secret: Configured via config.security.jwt.secret (must be strong and kept secure)
 * - Expiration: Configured via config.security.jwt.expiration (default from JWT.DEFAULT_EXPIRATION)
 * - Issuer: Set to JWT.ISSUER constant ('black-cross-platform')
 * - Audience: Set to JWT.AUDIENCE constant ('black-cross-api')
 *
 * Security considerations:
 * - Tokens are signed but not encrypted (don't include sensitive data)
 * - Use HTTPS to prevent token interception during transmission
 * - Implement token rotation for long-lived sessions
 * - Consider shorter expiration times for sensitive operations
 * - Tokens can be revoked using the tokenBlacklist utility
 *
 * @see {@link authenticate} for token verification
 * @see {@link refreshToken} for token renewal
 * @see {@link UserData} for the required user data structure
 */
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
 * Express middleware for refreshing JWT authentication tokens.
 *
 * Generates a new JWT token for an authenticated user while maintaining their current
 * session data (id, email, role). This middleware must be used after {@link authenticate}
 * to ensure req.user is populated. The new token is attached to res.locals.newToken
 * for the route handler to return to the client.
 *
 * This middleware enables session extension without requiring re-authentication, useful
 * for maintaining user sessions in single-page applications or long-running sessions.
 * The new token has a fresh expiration time based on the configured JWT expiration.
 *
 * @function refreshToken
 * @param {Request} req - Express request object with req.user populated by authenticate middleware
 * @param {Response} res - Express response object (new token stored in res.locals.newToken)
 * @param {NextFunction} next - Express next function to pass control to next middleware or handler
 * @returns {void} Calls next() with the new token in res.locals.newToken
 *
 * @throws {AuthenticationError} When req.user is not present (authentication middleware not applied)
 *
 * @example
 * ```typescript
 * // Define a refresh endpoint
 * import auth from './middleware/auth';
 *
 * router.post(
 *   '/api/v1/auth/refresh',
 *   auth.authenticate,  // Verify current token is valid
 *   auth.refreshToken,  // Generate new token
 *   (req: Request, res: Response) => {
 *     // New token is available in res.locals.newToken
 *     res.json({
 *       success: true,
 *       token: res.locals.newToken,
 *       user: req.user
 *     });
 *   }
 * );
 * ```
 *
 * @example
 * ```typescript
 * // Client-side token refresh implementation
 * async function refreshAuthToken(currentToken: string): Promise<string> {
 *   const response = await fetch('/api/v1/auth/refresh', {
 *     method: 'POST',
 *     headers: {
 *       'Authorization': `Bearer ${currentToken}`,
 *       'Content-Type': 'application/json'
 *     }
 *   });
 *
 *   const data = await response.json();
 *   if (data.success) {
 *     // Store the new token
 *     localStorage.setItem('authToken', data.token);
 *     return data.token;
 *   }
 *   throw new Error('Token refresh failed');
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Automatic token refresh before expiration
 * setInterval(async () => {
 *   const currentToken = getStoredToken();
 *   const decoded = parseJWT(currentToken);
 *   const timeUntilExpiry = decoded.exp * 1000 - Date.now();
 *
 *   // Refresh if token expires in less than 5 minutes
 *   if (timeUntilExpiry < 5 * 60 * 1000) {
 *     await refreshAuthToken(currentToken);
 *   }
 * }, 60000); // Check every minute
 * ```
 *
 * @remarks
 * Usage pattern:
 * 1. Client sends current valid token in Authorization header
 * 2. authenticate middleware validates the current token
 * 3. refreshToken middleware generates new token with fresh expiration
 * 4. Route handler returns the new token to the client
 * 5. Client replaces old token with new token
 *
 * Security considerations:
 * - The current token must still be valid (not expired or blacklisted)
 * - New token inherits the same user data and role from current token
 * - Old token remains valid until its original expiration
 * - Consider implementing token rotation (blacklist old token when issuing new one)
 * - For enhanced security, blacklist the old token immediately after refresh
 *
 * Best practices:
 * - Implement automatic refresh before token expiration on the client
 * - Use refresh tokens for long-lived sessions (consider separate refresh token pattern)
 * - Log token refresh events for security auditing
 * - Rate-limit refresh endpoint to prevent abuse
 *
 * @see {@link authenticate} which must precede this middleware
 * @see {@link generateToken} which this function uses internally
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

/**
 * Authentication and Authorization Middleware Module Export.
 *
 * Default export containing all authentication and authorization utilities
 * for the Black-Cross threat intelligence platform. Import this module to
 * access JWT authentication, role-based access control, and token management
 * functionality.
 *
 * @exports auth
 *
 * @example
 * ```typescript
 * // Import the entire auth module
 * import auth from './middleware/auth';
 *
 * // Use authentication middleware
 * router.get('/api/v1/profile', auth.authenticate, getProfile);
 *
 * // Use authorization middleware
 * router.delete('/api/v1/users/:id', auth.authenticate, auth.requireAdmin, deleteUser);
 *
 * // Generate tokens in login handler
 * const token = auth.generateToken({ id: user.id, email: user.email, role: user.role });
 * ```
 *
 * @example
 * ```typescript
 * // Import specific functions
 * import auth from './middleware/auth';
 * const { authenticate, requireAnalyst, generateToken } = auth;
 *
 * router.post('/api/v1/incidents', authenticate, requireAnalyst, createIncident);
 * ```
 */
export default {
  authenticate,
  optionalAuth,
  authorize,
  requireAdmin,
  requireAnalyst,
  generateToken,
  refreshToken,
};
