/**
 * @fileoverview Notifications page component.
 * 
 * Displays user notifications with filtering, real-time updates,
 * and preference management.
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
import { notificationService, type Notification, NotificationSeverity } from '@/services/notificationService';

/**
 * Notifications page component.
 * 
 * @component
 */
export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      await loadNotifications();
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      await loadNotifications();
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      await loadNotifications();
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

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
