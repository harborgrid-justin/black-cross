/**
 * Shared TypeScript Type Definitions for Redux Operations
 *
 * This file provides common types for Redux thunks, actions, and state management
 * used across all modules in the Black-Cross platform.
 */

import type { ErrorDetail } from './crud';

/**
 * Standard configuration for async thunks
 * Provides structured error handling via rejectValue
 */
export interface AsyncThunkConfig {
  /**
   * Type for rejected action payload
   * Enables structured error handling instead of plain strings
   */
  rejectValue: ErrorDetail;
}

/**
 * Type alias for creating type-safe async thunks
 * Usage: BlackCrossAsyncThunk<ReturnType, ArgumentType>
 */
export type BlackCrossAsyncThunk<Returned, ThunkArg = void> = {
  pending: string;
  fulfilled: string;
  rejected: string;
};

/**
 * Helper function to create a structured error for thunk rejection
 *
 * @param error - The error to convert
 * @param defaultCode - Default error code
 * @returns Structured error detail for rejectWithValue
 *
 * @example
 * ```ts
 * export const fetchThreats = createAsyncThunk<
 *   Threat[],
 *   void,
 *   AsyncThunkConfig
 * >(
 *   'threats/fetchThreats',
 *   async (_, { rejectWithValue }) => {
 *     try {
 *       const response = await api.getThreats();
 *       if (response.success) return response.data;
 *       return rejectWithValue(response.error);
 *     } catch (error) {
 *       return rejectWithValue(createThunkRejection(error));
 *     }
 *   }
 * );
 * ```
 */
export function createThunkRejection(
  error: unknown,
  defaultCode: ErrorDetail['code'] = 'UNKNOWN_ERROR'
): ErrorDetail {
  // If it's already an ErrorDetail, return it
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error
  ) {
    return error as ErrorDetail;
  }

  // If it's a standard Error
  if (error instanceof Error) {
    return {
      code: defaultCode,
      message: error.message,
      timestamp: new Date(),
      retryable: defaultCode === 'NETWORK_ERROR' || defaultCode === 'SERVER_ERROR',
      context: {
        name: error.name,
        stack: error.stack,
      },
    };
  }

  // If it's a string
  if (typeof error === 'string') {
    return {
      code: defaultCode,
      message: error,
      timestamp: new Date(),
      retryable: false,
    };
  }

  // Unknown error type
  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unknown error occurred',
    timestamp: new Date(),
    retryable: false,
    context: {
      errorType: typeof error,
      errorValue: JSON.stringify(error),
    },
  };
}

/**
 * Helper to extract error message from various error types
 *
 * @param error - The error to extract message from
 * @returns Error message string
 */
export function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message;
  }

  return 'An unknown error occurred';
}

/**
 * Helper to check if an error is retryable
 *
 * @param error - The error to check
 * @returns True if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (
    typeof error === 'object' &&
    error !== null &&
    'retryable' in error &&
    typeof error.retryable === 'boolean'
  ) {
    return error.retryable;
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error
  ) {
    const code = (error as { code: string }).code;
    return code === 'NETWORK_ERROR' || code === 'TIMEOUT' || code === 'SERVER_ERROR';
  }

  return false;
}

/**
 * Type for Redux thunk pending state
 */
export interface ThunkPendingState {
  loading: true;
  error: null;
}

/**
 * Type for Redux thunk fulfilled state
 */
export interface ThunkFulfilledState {
  loading: false;
  error: null;
}

/**
 * Type for Redux thunk rejected state
 */
export interface ThunkRejectedState {
  loading: false;
  error: ErrorDetail;
}

/**
 * Helper to create pending state
 */
export function createPendingState(): ThunkPendingState {
  return {
    loading: true,
    error: null,
  };
}

/**
 * Helper to create fulfilled state
 */
export function createFulfilledState(): ThunkFulfilledState {
  return {
    loading: false,
    error: null,
  };
}

/**
 * Helper to create rejected state
 *
 * @param error - The error that caused rejection
 */
export function createRejectedState(error: ErrorDetail): ThunkRejectedState {
  return {
    loading: false,
    error,
  };
}
