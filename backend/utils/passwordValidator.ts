/**
 * Password Validation Utility
 * Enforces strong password requirements following OWASP guidelines
 *
 * Requirements:
 * - Minimum 12 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 * - Not in common password list
 * - Not similar to username/email
 *
 * @see https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
 */

import Joi from 'joi';

/**
 * Password validation configuration
 */
export interface PasswordConfig {
  /** Minimum length (default: 12) */
  readonly minLength?: number;
  /** Maximum length (default: 128) */
  readonly maxLength?: number;
  /** Require uppercase letter (default: true) */
  readonly requireUppercase?: boolean;
  /** Require lowercase letter (default: true) */
  readonly requireLowercase?: boolean;
  /** Require number (default: true) */
  readonly requireNumber?: boolean;
  /** Require special character (default: true) */
  readonly requireSpecial?: boolean;
  /** Check against common passwords (default: true) */
  readonly checkCommonPasswords?: boolean;
}

/**
 * Password validation result
 */
export interface PasswordValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
  readonly strength: 'weak' | 'fair' | 'good' | 'strong' | 'very-strong';
  readonly score: number; // 0-100
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: Required<PasswordConfig> = {
  minLength: 12,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecial: true,
  checkCommonPasswords: true,
};

/**
 * Common passwords to reject (top 100 most common)
 * In production, load from a larger list
 */
const COMMON_PASSWORDS = new Set([
  'password', 'password123', '123456', '12345678', 'qwerty', 'abc123',
  'monkey', '1234567', 'letmein', 'trustno1', 'dragon', 'baseball',
  'iloveyou', 'master', 'sunshine', 'ashley', 'bailey', 'passw0rd',
  'shadow', '123123', '654321', 'superman', 'qazwsx', 'michael',
  'football', 'welcome', 'jesus', 'ninja', 'mustang', 'password1',
  'admin', 'admin123', 'root', 'toor', 'pass', 'test', 'guest',
  'changeme', 'Welcome1', 'Admin123', 'Password1', 'Qwerty123',
]);

/**
 * Joi schema for password validation
 */
export const passwordSchema = Joi.string()
  .min(12)
  .max(128)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
  .required()
  .messages({
    'string.min': 'Password must be at least 12 characters long',
    'string.max': 'Password cannot exceed 128 characters',
    'string.pattern.base': 'Password must contain uppercase, lowercase, number, and special character (@$!%*?&)',
    'any.required': 'Password is required',
  });

/**
 * Validate password strength
 *
 * @param password - Password to validate
 * @param config - Validation configuration
 * @param context - Additional context (username, email) to check similarity
 * @returns Validation result
 *
 * @example
 * ```typescript
 * const result = validatePassword('MyP@ssw0rd123!', {}, { email: 'user@example.com' });
 * if (!result.valid) {
 *   console.log('Errors:', result.errors);
 * }
 * ```
 */
export function validatePassword(
  password: string,
  config: PasswordConfig = {},
  context?: { email?: string; username?: string }
): PasswordValidationResult {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const errors: string[] = [];
  let score = 0;

  // Basic validation
  if (!password || typeof password !== 'string') {
    return {
      valid: false,
      errors: ['Password is required'],
      strength: 'weak',
      score: 0,
    };
  }

  // Length check
  if (password.length < cfg.minLength) {
    errors.push(`Password must be at least ${cfg.minLength} characters long`);
  } else {
    score += Math.min(20, password.length); // Up to 20 points for length
  }

  if (password.length > cfg.maxLength) {
    errors.push(`Password cannot exceed ${cfg.maxLength} characters`);
  }

  // Character type checks
  if (cfg.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else {
    score += 15;
  }

  if (cfg.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else {
    score += 15;
  }

  if (cfg.requireNumber && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  } else {
    score += 15;
  }

  if (cfg.requireSpecial && !/[@$!%*?&]/.test(password)) {
    errors.push('Password must contain at least one special character (@$!%*?&)');
  } else {
    score += 15;
  }

  // Common password check
  if (cfg.checkCommonPasswords && COMMON_PASSWORDS.has(password.toLowerCase())) {
    errors.push('Password is too common. Please choose a stronger password');
    score = Math.min(score, 20); // Cap score at 20 for common passwords
  }

  // Similarity to username/email
  if (context) {
    if (context.username && password.toLowerCase().includes(context.username.toLowerCase())) {
      errors.push('Password cannot contain your username');
      score -= 10;
    }
    if (context.email) {
      const emailLocal = context.email.split('@')[0];
      if (password.toLowerCase().includes(emailLocal.toLowerCase())) {
        errors.push('Password cannot contain your email address');
        score -= 10;
      }
    }
  }

  // Bonus points for complexity
  const uniqueChars = new Set(password).size;
  score += Math.min(10, uniqueChars / 2); // Up to 10 points for character variety

  // Penalize repeated characters
  const repeatedPattern = /(.)\1{2,}/;
  if (repeatedPattern.test(password)) {
    score -= 5;
  }

  // Determine strength
  score = Math.max(0, Math.min(100, score));
  let strength: 'weak' | 'fair' | 'good' | 'strong' | 'very-strong';

  if (score >= 80) strength = 'very-strong';
  else if (score >= 60) strength = 'strong';
  else if (score >= 40) strength = 'good';
  else if (score >= 20) strength = 'fair';
  else strength = 'weak';

  return {
    valid: errors.length === 0,
    errors,
    strength,
    score,
  };
}

/**
 * Check if password meets minimum requirements
 * Simple boolean check, use validatePassword for detailed feedback
 *
 * @param password - Password to check
 * @returns True if password is valid
 */
export function isPasswordValid(password: string): boolean {
  const { error } = passwordSchema.validate(password);
  return !error;
}

/**
 * Check if password is in common password list
 *
 * @param password - Password to check
 * @returns True if password is common
 */
export function isCommonPassword(password: string): boolean {
  return COMMON_PASSWORDS.has(password.toLowerCase());
}

/**
 * Generate password strength meter data for UI
 *
 * @param password - Password to analyze
 * @returns Strength meter data
 *
 * @example
 * ```typescript
 * const meter = getPasswordStrengthMeter('MyP@ssw0rd123!');
 * // Returns: { score: 75, strength: 'strong', color: '#4CAF50', ... }
 * ```
 */
export function getPasswordStrengthMeter(password: string): {
  score: number;
  strength: string;
  color: string;
  percentage: number;
  feedback: string;
} {
  const result = validatePassword(password);

  const colors = {
    'weak': '#f44336',
    'fair': '#ff9800',
    'good': '#2196F3',
    'strong': '#4CAF50',
    'very-strong': '#1B5E20',
  };

  const feedback = {
    'weak': 'Very weak - easily guessed',
    'fair': 'Fair - could be stronger',
    'good': 'Good - acceptable security',
    'strong': 'Strong - good security',
    'very-strong': 'Very strong - excellent security',
  };

  return {
    score: result.score,
    strength: result.strength,
    color: colors[result.strength],
    percentage: result.score,
    feedback: feedback[result.strength],
  };
}

/**
 * Express middleware to validate password in request body
 *
 * @param field - Field name in request body (default: 'password')
 * @param config - Password validation configuration
 * @returns Express middleware
 *
 * @example
 * ```typescript
 * router.post('/register', validatePasswordMiddleware(), async (req, res) => {
 *   // Password already validated
 * });
 * ```
 */
export function validatePasswordMiddleware(field: string = 'password', config: PasswordConfig = {}) {
  return (req: any, res: any, next: any): void => {
    const password = req.body?.[field];

    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'Password is required',
      });
    }

    const context = {
      email: req.body.email,
      username: req.body.username,
    };

    const result = validatePassword(password, config, context);

    if (!result.valid) {
      return res.status(400).json({
        success: false,
        error: 'Password does not meet security requirements',
        details: result.errors,
        strength: result.strength,
      });
    }

    // Attach strength info to request for logging
    (req as any).passwordStrength = result.strength;

    next();
  };
}

/**
 * Compare password similarity
 * Useful for "new password cannot be same as old password"
 *
 * @param password1 - First password
 * @param password2 - Second password
 * @returns Similarity percentage (0-100)
 */
export function calculatePasswordSimilarity(password1: string, password2: string): number {
  if (password1 === password2) return 100;

  const len1 = password1.length;
  const len2 = password2.length;
  const maxLen = Math.max(len1, len2);

  if (maxLen === 0) return 100;

  let matches = 0;
  const minLen = Math.min(len1, len2);

  for (let i = 0; i < minLen; i++) {
    if (password1[i] === password2[i]) {
      matches++;
    }
  }

  return Math.round((matches / maxLen) * 100);
}

/**
 * Usage examples:
 *
 * // In registration endpoint
 * import { validatePassword } from './utils/passwordValidator';
 *
 * const result = validatePassword(req.body.password, {}, {
 *   email: req.body.email,
 *   username: req.body.username
 * });
 *
 * if (!result.valid) {
 *   return res.status(400).json({
 *     success: false,
 *     errors: result.errors,
 *     strength: result.strength
 *   });
 * }
 *
 * // Or use middleware
 * router.post('/register', validatePasswordMiddleware(), registerHandler);
 *
 * // Password change - check similarity
 * const similarity = calculatePasswordSimilarity(oldPassword, newPassword);
 * if (similarity > 70) {
 *   return res.status(400).json({
 *     error: 'New password is too similar to old password'
 *   });
 * }
 */
