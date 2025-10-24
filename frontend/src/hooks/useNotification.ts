import { useState, useCallback } from 'react';

/**
 * Notification severity levels
 */
export type NotificationSeverity = 'success' | 'error' | 'warning' | 'info';

/**
 * Notification configuration
 */
export interface Notification {
  /**
   * Unique identifier for the notification
   */
  id: string;

  /**
   * Message to display
   */
  message: string;

  /**
   * Severity level of the notification
   */
  severity: NotificationSeverity;

  /**
   * Auto-hide duration in milliseconds
   * @default 6000 (6 seconds)
   */
  autoHideDuration?: number;
}

/**
 * Return type for the useNotification hook
 */
export interface UseNotificationReturn {
  /**
   * Current notification to display (null if none)
   */
  notification: Notification | null;

  /**
   * Show a success notification
   */
  showSuccess: (message: string, autoHideDuration?: number) => void;

  /**
   * Show an error notification
   */
  showError: (message: string, autoHideDuration?: number) => void;

  /**
   * Show a warning notification
   */
  showWarning: (message: string, autoHideDuration?: number) => void;

  /**
   * Show an info notification
   */
  showInfo: (message: string, autoHideDuration?: number) => void;

  /**
   * Show a notification with custom severity
   */
  showNotification: (message: string, severity: NotificationSeverity, autoHideDuration?: number) => void;

  /**
   * Hide the current notification
   */
  hideNotification: () => void;
}

/**
 * Custom hook for managing toast notifications
 *
 * Provides a simple API for showing success, error, warning, and info notifications.
 * Automatically generates unique IDs and handles notification state.
 *
 * @example
 * ```tsx
 * const { notification, showSuccess, showError, hideNotification } = useNotification();
 *
 * const handleSave = async () => {
 *   try {
 *     await dispatch(updateThreat(data));
 *     showSuccess('Threat updated successfully');
 *   } catch (error) {
 *     showError('Failed to update threat');
 *   }
 * };
 *
 * return (
 *   <div>
 *     <button onClick={handleSave}>Save</button>
 *     <Snackbar
 *       open={!!notification}
 *       message={notification?.message}
 *       autoHideDuration={notification?.autoHideDuration}
 *       onClose={hideNotification}
 *     />
 *   </div>
 * );
 * ```
 */
export const useNotification = (): UseNotificationReturn => {
  const [notification, setNotification] = useState<Notification | null>(null);

  /**
   * Generate a unique ID for notifications
   */
  const generateId = useCallback(() => {
    return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  /**
   * Show a notification with specified severity
   */
  const showNotification = useCallback(
    (message: string, severity: NotificationSeverity, autoHideDuration: number = 6000) => {
      setNotification({
        id: generateId(),
        message,
        severity,
        autoHideDuration,
      });
    },
    [generateId]
  );

  /**
   * Show a success notification
   */
  const showSuccess = useCallback(
    (message: string, autoHideDuration?: number) => {
      showNotification(message, 'success', autoHideDuration);
    },
    [showNotification]
  );

  /**
   * Show an error notification
   */
  const showError = useCallback(
    (message: string, autoHideDuration?: number) => {
      showNotification(message, 'error', autoHideDuration);
    },
    [showNotification]
  );

  /**
   * Show a warning notification
   */
  const showWarning = useCallback(
    (message: string, autoHideDuration?: number) => {
      showNotification(message, 'warning', autoHideDuration);
    },
    [showNotification]
  );

  /**
   * Show an info notification
   */
  const showInfo = useCallback(
    (message: string, autoHideDuration?: number) => {
      showNotification(message, 'info', autoHideDuration);
    },
    [showNotification]
  );

  /**
   * Hide the current notification
   */
  const hideNotification = useCallback(() => {
    setNotification(null);
  }, []);

  return {
    notification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showNotification,
    hideNotification,
  };
};

export default useNotification;
