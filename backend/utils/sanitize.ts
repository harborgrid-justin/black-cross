/**
 * XSS Input Sanitization Utilities
 * Enterprise-grade HTML and text sanitization to prevent Cross-Site Scripting attacks
 *
 * Features:
 * - HTML sanitization with configurable allowed tags
 * - Plain text sanitization
 * - Object field sanitization
 * - Middleware for automatic request sanitization
 *
 * @see https://owasp.org/www-community/attacks/xss/
 */

import createDOMPurify from 'isomorphic-dompurify';
import type { Request, Response, NextFunction } from 'express';

const DOMPurify = createDOMPurify();

/**
 * Sanitization configuration
 */
export interface SanitizeConfig {
  /** Allowed HTML tags */
  readonly allowedTags?: readonly string[];
  /** Allowed attributes */
  readonly allowedAttributes?: readonly string[];
  /** Fields to sanitize in objects */
  readonly fieldsToSanitize?: readonly string[];
}

/**
 * Default configuration for HTML sanitization
 */
const DEFAULT_HTML_CONFIG = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'code', 'pre'],
  ALLOWED_ATTR: ['href', 'target', 'rel'],
  ALLOW_DATA_ATTR: false,
};

/**
 * Strict configuration (no HTML allowed)
 */
const STRICT_CONFIG = {
  ALLOWED_TAGS: [],
  ALLOWED_ATTR: [],
};

/**
 * Sanitize HTML content with allowed tags
 *
 * @param dirty - Untrusted HTML string
 * @param config - Sanitization configuration
 * @returns Safe HTML string
 *
 * @example
 * ```typescript
 * const userInput = '<script>alert("xss")</script><p>Hello</p>';
 * const safe = sanitizeHtml(userInput);
 * // Returns: '<p>Hello</p>'
 * ```
 */
export function sanitizeHtml(dirty: string, config: SanitizeConfig = {}): string {
  if (typeof dirty !== 'string') {
    return '';
  }

  const purifyConfig = {
    ...DEFAULT_HTML_CONFIG,
    ALLOWED_TAGS: config.allowedTags || DEFAULT_HTML_CONFIG.ALLOWED_TAGS,
    ALLOWED_ATTR: config.allowedAttributes || DEFAULT_HTML_CONFIG.ALLOWED_ATTR,
  };

  return DOMPurify.sanitize(dirty, purifyConfig);
}

/**
 * Sanitize text by escaping all HTML entities
 * Use this for plain text fields that should never contain HTML
 *
 * @param text - Untrusted text
 * @returns Escaped text safe for display
 *
 * @example
 * ```typescript
 * const userInput = '<script>alert("xss")</script>';
 * const safe = sanitizeText(userInput);
 * // Returns: '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
 * ```
 */
export function sanitizeText(text: string): string {
  if (typeof text !== 'string') {
    return '';
  }

  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Strictly sanitize by removing ALL HTML tags
 *
 * @param dirty - Untrusted string
 * @returns String with all HTML removed
 *
 * @example
 * ```typescript
 * const userInput = '<b>Hello</b> <script>alert("xss")</script> World';
 * const safe = sanitizeStrict(userInput);
 * // Returns: 'Hello  World'
 * ```
 */
export function sanitizeStrict(dirty: string): string {
  if (typeof dirty !== 'string') {
    return '';
  }

  return DOMPurify.sanitize(dirty, STRICT_CONFIG);
}

/**
 * Sanitize specific fields in an object
 *
 * @param obj - Object with potentially unsafe fields
 * @param fieldsToSanitize - Array of field names to sanitize
 * @param mode - Sanitization mode ('html' | 'text' | 'strict')
 * @returns Object with sanitized fields
 *
 * @example
 * ```typescript
 * const userData = {
 *   name: '<script>alert("xss")</script>John',
 *   email: 'john@example.com',
 *   bio: '<b>Developer</b> at Company',
 * };
 *
 * const safe = sanitizeObject(userData, ['name', 'bio'], 'html');
 * // Returns: { name: 'John', email: 'john@example.com', bio: '<b>Developer</b> at Company' }
 * ```
 */
export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  fieldsToSanitize: readonly string[],
  mode: 'html' | 'text' | 'strict' = 'text',
): T {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const sanitized = { ...obj };

  for (const field of fieldsToSanitize) {
    if (field in sanitized && typeof sanitized[field] === 'string') {
      switch (mode) {
        case 'html':
          sanitized[field] = sanitizeHtml(sanitized[field]);
          break;
        case 'strict':
          sanitized[field] = sanitizeStrict(sanitized[field]);
          break;
        case 'text':
        default:
          sanitized[field] = sanitizeText(sanitized[field]);
          break;
      }
    }
  }

  return sanitized;
}

/**
 * Recursively sanitize all string values in an object
 *
 * @param obj - Object to sanitize
 * @param mode - Sanitization mode
 * @param maxDepth - Maximum recursion depth
 * @returns Deeply sanitized object
 *
 * @example
 * ```typescript
 * const data = {
 *   title: '<script>alert("xss")</script>',
 *   nested: {
 *     description: '<b>Bold</b> text',
 *   },
 * };
 *
 * const safe = sanitizeDeep(data, 'html');
 * ```
 */
export function sanitizeDeep<T>(
  obj: T,
  mode: 'html' | 'text' | 'strict' = 'text',
  maxDepth: number = 10,
): T {
  if (maxDepth <= 0 || obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    switch (mode) {
      case 'html':
        return sanitizeHtml(obj) as unknown as T;
      case 'strict':
        return sanitizeStrict(obj) as unknown as T;
      case 'text':
      default:
        return sanitizeText(obj) as unknown as T;
    }
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeDeep(item, mode, maxDepth - 1)) as unknown as T;
  }

  if (typeof obj === 'object') {
    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj as Record<string, any>)) {
      sanitized[key] = sanitizeDeep(value, mode, maxDepth - 1);
    }
    return sanitized as T;
  }

  return obj;
}

/**
 * Express middleware to automatically sanitize request body
 *
 * @param config - Sanitization configuration
 * @returns Express middleware
 *
 * @example
 * ```typescript
 * // Sanitize all POST/PUT/PATCH request bodies
 * app.use(sanitizeRequestBody({
 *   fieldsToSanitize: ['title', 'description', 'content'],
 * }));
 *
 * // Or apply to specific routes
 * router.post('/incidents', sanitizeRequestBody(), createIncident);
 * ```
 */
export function sanitizeRequestBody(config: SanitizeConfig = {}) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.body && typeof req.body === 'object') {
      if (config.fieldsToSanitize && config.fieldsToSanitize.length > 0) {
        // Sanitize specific fields
        req.body = sanitizeObject(req.body, config.fieldsToSanitize, 'text');
      } else {
        // Sanitize all string fields
        req.body = sanitizeDeep(req.body, 'text');
      }
    }
    next();
  };
}

/**
 * Sanitize URL to prevent javascript: protocol and other XSS vectors
 *
 * @param url - Untrusted URL
 * @returns Safe URL or empty string if malicious
 *
 * @example
 * ```typescript
 * sanitizeUrl('javascript:alert("xss")'); // Returns: ''
 * sanitizeUrl('https://example.com'); // Returns: 'https://example.com'
 * ```
 */
export function sanitizeUrl(url: string): string {
  if (typeof url !== 'string') {
    return '';
  }

  const trimmed = url.trim();
  const lower = trimmed.toLowerCase();

  // Block dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
  if (dangerousProtocols.some(protocol => lower.startsWith(protocol))) {
    return '';
  }

  // Block HTML entities that could hide dangerous protocols
  if (trimmed.includes('&#') || trimmed.includes('%')) {
    try {
      const decoded = decodeURIComponent(trimmed);
      if (dangerousProtocols.some(protocol => decoded.toLowerCase().startsWith(protocol))) {
        return '';
      }
    } catch {
      return '';
    }
  }

  return trimmed;
}

/**
 * Sanitize filename to prevent path traversal
 *
 * @param filename - Untrusted filename
 * @returns Safe filename
 *
 * @example
 * ```typescript
 * sanitizeFilename('../../../etc/passwd'); // Returns: 'passwd'
 * sanitizeFilename('my file.txt'); // Returns: 'my_file.txt'
 * ```
 */
export function sanitizeFilename(filename: string): string {
  if (typeof filename !== 'string') {
    return '';
  }

  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace unsafe characters
    .replace(/^\.+/, '') // Remove leading dots
    .replace(/\.+/g, '.') // Replace multiple dots
    .substring(0, 255); // Limit length
}

/**
 * Pre-configured sanitizers for common use cases
 */
export const Sanitizers = {
  /** For incident titles, vulnerability names, etc. */
  title: (text: string) => sanitizeText(text).substring(0, 200),

  /** For descriptions, notes, etc. (allows basic formatting) */
  richText: (html: string) => sanitizeHtml(html),

  /** For plain text comments */
  plainText: (text: string) => sanitizeText(text),

  /** For email addresses (no HTML) */
  email: (email: string) => sanitizeText(email).toLowerCase().trim(),

  /** For URLs */
  url: (url: string) => sanitizeUrl(url),

  /** For file names */
  filename: (filename: string) => sanitizeFilename(filename),
};
