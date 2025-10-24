/**
 * @fileoverview User-facing message constants for the Black-Cross platform.
 *
 * Provides centralized, consistent messaging throughout the application for:
 * - Success notifications
 * - Error messages
 * - Warning dialogs
 * - Informational messages
 * - Confirmation prompts
 * - Placeholder text
 * - Button labels
 *
 * Benefits of centralized messages:
 * - Consistency across the application
 * - Easy internationalization (i18n) support
 * - Single source of truth for user-facing text
 * - Simplified testing and validation
 * - Easy updates and maintenance
 *
 * @module constants/messages
 *
 * @example
 * ```typescript
 * import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '@/constants/messages';
 *
 * showNotification(SUCCESS_MESSAGES.LOGIN_SUCCESS);
 * showError(ERROR_MESSAGES.NETWORK_ERROR);
 * ```
 */

/**
 * Success notification messages for completed operations.
 *
 * Used for toast notifications, alerts, and success feedback to users
 * after successful completion of actions.
 *
 * @constant
 * @type {Object}
 */
export const SUCCESS_MESSAGES = {
  // Authentication
  LOGIN_SUCCESS: 'Successfully logged in',
  LOGOUT_SUCCESS: 'Successfully logged out',
  REGISTER_SUCCESS: 'Account created successfully',
  PASSWORD_RESET_SENT: 'Password reset link sent to your email',
  PASSWORD_RESET_SUCCESS: 'Password reset successfully',

  // Generic CRUD
  CREATE_SUCCESS: 'Created successfully',
  UPDATE_SUCCESS: 'Updated successfully',
  DELETE_SUCCESS: 'Deleted successfully',
  SAVE_SUCCESS: 'Saved successfully',
  COPY_SUCCESS: 'Copied to clipboard',

  // Threat Intelligence
  THREAT_CREATED: 'Threat indicator created successfully',
  THREAT_UPDATED: 'Threat indicator updated successfully',
  THREAT_DELETED: 'Threat indicator deleted successfully',
  THREAT_ENRICHED: 'Threat data enriched successfully',

  // Incidents
  INCIDENT_CREATED: 'Incident created successfully',
  INCIDENT_UPDATED: 'Incident updated successfully',
  INCIDENT_CLOSED: 'Incident closed successfully',
  INCIDENT_ASSIGNED: 'Incident assigned successfully',

  // File Operations
  FILE_UPLOADED: 'File uploaded successfully',
  FILE_DELETED: 'File deleted successfully',
  IMPORT_SUCCESS: 'Data imported successfully',
  EXPORT_SUCCESS: 'Data exported successfully',

  // Notifications
  NOTIFICATION_MARKED_READ: 'Notification marked as read',
  NOTIFICATIONS_CLEARED: 'All notifications cleared',

  // Settings
  SETTINGS_SAVED: 'Settings saved successfully',
  PREFERENCES_UPDATED: 'Preferences updated successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
} as const;

/**
 * Error messages for failed operations and validation errors.
 *
 * Used for error notifications, validation feedback, and exception handling.
 * Messages should be clear, actionable, and help users understand what went wrong.
 *
 * @constant
 * @type {Object}
 *
 * @example
 * ```typescript
 * import { ERROR_MESSAGES } from '@/constants/messages';
 *
 * if (!isValid) {
 *   throw new Error(ERROR_MESSAGES.INVALID_EMAIL);
 * }
 * ```
 */
export const ERROR_MESSAGES = {
  // Generic Errors
  GENERIC_ERROR: 'An error occurred. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  UNKNOWN_ERROR: 'An unknown error occurred.',

  // Authentication
  LOGIN_FAILED: 'Invalid email or password',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  SESSION_EXPIRED: 'Your session has expired. Please login again.',
  TOKEN_INVALID: 'Invalid authentication token',
  TOKEN_EXPIRED: 'Authentication token has expired',

  // Validation
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PASSWORD: 'Password must be at least 8 characters',
  PASSWORDS_DONT_MATCH: 'Passwords do not match',
  INVALID_FORMAT: 'Invalid format',
  INVALID_URL: 'Please enter a valid URL',
  INVALID_DATE: 'Please enter a valid date',
  INVALID_NUMBER: 'Please enter a valid number',

  // File Upload
  FILE_TOO_LARGE: 'File size exceeds maximum allowed size',
  INVALID_FILE_TYPE: 'Invalid file type',
  UPLOAD_FAILED: 'File upload failed',

  // Data Operations
  LOAD_FAILED: 'Failed to load data',
  SAVE_FAILED: 'Failed to save data',
  DELETE_FAILED: 'Failed to delete',
  UPDATE_FAILED: 'Failed to update',
  CREATE_FAILED: 'Failed to create',

  // Not Found
  NOT_FOUND: 'Resource not found',
  PAGE_NOT_FOUND: 'Page not found',
  USER_NOT_FOUND: 'User not found',
  THREAT_NOT_FOUND: 'Threat indicator not found',
  INCIDENT_NOT_FOUND: 'Incident not found',

  // Permissions
  ACCESS_DENIED: 'Access denied',
  INSUFFICIENT_PERMISSIONS: 'You do not have permission to perform this action',

  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please try again later.',

  // Conflicts
  ALREADY_EXISTS: 'Resource already exists',
  DUPLICATE_ENTRY: 'Duplicate entry',

  // Search
  NO_RESULTS: 'No results found',
  SEARCH_FAILED: 'Search failed',
} as const;

/**
 * Warning messages for potentially dangerous or irreversible actions.
 *
 * Used for confirmation dialogs, cautionary notices, and important alerts
 * that require user attention before proceeding.
 *
 * @constant
 * @type {Object}
 *
 * @example
 * ```typescript
 * import { WARNING_MESSAGES } from '@/constants/messages';
 *
 * if (hasUnsavedChanges) {
 *   confirm(WARNING_MESSAGES.UNSAVED_CHANGES);
 * }
 * ```
 */
export const WARNING_MESSAGES = {
  UNSAVED_CHANGES: 'You have unsaved changes. Are you sure you want to leave?',
  CONFIRM_DELETE: 'Are you sure you want to delete this item?',
  CONFIRM_DELETE_MULTIPLE: 'Are you sure you want to delete {count} items?',
  IRREVERSIBLE_ACTION: 'This action cannot be undone.',
  DATA_LOSS_WARNING: 'This action may result in data loss.',
  SLOW_CONNECTION: 'Your connection appears to be slow.',
  DEPRECATED_FEATURE: 'This feature is deprecated and will be removed soon.',
} as const;

/**
 * Informational messages for status updates and loading states.
 *
 * Used for loading indicators, empty states, and informational notices
 * that keep users informed about application state.
 *
 * @constant
 * @type {Object}
 */
export const INFO_MESSAGES = {
  LOADING: 'Loading...',
  PROCESSING: 'Processing...',
  SAVING: 'Saving...',
  DELETING: 'Deleting...',
  UPLOADING: 'Uploading...',
  DOWNLOADING: 'Downloading...',
  SEARCHING: 'Searching...',
  EMPTY_STATE: 'No data available',
  NO_ITEMS: 'No items to display',
  BETA_FEATURE: 'This is a beta feature',
  COMING_SOON: 'Coming soon',
  MAINTENANCE_MODE: 'System is under maintenance',
} as const;

/**
 * Confirmation dialog messages for user actions requiring explicit consent.
 *
 * Used for confirm/cancel dialogs before destructive or significant actions.
 * Supports template strings with placeholders (e.g., {count}).
 *
 * @constant
 * @type {Object}
 *
 * @example
 * ```typescript
 * import { CONFIRMATION_MESSAGES } from '@/constants/messages';
 *
 * const message = CONFIRMATION_MESSAGES.DELETE_MULTIPLE.replace('{count}', '5');
 * if (confirm(message)) {
 *   deleteItems();
 * }
 * ```
 */
export const CONFIRMATION_MESSAGES = {
  DELETE: 'Are you sure you want to delete this?',
  DELETE_MULTIPLE: 'Are you sure you want to delete {count} items?',
  LOGOUT: 'Are you sure you want to logout?',
  CANCEL_CHANGES: 'Are you sure you want to cancel? All changes will be lost.',
  RESET_SETTINGS: 'Are you sure you want to reset to default settings?',
  CLEAR_DATA: 'Are you sure you want to clear all data?',
  OVERWRITE: 'A file with this name already exists. Do you want to overwrite it?',
} as const;

/**
 * Placeholder text for form inputs and search fields.
 *
 * Provides helpful hints to users about expected input format or content.
 *
 * @constant
 * @type {Object}
 *
 * @example
 * ```typescript
 * import { PLACEHOLDERS } from '@/constants/messages';
 *
 * <TextField placeholder={PLACEHOLDERS.EMAIL} />
 * ```
 */
export const PLACEHOLDERS = {
  SEARCH: 'Search...',
  EMAIL: 'Enter your email',
  PASSWORD: 'Enter your password',
  USERNAME: 'Enter username',
  SELECT: 'Select an option',
  DATE: 'Select date',
  TIME: 'Select time',
  DESCRIPTION: 'Enter description',
  COMMENT: 'Add a comment...',
  TAGS: 'Add tags...',
  URL: 'Enter URL',
  NAME: 'Enter name',
  TITLE: 'Enter title',
} as const;

/**
 * Standard button labels for consistent UI element text.
 *
 * Used for buttons, links, and action elements throughout the application.
 * Ensures consistent terminology and reduces duplication.
 *
 * @constant
 * @type {Object}
 *
 * @example
 * ```typescript
 * import { BUTTON_LABELS } from '@/constants/messages';
 *
 * <Button>{BUTTON_LABELS.SAVE}</Button>
 * <Button>{BUTTON_LABELS.CANCEL}</Button>
 * ```
 */
export const BUTTON_LABELS = {
  SAVE: 'Save',
  CANCEL: 'Cancel',
  DELETE: 'Delete',
  EDIT: 'Edit',
  CREATE: 'Create',
  UPDATE: 'Update',
  SUBMIT: 'Submit',
  RESET: 'Reset',
  SEARCH: 'Search',
  FILTER: 'Filter',
  EXPORT: 'Export',
  IMPORT: 'Import',
  UPLOAD: 'Upload',
  DOWNLOAD: 'Download',
  REFRESH: 'Refresh',
  CLOSE: 'Close',
  CONFIRM: 'Confirm',
  BACK: 'Back',
  NEXT: 'Next',
  PREVIOUS: 'Previous',
  CONTINUE: 'Continue',
  FINISH: 'Finish',
  LOGIN: 'Login',
  LOGOUT: 'Logout',
  REGISTER: 'Register',
  RETRY: 'Retry',
  LEARN_MORE: 'Learn More',
  VIEW_DETAILS: 'View Details',
  ADD: 'Add',
  REMOVE: 'Remove',
  APPLY: 'Apply',
  CLEAR: 'Clear',
  SELECT_ALL: 'Select All',
  DESELECT_ALL: 'Deselect All',
} as const;
