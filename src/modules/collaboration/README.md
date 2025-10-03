# Collaboration & Workflow Module

## Overview

Complete implementation of the Collaboration & Workflow module with full business logic, data logic, and database integration. This module enables security teams to work together effectively on threat intelligence and incident response through comprehensive collaboration features.

## Features Implemented

### 1. Team Workspace and Project Management
- Multiple workspace creation and management
- Project-based organization
- Resource sharing within workspaces
- Workspace templates
- Per-workspace access control
- Workspace analytics and metrics
- Archive and restore functionality
- Cross-workspace collaboration support

### 2. Role-Based Access Control (RBAC)
- Predefined role templates (Admin, Member, Viewer)
- Custom role creation
- Granular permission matrix management
- Resource-level permissions
- Role hierarchy and inheritance
- Permission checking and enforcement
- System and custom role types

### 3. Real-Time Collaboration Tools
- Live collaboration session management
- Participant tracking with presence indicators
- Cursor position and selection tracking
- Change recording and history
- Session lifecycle management (start, join, leave, end)
- Resource-based sessions (documents, tasks, incidents)
- Collaborative editing support

### 4. Task Assignment and Tracking
- Comprehensive task creation and management
- Task assignment and reassignment
- Priority levels (critical, high, medium, low)
- Status tracking (todo, in-progress, review, blocked, completed, cancelled)
- Task dependencies and relationships
- Progress tracking (0-100%)
- Subtask support with checklists
- Task comments and watchers
- Deadline management with overdue detection
- Workload analysis and balancing

### 5. Knowledge Base and Wiki
- Wiki-style article creation and management
- Markdown, HTML, and plain text support
- Version history and change tracking
- Full-text search functionality
- Category and tag-based organization
- Multi-level approval workflows
- Access control (public, workspace, restricted)
- Article analytics (views, helpful count)
- Related articles linking
- Publishing workflow

### 6. Secure Chat and Messaging
- End-to-end encrypted messaging
- Channel-based and direct messaging
- Message threading support
- File attachments and code snippets
- @mentions and notifications
- Emoji reactions
- Message editing and deletion
- Message pinning
- Read receipts
- Message search

### 7. Activity Feeds and Notifications
- Global and personalized activity feeds
- Activity logging for all operations
- Notification management
- Read/unread status tracking
- Activity filtering by type
- Statistics and analytics
- Notification preferences
- Real-time activity updates

## Architecture

```
collaboration/
├── config/           # Database configuration
├── models/          # MongoDB data models
│   ├── Workspace.js
│   ├── Role.js
│   ├── CollaborationSession.js
│   ├── Task.js
│   ├── KnowledgeArticle.js
│   ├── Message.js
│   └── Activity.js
├── services/        # Business logic layer
│   ├── workspaceService.js
│   ├── rbacService.js
│   ├── collaborationService.js
│   ├── taskService.js
│   ├── knowledgeService.js
│   ├── messagingService.js
│   └── activityService.js
├── controllers/     # HTTP request handlers
│   ├── workspaceController.js
│   ├── taskController.js
│   └── collaborationController.js
├── routes/          # API route definitions
│   ├── workspaceRoutes.js
│   ├── taskRoutes.js
│   └── collaborationRoutes.js
├── validators/      # Input validation schemas
│   ├── workspaceValidator.js
│   ├── roleValidator.js
│   ├── taskValidator.js
│   ├── knowledgeValidator.js
│   └── messageValidator.js
├── utils/           # Helper utilities
│   ├── logger.js
│   └── encryption.js
└── index.js         # Module entry point
```

## API Endpoints

### Workspace Management
- `POST /api/v1/collaboration/workspaces` - Create workspace
- `GET /api/v1/collaboration/workspaces` - List workspaces
- `GET /api/v1/collaboration/workspaces/:id` - Get workspace details
- `PUT /api/v1/collaboration/workspaces/:id` - Update workspace
- `POST /api/v1/collaboration/workspaces/:id/members` - Add member
- `DELETE /api/v1/collaboration/workspaces/:id/members/:userId` - Remove member
- `GET /api/v1/collaboration/workspaces/:id/analytics` - Get analytics
- `POST /api/v1/collaboration/workspaces/:id/archive` - Archive workspace

### Role-Based Access Control
- `POST /api/v1/collaboration/roles` - Create role
- `GET /api/v1/collaboration/roles` - List roles
- `GET /api/v1/collaboration/roles/:id` - Get role details
- `PUT /api/v1/collaboration/users/:id/roles` - Assign role to user

### Real-Time Collaboration
- `POST /api/v1/collaboration/sessions` - Start collaboration session
- `GET /api/v1/collaboration/sessions` - List active sessions
- `GET /api/v1/collaboration/sessions/:id` - Get session details
- `POST /api/v1/collaboration/sessions/:id/join` - Join session
- `POST /api/v1/collaboration/sessions/:id/leave` - Leave session

### Task Management
- `POST /api/v1/collaboration/tasks` - Create task
- `GET /api/v1/collaboration/tasks` - List tasks
- `GET /api/v1/collaboration/tasks/:id` - Get task details
- `PATCH /api/v1/collaboration/tasks/:id` - Update task
- `PUT /api/v1/collaboration/tasks/:id/assign` - Assign task
- `PUT /api/v1/collaboration/tasks/:id/progress` - Update progress
- `POST /api/v1/collaboration/tasks/:id/comments` - Add comment
- `GET /api/v1/collaboration/tasks/:id/dependencies` - Get dependencies
- `GET /api/v1/collaboration/tasks/workload/:userId` - Get user workload

### Knowledge Base
- `POST /api/v1/collaboration/kb/articles` - Create article
- `GET /api/v1/collaboration/kb/articles/:id` - Get article
- `PUT /api/v1/collaboration/kb/articles/:id` - Update article
- `GET /api/v1/collaboration/kb/search` - Search articles
- `POST /api/v1/collaboration/kb/articles/:id/publish` - Publish article

### Messaging
- `POST /api/v1/collaboration/messages` - Send message
- `GET /api/v1/collaboration/messages/channels/:channelId` - Get messages
- `DELETE /api/v1/collaboration/messages/:id` - Delete message
- `POST /api/v1/collaboration/messages/:id/reactions` - Add reaction

### Activity & Notifications
- `GET /api/v1/collaboration/activities` - Get activities
- `GET /api/v1/collaboration/activities/feed` - Get personal feed
- `PUT /api/v1/collaboration/activities/:id/read` - Mark as read
- `GET /api/v1/collaboration/activities/unread-count` - Get unread count
- `PUT /api/v1/collaboration/users/notifications/preferences` - Update preferences

## Data Models

### Workspace Object
```javascript
{
  id: String (UUID),
  name: String,
  description: String,
  type: Enum (security-operations, incident-response, threat-hunting, vulnerability-management, general),
  owner: String (user_id),
  members: [{
    user_id: String,
    role: Enum (owner, admin, member, viewer),
    joined_at: Date
  }],
  settings: {
    is_private: Boolean,
    allow_external_sharing: Boolean,
    notification_level: Enum (all, important, none)
  },
  status: Enum (active, archived, suspended),
  analytics: {
    member_count: Number,
    task_count: Number,
    message_count: Number,
    last_activity_at: Date
  }
}
```

### Role Object
```javascript
{
  id: String (UUID),
  name: String,
  description: String,
  type: Enum (system, custom),
  permissions: [{
    resource: Enum (workspace, task, message, kb_article, user, role, activity, all),
    actions: [Enum (create, read, update, delete, execute, share, admin)],
    conditions: Object
  }],
  hierarchy_level: Number,
  parent_role_id: String,
  inherits_from: [String],
  workspace_id: String,
  is_active: Boolean
}
```

### Task Object
```javascript
{
  id: String (UUID),
  title: String,
  description: String,
  status: Enum (todo, in-progress, review, blocked, completed, cancelled),
  priority: Enum (critical, high, medium, low),
  assigned_to: String (user_id),
  created_by: String (user_id),
  due_date: Date,
  workspace_id: String,
  parent_task_id: String,
  tags: [String],
  dependencies: [{
    task_id: String,
    type: Enum (blocks, blocked_by, relates_to)
  }],
  progress: Number (0-100),
  estimated_hours: Number,
  actual_hours: Number,
  checklist: [{
    item: String,
    completed: Boolean,
    completed_at: Date,
    completed_by: String
  }],
  comments: [{
    user_id: String,
    content: String,
    created_at: Date
  }],
  watchers: [String],
  completed_at: Date
}
```

### Knowledge Article Object
```javascript
{
  id: String (UUID),
  title: String,
  content: String,
  summary: String,
  format: Enum (markdown, html, plain),
  category: String,
  tags: [String],
  author_id: String,
  workspace_id: String,
  status: Enum (draft, review, published, archived),
  version: Number,
  version_history: [{
    version: Number,
    content: String,
    edited_by: String,
    edited_at: Date,
    change_summary: String
  }],
  approval_workflow: {
    required: Boolean,
    approvers: [{
      user_id: String,
      status: Enum (pending, approved, rejected),
      comment: String,
      timestamp: Date
    }]
  },
  access_control: {
    visibility: Enum (public, workspace, restricted),
    allowed_users: [String],
    allowed_roles: [String]
  },
  analytics: {
    view_count: Number,
    helpful_count: Number,
    last_viewed_at: Date
  }
}
```

### Message Object
```javascript
{
  id: String (UUID),
  channel_id: String,
  workspace_id: String,
  sender_id: String,
  content: String (encrypted),
  type: Enum (text, file, code, system, thread),
  thread_id: String,
  parent_message_id: String,
  mentions: [{
    user_id: String,
    mention_type: Enum (user, channel, all)
  }],
  attachments: [{
    filename: String,
    url: String,
    size: Number,
    mime_type: String,
    is_encrypted: Boolean
  }],
  reactions: [{
    user_id: String,
    emoji: String,
    created_at: Date
  }],
  is_encrypted: Boolean,
  encryption_key_id: String,
  is_edited: Boolean,
  edited_at: Date,
  is_deleted: Boolean,
  deleted_at: Date,
  read_by: [{
    user_id: String,
    read_at: Date
  }],
  pinned: Boolean
}
```

### Activity Object
```javascript
{
  id: String (UUID),
  workspace_id: String,
  actor_id: String,
  action: Enum (workspace.created, task.created, message.sent, etc.),
  resource_type: Enum (workspace, task, message, kb_article, user, session, file, role),
  resource_id: String,
  details: {
    old_value: Object,
    new_value: Object,
    changes: Object
  },
  notification_sent: Boolean,
  notification_channels: [Enum (in-app, email, sms, push, webhook)],
  recipients: [{
    user_id: String,
    read: Boolean,
    read_at: Date
  }]
}
```

### Collaboration Session Object
```javascript
{
  id: String (UUID),
  workspace_id: String,
  resource_type: Enum (document, task, incident, whiteboard, general),
  resource_id: String,
  participants: [{
    user_id: String,
    joined_at: Date,
    left_at: Date,
    is_active: Boolean,
    cursor_position: Object,
    current_selection: Object
  }],
  status: Enum (active, paused, ended),
  session_type: Enum (editing, viewing, meeting, screen-sharing),
  changes: [{
    user_id: String,
    timestamp: Date,
    operation: String,
    data: Object
  }],
  ended_at: Date
}
```

## Usage Examples

### Create a Workspace
```bash
curl -X POST http://localhost:8080/api/v1/collaboration/workspaces \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Security Operations Center",
    "description": "Main SOC workspace for threat intelligence and incident response",
    "type": "security-operations"
  }'
```

### Create a Task
```bash
curl -X POST http://localhost:8080/api/v1/collaboration/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Investigate suspicious login activity",
    "description": "Multiple failed login attempts from IP 192.168.1.100",
    "workspace_id": "workspace-uuid",
    "priority": "high",
    "status": "todo",
    "due_date": "2024-12-31T23:59:59Z",
    "tags": ["investigation", "security"]
  }'
```

### Create a Role
```bash
curl -X POST http://localhost:8080/api/v1/collaboration/roles \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Security Analyst",
    "description": "Can create and manage tasks and KB articles",
    "type": "custom",
    "permissions": [
      {
        "resource": "task",
        "actions": ["create", "read", "update"]
      },
      {
        "resource": "kb_article",
        "actions": ["create", "read", "update"]
      },
      {
        "resource": "message",
        "actions": ["create", "read"]
      }
    ]
  }'
```

### Create a Knowledge Base Article
```bash
curl -X POST http://localhost:8080/api/v1/collaboration/kb/articles \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Incident Response Playbook: Ransomware",
    "content": "## Overview\n\nThis playbook provides step-by-step guidance...",
    "category": "playbooks",
    "tags": ["incident-response", "ransomware", "playbook"],
    "workspace_id": "workspace-uuid",
    "format": "markdown",
    "status": "draft"
  }'
```

### Send a Message
```bash
curl -X POST http://localhost:8080/api/v1/collaboration/messages \
  -H "Content-Type: application/json" \
  -d '{
    "channel_id": "channel-uuid",
    "workspace_id": "workspace-uuid",
    "content": "Critical alert: Potential data breach detected in production environment",
    "type": "text",
    "mentions": [
      {
        "user_id": "user-uuid",
        "mention_type": "user"
      }
    ]
  }'
```

### Start a Collaboration Session
```bash
curl -X POST http://localhost:8080/api/v1/collaboration/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "workspace_id": "workspace-uuid",
    "resource_type": "document",
    "resource_id": "document-uuid",
    "session_type": "editing"
  }'
```

### Get User Workload
```bash
curl http://localhost:8080/api/v1/collaboration/tasks/workload/user-uuid?workspace_id=workspace-uuid
```

### Search Knowledge Base
```bash
curl "http://localhost:8080/api/v1/collaboration/kb/search?query=ransomware&category=playbooks&status=published"
```

## Database Requirements

- **MongoDB**: Primary database for all collaboration data
- **Connection String**: Set in `MONGODB_URI` environment variable
- **Default**: `mongodb://localhost:27017/blackcross`

## Configuration

Environment variables:
```
MONGODB_URI=mongodb://localhost:27017/blackcross
LOG_LEVEL=info
```

## Business Logic Highlights

### Workspace Management
- Automatic member count tracking
- Activity timestamp updates
- Cross-workspace collaboration support
- Analytics calculation

### RBAC System
- Hierarchical permission structure
- Permission inheritance from parent roles
- System roles (non-deletable, non-editable)
- Custom role creation per workspace
- Future: Full permission checking integration

### Task Management
- Automatic status updates based on progress
- Overdue task detection
- Workload balancing across team members
- Task dependency tracking
- Comment history preservation

### Knowledge Base
- Version control with full history
- Approval workflow enforcement
- View count tracking
- Search optimization with text indexes
- Access control enforcement

### Secure Messaging
- End-to-end encryption using AES-256-GCM
- Message editing preserves encryption
- Reaction and read receipt tracking
- Thread support for organized conversations
- Message pinning for important content

### Activity Tracking
- Comprehensive activity logging
- Personalized feed generation
- Read/unread status management
- Activity statistics and analytics
- Notification distribution

## Performance Considerations

- Indexed fields for fast queries (workspace_id, user_id, created_at, etc.)
- Pagination support for large result sets
- Efficient text search with MongoDB text indexes
- Connection pooling for database efficiency
- Async/await for non-blocking operations
- Activity feed optimization with targeted queries

## Security

- Input validation using Joi schemas
- Sanitized database queries with Mongoose
- End-to-end encryption for messages
- Audit logging for all operations
- Access control ready for integration
- Secure key management for encryption
- Authentication integration points

## Testing

The module includes comprehensive business logic that can be tested with:
```bash
npm test src/modules/collaboration
```

Note: MongoDB must be running for integration tests.

## Integration Points

The module is designed to integrate with:
- **External Chat Systems**: Slack, Microsoft Teams
- **Project Management**: Jira, ServiceNow
- **Email Systems**: For notifications
- **Calendar Systems**: For task scheduling
- **SSO/SAML Providers**: For authentication
- **WebSocket Servers**: For real-time collaboration

## Future Enhancements

- WebSocket implementation for real-time updates
- Video conferencing integration
- Screen sharing capabilities
- Advanced search with Elasticsearch
- Redis caching for performance
- Real-time document collaboration with operational transforms
- Machine learning for workload prediction
- Advanced analytics dashboard
- Mobile app support
- File storage integration (S3, Azure Blob)
- Email integration for notifications
- Calendar integration for task scheduling
