/**
 * CSRF Protection Middleware
 * Implements Double Submit Cookie pattern for CSRF protection
 *
 * Modern, secure alternative to deprecated csurf package
 *
 * How it works:
 * 1. Server generates random CSRF token and sends in cookie + response
 * 2. Client includes token in request header (X-CSRF-Token)
 * 3. Server validates cookie token matches header token
 *
 * @see https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html
 */

import type { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { AuthenticationError } from './errorHandler';

/**
 * CSRF token configuration
 */
interface CsrfConfig {
  /** Cookie name for CSRF token */
  readonly cookieName?: string;
  /** Header name for CSRF token */
  readonly headerName?: string;
  /** Cookie options */
  readonly cookieOptions?: {
    readonly httpOnly?: boolean;
    readonly secure?: boolean;
    readonly sameSite?: 'strict' | 'lax' | 'none';
    readonly maxAge?: number;
  };
  /** Routes to ignore (e.g., GET requests) */
  readonly ignoreMethods?: readonly string[];
}

const DEFAULT_CONFIG: Required<CsrfConfig> = {
  cookieName: 'XSRF-TOKEN',
  headerName: 'X-CSRF-Token',
  cookieOptions: {
    httpOnly: false, // Must be false so JavaScript can read it
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
  ignoreMethods: ['GET', 'HEAD', 'OPTIONS'],
};

/**
 * Generate cryptographically secure random token
 */
function generateToken(): string {
  return crypto.randomBytes(32).toString('base64url');
}

/**
 * Extend Express Request to include CSRF token
 */
declare global {
  namespace Express {
    interface Request {
      csrfToken?: () => string;
    }
  }
}

/**
 * Create CSRF protection middleware
 *
 * @param config - CSRF configuration
 * @returns Express middleware
 *
 * @example
 * ```typescript
 * import { csrfProtection } from './middleware/csrf';
 *
 * app.use(csrfProtection());
 *
 * // Endpoint to get CSRF token
 * app.get('/api/v1/csrf-token', (req, res) => {
 *   res.json({ csrfToken: req.csrfToken() });
 * });
 * ```
 */
export function csrfProtection(config: CsrfConfig = {}): (req: Request, res: Response, next: NextFunction) => void {
  const {
    cookieName,
    headerName,
    cookieOptions,
    ignoreMethods,
  } = { ...DEFAULT_CONFIG, ...config };

  return (req: Request, res: Response, next: NextFunction): void => {
    // Get existing token from cookie or generate new one
    let token = req.cookies?.[cookieName];

    if (!token) {
      token = generateToken();
      res.cookie(cookieName, token, cookieOptions);
    }

    // Attach method to get current token
    req.csrfToken = () => token;

    // Skip validation for safe methods
    if (ignoreMethods.includes(req.method)) {
      return next();
    }

    // Validate CSRF token for state-changing requests
    const headerToken = req.get(headerName) || req.body?._csrf;

    if (!headerToken) {
      return next(new AuthenticationError('CSRF token missing'));
    }

    // Constant-time comparison to prevent timing attacks
    if (!crypto.timingSafeEqual(Buffer.from(token), Buffer.from(headerToken))) {
      return next(new AuthenticationError('Invalid CSRF token'));
    }

    next();
  };
}

/**
 * Middleware to generate and send CSRF token
 * Use this for endpoints that need to provide CSRF token to clients
 *
 * @example
 * ```typescript
 * app.get('/api/v1/csrf-token', getCsrfToken);
 * ```
 */
export function getCsrfToken(req: Request, res: Response): void {
  const token = req.csrfToken?.();
  res.json({
    csrfToken: token,
    _csrf: token, // Alias for compatibility
  });
}

/**
 * CSRF exemption middleware
 * Use sparingly for specific routes that cannot support CSRF (e.g., webhooks)
 *
 * @example
 * ```typescript
 * app.post('/api/v1/webhooks/stripe', csrfExempt, stripeWebhookHandler);
 * ```
 */
export function csrfExempt(req: Request, res: Response, next: NextFunction): void {
  // Mark request as exempt from CSRF validation
  (req as any)._csrfExempt = true;
  next();
}

/**
 * Enhanced CSRF middleware that checks for exemption
 */
export function csrfProtectionWithExemptions(config: CsrfConfig = {}) {
  const protection = csrfProtection(config);

  return (req: Request, res: Response, next: NextFunction): void => {
    if ((req as any)._csrfExempt) {
      return next();
    }
    protection(req, res, next);
  };
}
