/**
 * @fileoverview Input sanitization utilities for XSS and injection attack prevention.
 *
 * Provides comprehensive input sanitization functions to protect against
 * Cross-Site Scripting (XSS), path traversal, and various injection attacks.
 * Implements defense-in-depth security for user-provided input.
 *
 * Security Strategies:
 * - HTML entity encoding for plain text
 * - HTML tag sanitization for rich content (TODO: DOMPurify integration)
 * - URL protocol validation
 * - Email address validation and normalization
 * - Filename sanitization against path traversal
 *
 * Usage Guidelines:
 * - Use sanitizeInput() for plain text (names, titles, simple fields)
 * - Use sanitizeHTML() for rich text content (descriptions, comments)
 * - Use sanitizeURL() before rendering user-provided URLs
 * - Use sanitizeEmail() for email validation and normalization
 * - Use sanitizeFilename() for file upload handling
 *
 * @module utils/sanitize
 *
 * @remarks
 * TODO: Install DOMPurify for production-grade HTML sanitization:
 * ```bash
 * npm install dompurify @types/dompurify
 * ```
 *
 * @example
 * ```typescript
 * import { sanitizeInput, sanitizeHTML, sanitizeURL } from '@/utils/sanitize';
 *
 * // Plain text sanitization
 * const safeName = sanitizeInput(userInput);
 *
 * // HTML sanitization (with DOMPurify installed)
 * const safeHTML = sanitizeHTML(richTextContent);
 *
 * // URL validation
 * const safeURL = sanitizeURL(userProvidedLink);
 * ```
 */

// Temporary basic sanitization until DOMPurify is installed
// TODO: Uncomment DOMPurify import after installation
// import DOMPurify from 'dompurify';

/**
 * Sanitizes plain text input by encoding HTML entities.
 *
 * Converts HTML special characters to their entity equivalents to prevent
 * XSS attacks. Use this for fields that should contain NO HTML markup,
 * such as names, titles, and other simple text inputs.
 *
 * Encoded characters:
 * - & → &amp;
 * - < → &lt;
 * - > → &gt;
 * - " → &quot;
 * - ' → &#x27;
 * - / → &#x2F;
 *
 * @param {string} value - The input string to sanitize
 * @returns {string} HTML entity-encoded safe string
 *
 * @example
 * ```typescript
 * const userInput = '<script>alert("XSS")</script>';
 * const safe = sanitizeInput(userInput);
 * // Returns: '&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;'
 * ```
 *
 * @example
 * ```typescript
 * // Sanitizing user profile data
 * const sanitizedProfile = {
 *   name: sanitizeInput(profile.name),
 *   title: sanitizeInput(profile.title),
 * };
 * ```
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
 * Sanitizes HTML content allowing only safe tags.
 *
 * Intended for rich text fields that allow HTML markup (descriptions, comments).
 * Currently uses basic sanitization; should be replaced with DOMPurify for
 * production use.
 *
 * When DOMPurify is installed, this will:
 * - Remove dangerous tags (script, iframe, object, embed, etc.)
 * - Strip JavaScript event handlers
 * - Validate and sanitize attributes
 * - Allow only specified safe tags
 *
 * Default allowed tags (when DOMPurify is enabled):
 * b, i, em, strong, a, p, br, ul, ol, li
 *
 * @param {string} value - HTML string to sanitize
 * @param {string[]} [allowedTags] - Optional array of allowed HTML tag names
 * @returns {string} Sanitized HTML string safe for rendering
 *
 * @example
 * ```typescript
 * const userComment = '<p>Good article!</p><script>alert("xss")</script>';
 * const safe = sanitizeHTML(userComment);
 * // With DOMPurify: Returns '<p>Good article!</p>'
 * // Currently: Returns entity-encoded string
 * ```
 *
 * @example
 * ```typescript
 * // With custom allowed tags
 * const safeContent = sanitizeHTML(richText, ['p', 'strong', 'em', 'a']);
 * ```
 *
 * @remarks
 * Current implementation falls back to sanitizeInput() until DOMPurify is installed.
 * Install DOMPurify for production-ready HTML sanitization.
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
 * Sanitizes URLs to prevent JavaScript protocol and other injection attacks.
 *
 * Validates that URLs use safe protocols (http, https) and blocks dangerous
 * protocols that could execute JavaScript or access local files.
 *
 * Blocked protocols:
 * - javascript: - Executes JavaScript
 * - data: - Can contain encoded scripts
 * - vbscript: - Executes VBScript (IE legacy)
 * - file: - Accesses local file system
 *
 * @param {string} url - URL string to sanitize
 * @returns {string} Sanitized URL or '#' if dangerous protocol detected
 *
 * @example
 * ```typescript
 * const userURL = 'javascript:alert("XSS")';
 * const safe = sanitizeURL(userURL);
 * // Returns: '#'
 * ```
 *
 * @example
 * ```typescript
 * const validURL = 'https://example.com/page';
 * const safe = sanitizeURL(validURL);
 * // Returns: 'https://example.com/page'
 * ```
 *
 * @example
 * ```typescript
 * // In JSX
 * <a href={sanitizeURL(userProvidedLink)} target="_blank" rel="noopener noreferrer">
 *   Link
 * </a>
 * ```
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
 * Validates and sanitizes email addresses.
 *
 * Performs basic email validation using regex pattern matching and normalizes
 * the email by trimming whitespace and converting to lowercase. Returns empty
 * string if the email format is invalid.
 *
 * Validation rules:
 * - Must contain @ symbol
 * - Must have characters before and after @
 * - Must have domain extension (.)
 * - Trims whitespace
 * - Converts to lowercase
 *
 * @param {string} email - Email address to validate and sanitize
 * @returns {string} Normalized email address or empty string if invalid
 *
 * @example
 * ```typescript
 * const userEmail = '  USER@Example.COM  ';
 * const safe = sanitizeEmail(userEmail);
 * // Returns: 'user@example.com'
 * ```
 *
 * @example
 * ```typescript
 * const invalidEmail = 'not-an-email';
 * const safe = sanitizeEmail(invalidEmail);
 * // Returns: ''
 * ```
 *
 * @example
 * ```typescript
 * // Email validation in form
 * const handleSubmit = (formData) => {
 *   const email = sanitizeEmail(formData.email);
 *   if (!email) {
 *     showError('Please enter a valid email address');
 *     return;
 *   }
 *   // Proceed with valid email
 * };
 * ```
 */
export function sanitizeEmail(email: string): string {
  if (!email) return '';

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const cleaned = email.trim().toLowerCase();

  return emailRegex.test(cleaned) ? cleaned : '';
}

/**
 * Sanitizes filenames to prevent path traversal and injection attacks.
 *
 * Removes potentially dangerous characters and patterns from filenames that
 * could be used for directory traversal attacks or to create invalid filenames.
 *
 * Removed patterns:
 * - .. (parent directory references)
 * - / and \ (path separators)
 * - <, >, :, ", |, ?, * (invalid Windows filename characters)
 * - Leading/trailing whitespace
 *
 * @param {string} filename - Filename to sanitize
 * @returns {string} Sanitized filename safe for file system operations
 *
 * @example
 * ```typescript
 * const userFilename = '../../etc/passwd';
 * const safe = sanitizeFilename(userFilename);
 * // Returns: 'etcpasswd'
 * ```
 *
 * @example
 * ```typescript
 * const filename = 'my file<>:"|?.txt';
 * const safe = sanitizeFilename(filename);
 * // Returns: 'my file.txt'
 * ```
 *
 * @example
 * ```typescript
 * // File upload handling
 * const handleFileUpload = (file: File) => {
 *   const safeName = sanitizeFilename(file.name);
 *   const formData = new FormData();
 *   formData.append('file', file, safeName);
 *   // Upload with sanitized filename
 * };
 * ```
 *
 * @remarks
 * Always sanitize user-provided filenames before storing or processing files
 * to prevent directory traversal and file system injection attacks.
 */
export function sanitizeFilename(filename: string): string {
  if (!filename) return '';

  return filename
    .replace(/\.\./g, '')  // Remove parent directory references
    .replace(/[/\\]/g, '') // Remove path separators
    .replace(/[<>:"|?*]/g, '') // Remove invalid filename characters
    .trim();
}

/**
 * Default export containing all sanitization functions.
 *
 * @constant
 * @type {Object}
 * @property {Function} sanitizeInput - HTML entity encoding for plain text
 * @property {Function} sanitizeHTML - HTML tag sanitization for rich content
 * @property {Function} sanitizeURL - URL protocol validation
 * @property {Function} sanitizeEmail - Email validation and normalization
 * @property {Function} sanitizeFilename - Filename path traversal prevention
 */
export default {
  sanitizeInput,
  sanitizeHTML,
  sanitizeURL,
  sanitizeEmail,
  sanitizeFilename,
};
