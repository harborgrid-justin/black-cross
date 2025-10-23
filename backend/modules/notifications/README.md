# Notification System

Real-time notification and alerting system with WebSocket support.

## Features

- ✅ Real-time notifications via WebSocket
- ✅ Multiple notification channels (in-app, email, webhook, websocket)
- ✅ User preferences and filtering
- ✅ Notification rules and automation
- ✅ Notification statistics and analytics
- ✅ Severity-based filtering
- ✅ Category-based grouping
- ✅ Quiet hours support

## API Endpoints

### Notifications
- `POST /api/v1/notifications` - Create notification
- `GET /api/v1/notifications` - Get user notifications
- `GET /api/v1/notifications/stats` - Get notification statistics
- `PUT /api/v1/notifications/:id/read` - Mark as read
- `POST /api/v1/notifications/mark-all-read` - Mark all as read
- `DELETE /api/v1/notifications/:id` - Delete notification

### Preferences
- `GET /api/v1/notifications/preferences` - Get user preferences
- `PUT /api/v1/notifications/preferences` - Update preferences

### Rules
- `POST /api/v1/notifications/rules` - Create notification rule
- `GET /api/v1/notifications/rules` - Get all rules
- `PUT /api/v1/notifications/rules/:id` - Update rule
- `DELETE /api/v1/notifications/rules/:id` - Delete rule

## WebSocket Connection

Connect to: `ws://localhost:8080/ws/notifications`

```javascript
const socket = io('http://localhost:8080', {
  path: '/ws/notifications'
});

socket.emit('authenticate', { userId: 'user-123' });

socket.on('notification', (data) => {
  console.log('New notification:', data);
});
```

## Usage Example

```typescript
import { notificationService } from './service';

// Create notification
await notificationService.createNotification({
  title: 'High Severity Threat Detected',
  message: 'New threat detected in your environment',
  severity: NotificationSeverity.CRITICAL,
  category: NotificationCategory.THREAT,
  user_ids: ['user-123'],
  channels: [NotificationChannel.IN_APP, NotificationChannel.WEBSOCKET]
}, 'admin-user');
```
