/**
 * @fileoverview Error Boundary component for graceful error handling.
 *
 * Implements React's Error Boundary pattern to catch JavaScript errors anywhere
 * in the component tree, log those errors, and display a fallback UI instead of
 * crashing the entire application.
 *
 * @module components/ErrorBoundary
 * @see {@link https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary|React Error Boundaries}
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { Error as ErrorIcon } from '@mui/icons-material';

/**
 * Props for the ErrorBoundary component.
 *
 * @interface Props
 * @property {ReactNode} children - Child components to be wrapped and protected by the error boundary
 * @property {ReactNode} [fallback] - Optional custom fallback UI to display when an error occurs
 * @property {function} [onError] - Optional error handler callback for custom error logging or reporting
 */
interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

/**
 * Internal state for the ErrorBoundary component.
 *
 * @interface State
 * @property {boolean} hasError - Flag indicating whether an error has been caught
 * @property {Error | null} error - The caught error object, null if no error
 * @property {ErrorInfo | null} errorInfo - React error information including component stack, null if no error
 */
interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary component that catches and handles React rendering errors gracefully.
 *
 * This component catches errors during rendering, in lifecycle methods, and in
 * constructors of the whole tree below it. It displays a user-friendly error UI
 * and provides options to recover or reload the application.
 *
 * Features:
 * - Catches errors in child component tree
 * - Displays user-friendly error UI with recovery options
 * - Shows error details in development mode
 * - Supports custom fallback UI
 * - Allows custom error handling callbacks
 * - Prevents entire application crashes
 *
 * @component
 * @class
 *
 * @example
 * ```tsx
 * // Basic usage
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 *
 * @example
 * ```tsx
 * // With custom fallback and error handler
 * <ErrorBoundary
 *   fallback={<CustomErrorUI />}
 *   onError={(error, errorInfo) => {
 *     logErrorToService(error, errorInfo);
 *   }}
 * >
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<Props, State> {
  /**
   * Initial component state.
   *
   * @public
   * @type {State}
   */
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  /**
   * Static lifecycle method called when an error is thrown in a descendant component.
   *
   * This method is called during the "render" phase, so side effects are not permitted.
   * Use componentDidCatch() for side effects like logging.
   *
   * @static
   * @param {Error} error - The error that was thrown
   * @returns {Partial<State>} Updated state to trigger error UI rendering
   */
  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  /**
   * Lifecycle method called after an error has been thrown by a descendant component.
   *
   * This method is called during the "commit" phase, so side effects are permitted.
   * Use this for logging errors to error reporting services.
   *
   * @public
   * @param {Error} error - The error that was thrown
   * @param {ErrorInfo} errorInfo - Object containing component stack trace information
   * @returns {void}
   */
  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Store error info in state
    this.setState({ errorInfo });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // TODO: Send error to monitoring service (e.g., Sentry)
    // if (import.meta.env.PROD) {
    //   sendToErrorTracking(error, errorInfo);
    // }
  }

  /**
   * Resets the error boundary state to attempt recovery without page reload.
   *
   * Clears the error state and re-renders the child components. This may or may not
   * resolve the error depending on whether the error condition still exists.
   *
   * @private
   * @returns {void}
   */
  private handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  /**
   * Reloads the entire page to recover from the error.
   *
   * Forces a full page reload which will reset all application state.
   * This is a more aggressive recovery strategy than handleReset.
   *
   * @private
   * @returns {void}
   */
  private handleReload = (): void => {
    window.location.reload();
  };

  /**
   * Renders either the error UI or the child components.
   *
   * If an error has been caught, displays the error UI (custom fallback if provided,
   * or default error UI). Otherwise, renders the children normally.
   *
   * @public
   * @returns {ReactNode} Either the error UI or the child components
   */
  public render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            p: 3,
            bgcolor: 'background.default',
          }}
        >
          <Paper
            sx={{
              p: 4,
              maxWidth: 600,
              textAlign: 'center',
            }}
          >
            <ErrorIcon
              color="error"
              sx={{ fontSize: 64, mb: 2 }}
              aria-hidden="true"
            />
            <Typography variant="h5" gutterBottom>
              Something went wrong
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              An unexpected error occurred while rendering this component.
            </Typography>

            {import.meta.env.DEV && this.state.error && (
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  bgcolor: 'grey.100',
                  borderRadius: 1,
                  textAlign: 'left',
                  overflow: 'auto',
                }}
              >
                <Typography variant="caption" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </Typography>
              </Box>
            )}

            <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="outlined"
                onClick={this.handleReset}
                aria-label="Try to recover without reloading"
              >
                Try Again
              </Button>
              <Button
                variant="contained"
                onClick={this.handleReload}
                aria-label="Reload the page"
              >
                Reload Page
              </Button>
            </Box>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
