/**
 * @fileoverview Notifications page component.
 *
 * Displays user notifications with filtering, real-time updates,
 * and action management (mark as read, delete). Provides a comprehensive
 * view of system, security, and user-generated notifications.
 *
 * ## Features
 * - Notification list with severity-based color coding
 * - Category badges (incident, vulnerability, threat, system, etc.)
 * - Mark individual notifications as read
 * - Mark all notifications as read (bulk action)
 * - Delete individual notifications
 * - Refresh functionality to fetch latest notifications
 * - Loading states and error handling
 * - Visual distinction between read and unread notifications
 * - Timestamp display with localized formatting
 *
 * ## Notification Types
 * Supports multiple severity levels:
 * - CRITICAL: High-priority security events requiring immediate action
 * - ERROR: System or security errors
 * - WARNING: Potential issues or concerns
 * - SUCCESS: Successful operations or resolved issues
 * - INFO: General informational notifications
 *
 * ## Real-time Updates
 * While not currently implemented, this component is designed to support
 * real-time notification updates via WebSocket or polling mechanisms.
 *
 * @module pages/notifications/NotificationsPage
 */

import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  IconButton,
  Button,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  CheckCircle as ReadIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { notificationService, type Notification, NotificationSeverity, NotificationStatus } from '@/services/notificationService';

/**
 * Notifications page component.
 *
 * Displays a list of user notifications with actions to mark as read or delete.
 * Automatically loads notifications on component mount and provides refresh capability.
 *
 * @component
 * @returns {JSX.Element} The notifications page
 *
 * @example
 * ```tsx
 * <Route path="/notifications" element={<NotificationsPage />} />
 * ```
 */
export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Loads notifications from the backend API.
   *
   * Fetches all notifications for the current user and updates state.
   * Sets error state if the request fails.
   *
   * @async
   * @function loadNotifications
   * @returns {Promise<void>}
   */
  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await notificationService.getNotifications();
      setNotifications(response.data || []);
    } catch (err) {
      setError('Failed to load notifications');
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  /**
   * Marks a single notification as read.
   *
   * Updates the notification's status in the backend and reloads
   * the notification list to reflect the change.
   *
   * @async
   * @function handleMarkAsRead
   * @param {string} id - Unique identifier of the notification to mark as read
   * @returns {Promise<void>}
   */
  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      await loadNotifications();
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  /**
   * Marks all notifications as read (bulk action).
   *
   * Updates all unread notifications to read status in a single operation
   * and reloads the notification list.
   *
   * @async
   * @function handleMarkAllAsRead
   * @returns {Promise<void>}
   */
  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      await loadNotifications();
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  /**
   * Deletes a notification.
   *
   * Permanently removes the notification from the system and reloads
   * the notification list to reflect the deletion.
   *
   * @async
   * @function handleDelete
   * @param {string} id - Unique identifier of the notification to delete
   * @returns {Promise<void>}
   */
  const handleDelete = async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      await loadNotifications();
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  /**
   * Maps notification severity to Material-UI color variant.
   *
   * Returns appropriate color for Chip components based on the severity
   * level (CRITICAL, ERROR, WARNING, SUCCESS, INFO).
   *
   * @function getSeverityColor
   * @param {NotificationSeverity} severity - Notification severity level
   * @returns {('error'|'warning'|'success'|'info')} MUI color variant
   */
  const getSeverityColor = (severity: NotificationSeverity) => {
    switch (severity) {
      case NotificationSeverity.CRITICAL:
        return 'error';
      case NotificationSeverity.ERROR:
        return 'error';
      case NotificationSeverity.WARNING:
        return 'warning';
      case NotificationSeverity.SUCCESS:
        return 'success';
      default:
        return 'info';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Notifications
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadNotifications}
            sx={{ mr: 2 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            onClick={handleMarkAllAsRead}
          >
            Mark All as Read
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              {notifications.length === 0 ? (
                <Typography variant="body1" color="text.secondary" textAlign="center" py={4}>
                  No notifications
                </Typography>
              ) : (
                <List>
                  {notifications.map((notification) => (
                    <ListItem
                      key={notification.id}
                      sx={{
                        borderLeft: 4,
                        borderColor: `${getSeverityColor(notification.severity)}.main`,
                        mb: 1,
                        bgcolor: notification.status === NotificationStatus.READ ? 'transparent' : 'action.hover',
                      }}
                      secondaryAction={
                        <Box>
                          {notification.status !== NotificationStatus.READ && (
                            <IconButton
                              edge="end"
                              aria-label="mark as read"
                              onClick={() => handleMarkAsRead(notification.id)}
                              sx={{ mr: 1 }}
                            >
                              <ReadIcon />
                            </IconButton>
                          )}
                          <IconButton
                            edge="end"
                            aria-label="delete"
                            onClick={() => handleDelete(notification.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      }
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography variant="subtitle1" component="span">
                              {notification.title}
                            </Typography>
                            <Chip
                              label={notification.severity}
                              size="small"
                              color={getSeverityColor(notification.severity)}
                            />
                            <Chip
                              label={notification.category}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {notification.message}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(notification.created_at).toLocaleString()}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
