/**
 * Shared TypeScript Type Definitions for Form Handling
 *
 * This file provides common types for form state, validation, and submission
 * used across all CRUD forms in the Black-Cross platform.
 */

import type { ErrorDetail } from './crud';

/**
 * Form submission state
 */
export type FormSubmissionState = 'idle' | 'submitting' | 'success' | 'error';

/**
 * Generic form state
 */
export interface FormState<T> {
  /**
   * Current form data
   */
  data: T;

  /**
   * Whether the form has been modified
   */
  isDirty: boolean;

  /**
   * Whether the form is currently submitting
   */
  isSubmitting: boolean;

  /**
   * Submission state
   */
  submissionState: FormSubmissionState;

  /**
   * Validation errors (field-level)
   * Maps field names to error messages
   */
  errors: Record<string, string>;

  /**
   * Form-level error (e.g., API error)
   */
  formError: ErrorDetail | null;

  /**
   * Whether the form has been touched
   */
  touched: Record<string, boolean>;
}

/**
 * Successful form submission result
 */
export interface FormSubmissionSuccess<T> {
  success: true;
  data: T;
}

/**
 * Failed form submission result
 */
export interface FormSubmissionFailure {
  success: false;
  error: ErrorDetail;
}

/**
 * Discriminated union for form submission results
 * Enables automatic type narrowing based on success field
 */
export type FormSubmissionResult<T> = FormSubmissionSuccess<T> | FormSubmissionFailure;

/**
 * Type guard to check if submission was successful
 *
 * @param result - The submission result to check
 * @returns True if submission was successful
 */
export function isFormSubmissionSuccess<T>(
  result: FormSubmissionResult<T>
): result is FormSubmissionSuccess<T> {
  return result.success === true;
}

/**
 * Type guard to check if submission failed
 *
 * @param result - The submission result to check
 * @returns True if submission failed
 */
export function isFormSubmissionFailure<T>(
  result: FormSubmissionResult<T>
): result is FormSubmissionFailure {
  return result.success === false;
}

/**
 * Utility type for create form data
 * Omits id, createdAt, updatedAt fields from entity type
 */
export type CreateFormData<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt' | 'created_at' | 'updated_at'>;

/**
 * Utility type for edit form data
 * Makes all fields optional except id
 */
export type EditFormData<T> = Partial<Omit<T, 'id'>> & { id: string };

/**
 * Props for entity form components (Create/Edit)
 */
export interface EntityFormProps<T> {
  /**
   * Initial form data (for edit mode)
   * If provided, component is in edit mode
   * If undefined, component is in create mode
   */
  initialData?: T;

  /**
   * Callback when form is submitted
   */
  onSubmit: (data: CreateFormData<T> | EditFormData<T>) => Promise<FormSubmissionResult<T>>;

  /**
   * Callback when form is cancelled
   */
  onCancel: () => void;

  /**
   * Whether the form is in loading state
   * @default false
   */
  loading?: boolean;

  /**
   * Form-level error to display
   */
  error?: ErrorDetail | null;
}

/**
 * Validation rule for a form field
 */
export interface ValidationRule<T = string> {
  /**
   * Validation function
   * Returns error message if invalid, undefined if valid
   */
  validate: (value: T) => string | undefined;

  /**
   * Error message to display if validation fails
   */
  message: string;
}

/**
 * Field validation rules
 */
export interface FieldValidation<T = unknown> {
  /**
   * Whether the field is required
   */
  required?: boolean;

  /**
   * Minimum length (for strings)
   */
  minLength?: number;

  /**
   * Maximum length (for strings)
   */
  maxLength?: number;

  /**
   * Minimum value (for numbers)
   */
  min?: number;

  /**
   * Maximum value (for numbers)
   */
  max?: number;

  /**
   * Regular expression pattern
   */
  pattern?: RegExp;

  /**
   * Custom validation function
   */
  validate?: (value: T) => string | undefined;

  /**
   * Custom error message
   */
  message?: string;
}

/**
 * Form validation schema
 * Maps field names to validation rules
 */
export type ValidationSchema<T> = {
  [K in keyof T]?: FieldValidation<T[K]>;
};

/**
 * Helper to create a validation schema
 *
 * @param schema - The validation schema object
 * @returns Typed validation schema
 */
export function createValidationSchema<T>(
  schema: ValidationSchema<T>
): ValidationSchema<T> {
  return schema;
}

/**
 * Validate a single field value
 *
 * @param value - The value to validate
 * @param rules - Validation rules for the field
 * @param fieldName - Name of the field (for error messages)
 * @returns Error message if validation fails, undefined otherwise
 */
export function validateField<T>(
  value: T,
  rules: FieldValidation<T> | undefined,
  fieldName: string
): string | undefined {
  if (!rules) {
    return undefined;
  }

  // Required validation
  if (rules.required && (value === undefined || value === null || value === '')) {
    return rules.message || `${fieldName} is required`;
  }

  // String validations
  if (typeof value === 'string') {
    if (rules.minLength !== undefined && value.length < rules.minLength) {
      return rules.message || `${fieldName} must be at least ${rules.minLength} characters`;
    }
    if (rules.maxLength !== undefined && value.length > rules.maxLength) {
      return rules.message || `${fieldName} must be at most ${rules.maxLength} characters`;
    }
    if (rules.pattern && !rules.pattern.test(value)) {
      return rules.message || `${fieldName} format is invalid`;
    }
  }

  // Number validations
  if (typeof value === 'number') {
    if (rules.min !== undefined && value < rules.min) {
      return rules.message || `${fieldName} must be at least ${rules.min}`;
    }
    if (rules.max !== undefined && value > rules.max) {
      return rules.message || `${fieldName} must be at most ${rules.max}`;
    }
  }

  // Custom validation
  if (rules.validate) {
    return rules.validate(value);
  }

  return undefined;
}

/**
 * Validate all fields in a form
 *
 * @param data - Form data to validate
 * @param schema - Validation schema
 * @returns Object mapping field names to error messages (only for fields with errors)
 */
export function validateForm<T extends Record<string, unknown>>(
  data: T,
  schema: ValidationSchema<T>
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const fieldName in schema) {
    if (Object.prototype.hasOwnProperty.call(schema, fieldName)) {
      const value = data[fieldName];
      const rules = schema[fieldName];
      const error = validateField(value, rules, String(fieldName));
      if (error) {
        errors[String(fieldName)] = error;
      }
    }
  }

  return errors;
}

/**
 * Check if form has any validation errors
 *
 * @param errors - Validation errors object
 * @returns True if there are any errors
 */
export function hasFormErrors(errors: Record<string, string>): boolean {
  return Object.keys(errors).length > 0;
}
