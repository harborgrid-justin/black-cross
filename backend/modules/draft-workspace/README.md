# Draft Workspace

Work-in-progress state management with autosave and version control.

## Features

- ✅ Draft creation for multiple entity types
- ✅ Autosave functionality
- ✅ Version history and revisions
- ✅ Draft templates
- ✅ Conflict resolution
- ✅ Automatic expiration and cleanup
- ✅ Draft statistics
- ✅ Restore to previous versions

## Supported Entity Types

- Incidents
- Threats
- Vulnerabilities
- IOCs
- Cases
- Reports
- Playbooks
- Threat Actors

## API Endpoints

### Drafts
- `POST /api/v1/drafts` - Create draft
- `GET /api/v1/drafts` - Get user drafts
- `GET /api/v1/drafts/stats` - Get draft statistics
- `GET /api/v1/drafts/:id` - Get draft by ID
- `PUT /api/v1/drafts/:id` - Update draft (autosave)
- `POST /api/v1/drafts/:id/submit` - Submit draft
- `POST /api/v1/drafts/:id/discard` - Discard draft
- `DELETE /api/v1/drafts/:id` - Delete draft permanently

### Revisions
- `GET /api/v1/drafts/:id/revisions` - Get draft revisions
- `POST /api/v1/drafts/:id/revisions/:revisionId/restore` - Restore to revision

## Usage Example

```typescript
import { draftWorkspaceService } from './service';

// Create draft
const draft = await draftWorkspaceService.createDraft({
  entity_type: DraftEntityType.INCIDENT,
  title: 'New Security Incident',
  content: {
    severity: 'high',
    description: 'Investigating...',
    affected_systems: []
  }
}, 'user-123');

// Autosave
await draftWorkspaceService.updateDraft(draft.id, {
  content: {
    ...draft.content,
    description: 'Updated description'
  }
}, 'user-123', false); // false = autosave, no revision

// Manual save with revision
await draftWorkspaceService.updateDraft(draft.id, {
  content: draft.content
}, 'user-123', true); // true = create revision

// Submit draft
await draftWorkspaceService.submitDraft(draft.id, {
  changes_summary: 'Initial incident report'
}, 'user-123');
```

## Configuration

- **Max Drafts Per User**: 50
- **Retention Period**: 30 days
- **Autosave Interval**: Client-side (recommended: 30 seconds)
