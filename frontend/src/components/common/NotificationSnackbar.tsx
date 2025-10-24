import React from 'react';
import { Snackbar, Alert, AlertColor } from '@mui/material';
import type { Notification } from '../../hooks/useNotification';

/**
 * Props for the NotificationSnackbar component
 */
export interface NotificationSnackbarProps {
  /**
   * The notification to display (null if none)
   */
  notification: Notification | null;

  /**
   * Callback when the snackbar should be closed
   */
  onClose: () => void;
}

/**
 * NotificationSnackbar Component
 *
 * A Material-UI Snackbar wrapper that displays notifications from the useNotification hook.
 * Automatically handles auto-hide duration and close functionality.
 *
 * @example
 * ```tsx
 * const { notification, hideNotification } = useNotification();
 *
 * return (
 *   <div>
 *     <YourContent />
 *     <NotificationSnackbar
 *       notification={notification}
 *       onClose={hideNotification}
 *     />
 *   </div>
 * );
 * ```
 */
export const NotificationSnackbar: React.FC<NotificationSnackbarProps> = ({
  notification,
  onClose,
}) => {
  return (
    <Snackbar
      open={!!notification}
      autoHideDuration={notification?.autoHideDuration ?? 6000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      {notification && (
        <Alert
          onClose={onClose}
          severity={notification.severity as AlertColor}
          variant="filled"
          sx={{ width: '100%' }}
          elevation={6}
        >
          {notification.message}
        </Alert>
      )}
    </Snackbar>
  );
};

export default NotificationSnackbar;
