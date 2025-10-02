# Black-Cross API Reference

## Overview

The Black-Cross API provides comprehensive access to all 15 platform features through RESTful endpoints. All endpoints require authentication via JWT tokens.

## Base URL

```
Production: https://api.black-cross.io/v1
Development: http://localhost:8080/api/v1
```

## Authentication

### Obtain Access Token

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure_password"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 86400,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "analyst"
  }
}
```

### Use Token in Requests

```http
GET /api/v1/threats
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## API Modules

### 1. Threat Intelligence Management

**Base Path**: `/api/v1/threat-intelligence`

#### Endpoints

- `POST /threats/collect` - Collect threat intelligence
- `GET /threats/stream` - Stream real-time threats
- `POST /threats/categorize` - Categorize threats
- `GET /threats/categories` - List categories
- `POST /threats/archive` - Archive threats
- `GET /threats/history` - Get historical threats
- `POST /threats/enrich` - Enrich threat data
- `GET /threats/{id}/enriched` - Get enriched threat
- `POST /taxonomies` - Create taxonomy
- `PUT /taxonomies/{id}` - Update taxonomy
- `POST /threats/correlate` - Correlate threats
- `GET /threats/{id}/related` - Get related threats
- `GET /threats/{id}/context` - Get threat context
- `POST /threats/analyze` - Analyze threats

### 2. Incident Response & Management

**Base Path**: `/api/v1/incidents`

#### Endpoints

- `POST /incidents` - Create incident
- `GET /incidents/{id}` - Get incident details
- `PATCH /incidents/{id}` - Update incident
- `POST /incidents/{id}/prioritize` - Prioritize incident
- `GET /incidents/priority-queue` - Get priority queue
- `POST /incidents/{id}/execute-workflow` - Execute workflow
- `GET /workflows` - List workflows
- `POST /incidents/{id}/post-mortem` - Create post-mortem
- `GET /incidents/{id}/report` - Generate report
- `GET /incidents/{id}/timeline` - Get timeline
- `POST /incidents/{id}/events` - Add event
- `POST /incidents/{id}/evidence` - Add evidence
- `GET /incidents/{id}/evidence/{evidence_id}` - Get evidence
- `POST /incidents/{id}/notify` - Send notification
- `GET /incidents/{id}/communications` - Get communications

### 3. Threat Hunting Platform

**Base Path**: `/api/v1/hunting`

#### Endpoints

- `POST /query` - Execute hunt query
- `GET /queries` - List saved queries
- `POST /hypotheses` - Create hypothesis
- `GET /hypotheses/{id}` - Get hypothesis
- `POST /playbooks/execute` - Execute playbook
- `GET /playbooks` - List playbooks
- `POST /behavior-analysis` - Analyze behavior
- `GET /behaviors/{entity_id}` - Get entity behavior
- `POST /detect-anomalies` - Detect anomalies
- `GET /patterns` - Get patterns
- `POST /findings` - Document finding
- `GET /findings/{id}` - Get finding
- `POST /sessions` - Create hunting session
- `GET /sessions/{id}` - Get session details

### 4. Vulnerability Management

**Base Path**: `/api/v1/vulnerabilities`

#### Endpoints

- `POST /scan` - Initiate vulnerability scan
- `GET /scans` - List scans
- `GET /cves` - List CVEs
- `GET /cves/{id}` - Get CVE details
- `GET /assets/{asset_id}` - Get asset vulnerabilities
- `POST /map` - Map vulnerabilities
- `GET /patches` - List patches
- `POST /patches/deploy` - Deploy patch
- `POST /prioritize` - Prioritize vulnerabilities
- `GET /priority-list` - Get priority list
- `POST /{id}/remediate` - Start remediation
- `GET /{id}/verification` - Get verification status
- `GET /trends` - Get vulnerability trends
- `GET /analytics` - Get analytics

### 5. SIEM Integration

**Base Path**: `/api/v1/siem`

#### Endpoints

- `POST /logs/ingest` - Ingest logs
- `GET /logs/sources` - List log sources
- `POST /correlate` - Correlate events
- `GET /correlation-rules` - List rules
- `POST /rules` - Create detection rule
- `PUT /rules/{id}` - Update rule
- `GET /alerts` - List alerts
- `PATCH /alerts/{id}` - Update alert
- `GET /dashboards` - List dashboards
- `POST /dashboards` - Create dashboard
- `POST /forensics/search` - Forensic search
- `GET /forensics/session/{id}` - Get session
- `GET /compliance/reports` - List reports
- `POST /compliance/generate` - Generate report

### 6. Threat Actor Profiling

**Base Path**: `/api/v1/threat-actors`

#### Endpoints

- `POST /` - Create actor profile
- `GET /{id}` - Get actor details
- `GET /{id}/ttps` - Get TTPs
- `POST /{id}/ttps` - Add TTP
- `POST /attribute` - Perform attribution
- `GET /attribution/{incident_id}` - Get attribution
- `POST /campaigns` - Create campaign
- `GET /campaigns/{id}` - Get campaign
- `GET /{id}/assessment` - Get assessment
- `PUT /{id}/assessment` - Update assessment
- `GET /{id}/targets` - Get targets
- `GET /targeting-trends` - Get trends
- `GET /{id}/relationships` - Get relationships
- `POST /{id}/relationships` - Add relationship

### 7. IoC Management

**Base Path**: `/api/v1/iocs`

#### Endpoints

- `POST /ingest` - Ingest IoCs
- `POST /validate` - Validate IoCs
- `GET /types` - List IoC types
- `POST /convert` - Convert format
- `GET /{id}/confidence` - Get confidence
- `PUT /{id}/confidence` - Update confidence
- `POST /{id}/enrich` - Enrich IoC
- `GET /{id}/enrichment` - Get enrichment
- `PATCH /{id}/lifecycle` - Update lifecycle
- `GET /lifecycle-status` - Get lifecycle status
- `POST /bulk-import` - Bulk import
- `POST /bulk-export` - Bulk export
- `GET /search` - Search IoCs
- `POST /search/advanced` - Advanced search

### 8. Threat Intelligence Feeds

**Base Path**: `/api/v1/feeds`

#### Endpoints

- `POST /aggregate` - Aggregate feeds
- `GET /sources` - List sources
- `GET /commercial` - List commercial feeds
- `GET /opensource` - List open-source feeds
- `GET /{id}/reliability` - Get reliability
- `POST /{id}/score` - Update score
- `POST /parse` - Parse feed
- `GET /schemas` - Get schemas
- `POST /custom` - Create custom feed
- `PUT /custom/{id}` - Update custom feed
- `POST /{id}/schedule` - Schedule feed
- `GET /{id}/status` - Get status
- `POST /deduplicate` - Deduplicate
- `GET /duplicates` - List duplicates

### 9. Risk Assessment & Scoring

**Base Path**: `/api/v1/risk`

#### Endpoints

- `POST /assets/assess` - Assess asset
- `GET /assets/{id}/criticality` - Get criticality
- `POST /threats/{id}/impact` - Analyze impact
- `GET /impact-analysis` - Get analysis
- `POST /calculate` - Calculate risk
- `GET /scores` - Get risk scores
- `GET /priorities` - Get priorities
- `POST /reprioritize` - Reprioritize
- `POST /models` - Create model
- `PUT /models/{id}` - Update model
- `GET /trends` - Get trends
- `GET /visualizations` - Get visualizations
- `GET /reports/executive` - Executive report
- `POST /reports/generate` - Generate report

### 10. Collaboration & Workflow

**Base Path**: `/api/v1/collaboration`

#### Endpoints

- `POST /workspaces` - Create workspace
- `GET /workspaces/{id}` - Get workspace
- `POST /roles` - Create role
- `PUT /users/{id}/roles` - Assign roles
- `WS /session` - Collaboration session (WebSocket)
- `GET /sessions` - List sessions
- `POST /tasks` - Create task
- `PATCH /tasks/{id}` - Update task
- `POST /kb/articles` - Create article
- `GET /kb/search` - Search knowledge base
- `POST /messages` - Send message
- `GET /messages/channels/{id}` - Get messages
- `GET /activities` - Get activities
- `PUT /users/notifications/preferences` - Update preferences

### 11. Reporting & Analytics

**Base Path**: `/api/v1/reports`

#### Endpoints

- `POST /templates` - Create template
- `GET /templates/{id}` - Get template
- `POST /schedules` - Schedule report
- `GET /executions` - List executions
- `GET /dashboards/executive` - Executive dashboard
- `POST /dashboards/widgets` - Add widget
- `GET /analytics/threat-trends` - Threat trends
- `POST /analytics/predict` - Predict trends
- `POST /metrics/kpis` - Create KPI
- `GET /metrics/kpis/{id}/history` - KPI history
- `GET /visualizations` - List visualizations
- `POST /visualizations/render` - Render visualization
- `POST /{id}/export` - Export report
- `GET /exports/{id}/download` - Download export

### 12. Malware Analysis & Sandbox

**Base Path**: `/api/v1/malware`

#### Endpoints

- `POST /submit` - Submit malware
- `GET /submissions` - List submissions
- `GET /{id}/static-analysis` - Static analysis
- `GET /{id}/dynamic-analysis` - Dynamic analysis
- `GET /{id}/behavior` - Behavior report
- `GET /{id}/report` - Full report
- `GET /sandbox/environments` - List environments
- `POST /sandbox/environments` - Create environment
- `GET /{id}/family` - Get family
- `POST /classify` - Classify malware
- `GET /{id}/iocs` - Get IoCs
- `POST /{id}/extract-iocs` - Extract IoCs
- `POST /{id}/generate-yara` - Generate YARA
- `GET /yara/rules` - List YARA rules

### 13. Dark Web Monitoring

**Base Path**: `/api/v1/darkweb`

#### Endpoints

- `GET /forums` - List forums
- `POST /monitor` - Start monitoring
- `POST /credentials/check` - Check credentials
- `GET /credentials/breaches` - List breaches
- `POST /brands` - Add brand
- `GET /brands/{id}/mentions` - Get mentions
- `GET /actors/{id}` - Get actor
- `POST /actors/track` - Track actor
- `POST /alerts/rules` - Create alert rule
- `GET /alerts` - List alerts
- `GET /data` - Get collected data
- `POST /data/collect` - Collect data
- `POST /reports/generate` - Generate report
- `GET /reports/{id}` - Get report

### 14. Compliance & Audit Management

**Base Path**: `/api/v1/compliance`

#### Endpoints

- `GET /frameworks` - List frameworks
- `POST /frameworks/{id}/map` - Map controls
- `GET /audit/logs` - Get audit logs
- `GET /audit/logs/user/{id}` - User audit logs
- `POST /gap-analysis` - Run gap analysis
- `GET /gaps` - List gaps
- `POST /policies` - Create policy
- `GET /policies/{id}` - Get policy
- `POST /reports/generate` - Generate report
- `GET /reports` - List reports
- `POST /evidence` - Add evidence
- `GET /evidence/{control_id}` - Get evidence
- `GET /requirements` - List requirements
- `POST /requirements/track` - Track requirement

### 15. Automated Response & Playbooks

**Base Path**: `/api/v1/playbooks`

#### Endpoints

- `GET /library` - List pre-built playbooks
- `GET /{id}` - Get playbook
- `POST /` - Create playbook
- `PUT /{id}` - Update playbook
- `POST /{id}/execute` - Execute playbook
- `GET /executions/{id}` - Get execution
- `GET /integrations` - List integrations
- `POST /integrations/{id}/test` - Test integration
- `POST /{id}/decisions` - Add decision
- `GET /{id}/paths` - Get execution paths
- `POST /{id}/test` - Test playbook
- `GET /{id}/test-results` - Get test results
- `GET /{id}/metrics` - Get metrics
- `GET /analytics` - Get analytics

## Common Response Codes

- `200 OK` - Successful request
- `201 Created` - Resource created
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

## Rate Limiting

- 100 requests per 15 minutes per user
- 1000 requests per hour per API key
- Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

## Pagination

```
GET /api/v1/threats?page=1&per_page=50

Response:
{
  "data": [...],
  "pagination": {
    "page": 1,
    "per_page": 50,
    "total": 1000,
    "total_pages": 20
  }
}
```

## Error Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input parameters",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

## SDKs and Libraries

- Python: `pip install blackcross-sdk`
- JavaScript: `npm install @blackcross/sdk`
- Go: `go get github.com/blackcross/go-sdk`
- Ruby: `gem install blackcross`

## Webhooks

Configure webhooks to receive real-time notifications:

```http
POST /api/v1/webhooks
Content-Type: application/json

{
  "url": "https://your-server.com/webhook",
  "events": ["threat.detected", "incident.created"],
  "secret": "webhook_secret"
}
```

## Support

- API Documentation: https://api-docs.black-cross.io
- API Status: https://status.black-cross.io
- Support: api-support@black-cross.io
