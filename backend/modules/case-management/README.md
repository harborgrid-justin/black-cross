# Case Management

Enhanced incident case handling with workflow, tasks, and collaboration features.

## Features

- ✅ Comprehensive case lifecycle management
- ✅ Task tracking and assignment
- ✅ Comments and activity timeline
- ✅ Case templates for standardized workflows
- ✅ Attachment management
- ✅ Advanced filtering and search
- ✅ Case metrics and analytics
- ✅ Status transitions and history

## API Endpoints

### Cases
- `POST /api/v1/cases` - Create case
- `GET /api/v1/cases` - Get all cases (with filters)
- `GET /api/v1/cases/metrics` - Get case metrics
- `GET /api/v1/cases/:id` - Get case by ID
- `PUT /api/v1/cases/:id` - Update case
- `DELETE /api/v1/cases/:id` - Delete case

### Tasks
- `POST /api/v1/cases/:id/tasks` - Create task
- `GET /api/v1/cases/:id/tasks` - Get case tasks
- `PUT /api/v1/cases/:id/tasks/:taskId` - Update task
- `DELETE /api/v1/cases/:id/tasks/:taskId` - Delete task

### Comments & Timeline
- `POST /api/v1/cases/:id/comments` - Add comment
- `GET /api/v1/cases/:id/comments` - Get comments
- `GET /api/v1/cases/:id/timeline` - Get timeline

### Templates
- `POST /api/v1/cases/templates` - Create template
- `GET /api/v1/cases/templates` - Get all templates

## Usage Example

```typescript
import { caseManagementService } from './service';

// Create case from template
const case = await caseManagementService.createCase({
  title: 'Security Incident Investigation',
  description: 'Investigating unauthorized access attempt',
  priority: CasePriority.HIGH,
  category: CaseCategory.SECURITY_INCIDENT,
  assignee_id: 'analyst-123',
  template_id: 'incident-template-1'
}, 'user-123');

// Add task
await caseManagementService.createTask(case.id, {
  title: 'Review access logs',
  assignee_id: 'analyst-123',
  due_date: new Date(Date.now() + 24 * 60 * 60 * 1000)
}, 'user-123');
```
