# Code Review Module

## Overview

The Code Review Module is an advanced SOA-aligned code review system that uses **six expert agents** working simultaneously to perform comprehensive code analysis. Each agent specializes in a specific aspect of software architecture and quality assurance.

## Six Expert Agents

### 1. Architecture & Design Review Agent
- **Focus**: SOA principles, modular design, separation of concerns
- **Checks**:
  - Module structure and organization
  - Separation of concerns
  - Service boundaries
  - Dependency management
  - Interface contracts

### 2. Security & Authentication Review Agent
- **Focus**: Security best practices, authentication, authorization
- **Checks**:
  - Authentication implementation
  - Authorization and RBAC
  - Sensitive data exposure
  - Input validation
  - Security headers
  - Hardcoded secrets

### 3. API & Interface Review Agent
- **Focus**: RESTful API design, endpoint structure, documentation
- **Checks**:
  - API versioning
  - RESTful conventions
  - API documentation
  - Response structure consistency
  - Error handling
  - Rate limiting

### 4. Data Layer & Database Review Agent
- **Focus**: Database design, ORM usage, data integrity
- **Checks**:
  - Database models
  - Repository pattern
  - SQL injection prevention
  - Data validation
  - Migrations
  - Database configuration

### 5. Performance & Scalability Review Agent
- **Focus**: Performance optimization, caching, async operations
- **Checks**:
  - Caching implementation
  - Async/await usage
  - Database query optimization
  - N+1 query problems
  - Resource pooling
  - Pagination
  - Logging performance

### 6. Testing & Quality Assurance Review Agent
- **Focus**: Test coverage, test quality, testing patterns
- **Checks**:
  - Test infrastructure
  - Test coverage
  - Test organization
  - Test quality
  - E2E tests
  - CI/CD integration

## API Endpoints

### Execute Code Review
```http
POST /api/v1/code-review/execute
```

**Request Body:**
```json
{
  "targetPath": "/path/to/code",
  "includePatterns": ["*.ts", "*.js"],
  "excludePatterns": ["node_modules/**", "dist/**"],
  "enabledAgents": ["architecture", "security"],
  "minSeverity": "medium",
  "parallel": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "review-uuid",
    "status": "completed",
    "targetPath": "/path/to/code",
    "startTime": "2024-01-01T00:00:00Z",
    "endTime": "2024-01-01T00:05:00Z",
    "duration": 300000,
    "agentResults": [...],
    "overallSummary": {
      "totalFindings": 42,
      "criticalFindings": 3,
      "highFindings": 8,
      "mediumFindings": 15,
      "lowFindings": 12,
      "infoFindings": 4,
      "agentsCompleted": 6,
      "agentsFailed": 0
    },
    "recommendations": [...],
    "soaComplianceScore": 87
  }
}
```

### Get Available Agents
```http
GET /api/v1/code-review/agents
```

**Response:**
```json
{
  "success": true,
  "data": {
    "agents": [
      {
        "name": "Architecture & Design Review Agent",
        "category": "architecture"
      },
      {
        "name": "Security & Authentication Review Agent",
        "category": "security"
      },
      ...
    ],
    "totalAgents": 6
  }
}
```

### Health Check
```http
GET /api/v1/code-review/health
```

## Usage Examples

### Using cURL
```bash
# Execute code review
curl -X POST http://localhost:8080/api/v1/code-review/execute \
  -H "Content-Type: application/json" \
  -d '{
    "targetPath": "/home/runner/work/black-cross/black-cross",
    "parallel": true
  }'

# Get available agents
curl http://localhost:8080/api/v1/code-review/agents

# Health check
curl http://localhost:8080/api/v1/code-review/health
```

### Using Node.js
```javascript
const axios = require('axios');

async function runCodeReview() {
  const response = await axios.post('http://localhost:8080/api/v1/code-review/execute', {
    targetPath: '/path/to/code',
    parallel: true
  });
  
  console.log('Review Results:', response.data);
  console.log('SOA Compliance Score:', response.data.data.soaComplianceScore);
}

runCodeReview();
```

## SOA Compliance Score

The system calculates an SOA compliance score (0-100) based on findings:
- **90-100**: Excellent - Follows SOA principles closely
- **75-89**: Good - Minor improvements needed
- **60-74**: Fair - Several areas need attention
- **Below 60**: Poor - Significant SOA violations

**Score Calculation:**
- Critical findings: -20 points each
- High severity: -10 points each
- Medium severity: -5 points each
- Low severity: -2 points each
- Info: -1 point each

## Recommendations

The system generates prioritized recommendations:
1. **Critical issues** - Must be addressed immediately
2. **High severity** - Should be addressed soon
3. **General SOA recommendations** - Best practices to follow

## Integration

### Add to Main Application

In `backend/index.ts`:
```typescript
import codeReview from './modules/code-review';

app.use('/api/v1/code-review', codeReview);
```

### Run Review Programmatically

```typescript
import { CodeReviewOrchestrator } from './modules/code-review/services/CodeReviewOrchestrator';

const orchestrator = new CodeReviewOrchestrator();
const report = await orchestrator.executeReview({
  targetPath: '/path/to/code',
  parallel: true
});

console.log('Findings:', report.overallSummary.totalFindings);
console.log('SOA Score:', report.soaComplianceScore);
```

## Benefits

1. **Simultaneous Execution**: All six agents run in parallel for fast results
2. **Comprehensive Coverage**: Covers architecture, security, API design, data layer, performance, and testing
3. **SOA-Aligned**: Every finding references SOA principles
4. **Actionable Recommendations**: Provides specific recommendations with code examples
5. **Scoring System**: Quantifies code quality with SOA compliance score
6. **CI/CD Integration**: Can be integrated into continuous integration pipelines

## Architecture

```
code-review/
├── agents/              # Six expert review agents
│   ├── ArchitectureReviewAgent.ts
│   ├── SecurityReviewAgent.ts
│   ├── ApiReviewAgent.ts
│   ├── DataLayerReviewAgent.ts
│   ├── PerformanceReviewAgent.ts
│   └── TestingReviewAgent.ts
├── services/            # Orchestration services
│   └── CodeReviewOrchestrator.ts
├── types/               # TypeScript type definitions
│   └── index.ts
├── controller.ts        # HTTP request handlers
├── index.ts            # Route definitions
└── README.md           # This file
```

## Future Enhancements

- [ ] Add custom rule definitions
- [ ] Support for multiple languages
- [ ] Historical trend analysis
- [ ] Integration with GitHub/GitLab
- [ ] Automated fix suggestions
- [ ] Machine learning-based recommendations
- [ ] Real-time collaboration features
- [ ] Export reports in multiple formats (PDF, HTML, JSON)
