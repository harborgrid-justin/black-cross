/**
 * Type Guards Utility Module
 * Demonstrates TypeScript best practices for runtime type checking
 * and type narrowing without using 'any' or type assertions
 */

/**
 * Type guard to check if value is a string
 * @param value - Value to check
 * @returns True if value is a string
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Type guard to check if value is a number
 * @param value - Value to check
 * @returns True if value is a number and not NaN
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value);
}

/**
 * Type guard to check if value is a boolean
 * @param value - Value to check
 * @returns True if value is a boolean
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * Type guard to check if value is an object (and not null)
 * @param value - Value to check
 * @returns True if value is an object and not null
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Type guard to check if value is an array
 * @param value - Value to check
 * @returns True if value is an array
 */
export function isArray(value: unknown): value is readonly unknown[] {
  return Array.isArray(value);
}

/**
 * Type guard to check if value is null
 * @param value - Value to check
 * @returns True if value is null
 */
export function isNull(value: unknown): value is null {
  return value === null;
}

/**
 * Type guard to check if value is undefined
 * @param value - Value to check
 * @returns True if value is undefined
 */
export function isUndefined(value: unknown): value is undefined {
  return value === undefined;
}

/**
 * Type guard to check if value is null or undefined
 * @param value - Value to check
 * @returns True if value is null or undefined
 */
export function isNullOrUndefined(value: unknown): value is null | undefined {
  return isNull(value) || isUndefined(value);
}

/**
 * Type guard to check if value is defined (not null or undefined)
 * @param value - Value to check
 * @returns True if value is not null or undefined
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return !isNullOrUndefined(value);
}

/**
 * Type guard to check if value is an Error instance
 * @param value - Value to check
 * @returns True if value is an Error
 */
export function isError(value: unknown): value is Error {
  return value instanceof Error;
}

/**
 * Type guard to check if value is a Date instance
 * @param value - Value to check
 * @returns True if value is a valid Date
 */
export function isDate(value: unknown): value is Date {
  return value instanceof Date && !Number.isNaN(value.getTime());
}

/**
 * Type guard to check if value has a specific property
 * @param value - Value to check
 * @param property - Property name to check for
 * @returns True if value is an object and has the specified property
 */
export function hasProperty<K extends string>(
  value: unknown,
  property: K,
): value is Record<K, unknown> {
  return isObject(value) && property in value;
}

/**
 * Type guard to check if value is a non-empty string
 * @param value - Value to check
 * @returns True if value is a string with length > 0
 */
export function isNonEmptyString(value: unknown): value is string {
  return isString(value) && value.trim().length > 0;
}

/**
 * Type guard to check if value is a positive number
 * @param value - Value to check
 * @returns True if value is a number > 0
 */
export function isPositiveNumber(value: unknown): value is number {
  return isNumber(value) && value > 0;
}

/**
 * Type guard to check if value is a non-negative number
 * @param value - Value to check
 * @returns True if value is a number >= 0
 */
export function isNonNegativeNumber(value: unknown): value is number {
  return isNumber(value) && value >= 0;
}

/**
 * Type guard to check if array is non-empty
 * @param value - Array to check
 * @returns True if array has at least one element
 */
export function isNonEmptyArray<T>(value: readonly T[]): value is readonly [T, ...T[]] {
  return value.length > 0;
}

/**
 * Assertion function to ensure value is defined
 * @param value - Value to assert
 * @param message - Error message if assertion fails
 * @throws Error if value is null or undefined
 */
export function assertDefined<T>(
  value: T | null | undefined,
  message?: string,
): asserts value is T {
  if (isNullOrUndefined(value)) {
    throw new Error(message ?? 'Value must be defined');
  }
}

/**
 * Assertion function to ensure value is a string
 * @param value - Value to assert
 * @param message - Error message if assertion fails
 * @throws Error if value is not a string
 */
export function assertString(value: unknown, message?: string): asserts value is string {
  if (!isString(value)) {
    throw new Error(message ?? 'Value must be a string');
  }
}

/**
 * Assertion function to ensure value is a number
 * @param value - Value to assert
 * @param message - Error message if assertion fails
 * @throws Error if value is not a number
 */
export function assertNumber(value: unknown, message?: string): asserts value is number {
  if (!isNumber(value)) {
    throw new Error(message ?? 'Value must be a number');
  }
}
