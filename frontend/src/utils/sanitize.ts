/**
 * Input sanitization utilities for XSS protection
 *
 * IMPORTANT: Install DOMPurify first:
 * npm install dompurify @types/dompurify
 *
 * @example
 * import { sanitizeInput, sanitizeHTML } from '@/utils/sanitize';
 * const safe = sanitizeInput(userInput);
 */

// Temporary basic sanitization until DOMPurify is installed
// TODO: Uncomment DOMPurify import after installation
// import DOMPurify from 'dompurify';

/**
 * Basic HTML entity encoding for text that should have NO HTML
 * Use this for plain text fields (names, titles, etc.)
 */
export function sanitizeInput(value: string): string {
  if (!value) return '';

  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitize HTML content allowing safe tags
 * Use this for rich text fields (descriptions, comments)
 *
 * @param value - HTML string to sanitize
 * @param allowedTags - Optional array of allowed HTML tags
 */
export function sanitizeHTML(value: string, allowedTags?: string[]): string {
  if (!value) return '';

  // TODO: Replace with DOMPurify after installation
  // return DOMPurify.sanitize(value, {
  //   ALLOWED_TAGS: allowedTags || ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
  //   ALLOWED_ATTR: ['href', 'target', 'rel'],
  // });

  // Temporary: Strip all HTML tags
  return sanitizeInput(value);
}

/**
 * Sanitize URL to prevent javascript: protocol attacks
 */
export function sanitizeURL(url: string): string {
  if (!url) return '';

  const trimmed = url.trim().toLowerCase();

  // Block dangerous protocols
  if (
    trimmed.startsWith('javascript:') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('vbscript:') ||
    trimmed.startsWith('file:')
  ) {
    return '#';
  }

  return url;
}

/**
 * Validate and sanitize email address
 */
export function sanitizeEmail(email: string): string {
  if (!email) return '';

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const cleaned = email.trim().toLowerCase();

  return emailRegex.test(cleaned) ? cleaned : '';
}

/**
 * Sanitize filename to prevent path traversal
 */
export function sanitizeFilename(filename: string): string {
  if (!filename) return '';

  return filename
    .replace(/\.\./g, '')  // Remove parent directory references
    .replace(/[/\\]/g, '') // Remove path separators
    .replace(/[<>:"|?*]/g, '') // Remove invalid filename characters
    .trim();
}

export default {
  sanitizeInput,
  sanitizeHTML,
  sanitizeURL,
  sanitizeEmail,
  sanitizeFilename,
};
