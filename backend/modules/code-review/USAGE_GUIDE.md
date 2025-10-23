# Code Review System Usage Guide

## Quick Start

The SOA-Aligned Code Review System provides three ways to execute reviews:

### 1. Via HTTP API Endpoint

Start the backend server and make a POST request:

```bash
# Start the server
cd backend && npm run dev

# Execute review via API
curl -X POST http://localhost:8080/api/v1/code-review/execute \
  -H "Content-Type: application/json" \
  -d '{
    "targetPath": "/path/to/code",
    "parallel": true
  }'
```

### 2. Via Test Script

Run the standalone test script:

```bash
cd backend
npx ts-node modules/code-review/test-review.ts
```

This will:
- Execute all 6 agents in parallel
- Generate a comprehensive report
- Save results to `modules/code-review/reports/test-report.json`
- Display summary in console

### 3. Programmatically in Code

```typescript
import { CodeReviewOrchestrator } from './modules/code-review/services/CodeReviewOrchestrator';
import { ReviewConfig } from './modules/code-review/types';

const orchestrator = new CodeReviewOrchestrator();

const config: ReviewConfig = {
  targetPath: '/path/to/code',
  parallel: true,
};

const report = await orchestrator.executeReview(config);

console.log('Total Findings:', report.overallSummary.totalFindings);
console.log('SOA Compliance Score:', report.soaComplianceScore);
```

## Understanding the Results

### Finding Severity Levels

- **CRITICAL** (⚠️): Must be fixed immediately - security vulnerabilities, major architectural issues
- **HIGH** (🔴): Should be fixed soon - significant problems affecting quality or security
- **MEDIUM** (🟡): Should be addressed - improvements that enhance maintainability
- **LOW** (🟢): Optional improvements - minor issues or suggestions
- **INFO** (ℹ️): Informational - suggestions for best practices

### SOA Compliance Score

The score ranges from 0-100%:

- **90-100%**: Excellent - Code closely follows SOA principles
- **75-89%**: Good - Minor improvements needed
- **60-74%**: Fair - Several areas need attention
- **Below 60%**: Poor - Significant SOA violations detected

### Report Structure

Each report contains:

```json
{
  "id": "unique-review-id",
  "status": "completed",
  "targetPath": "/path/to/code",
  "startTime": "2024-01-01T00:00:00Z",
  "endTime": "2024-01-01T00:05:00Z",
  "duration": 300000,
  "agentResults": [
    {
      "agentName": "Architecture & Design Review Agent",
      "category": "architecture",
      "status": "completed",
      "findings": [...],
      "summary": {
        "total": 25,
        "critical": 0,
        "high": 5,
        "medium": 15,
        "low": 5,
        "info": 0
      },
      "executionTime": 500
    }
  ],
  "overallSummary": {
    "totalFindings": 913,
    "criticalFindings": 5,
    "highFindings": 35,
    "mediumFindings": 833,
    "lowFindings": 40,
    "infoFindings": 0,
    "agentsCompleted": 6,
    "agentsFailed": 0
  },
  "recommendations": [...],
  "soaComplianceScore": 85
}
```

## Six Expert Agents Explained

### 1. Architecture & Design Review Agent

**What it checks:**
- Module structure and organization
- Separation of concerns (routes vs controllers vs services)
- Service boundaries and coupling
- Dependency management
- Interface contracts

**Common findings:**
- Missing or incomplete module files (index.ts, controller.ts, service.ts, types.ts)
- Business logic in route files
- Tight coupling between modules
- Missing type definitions

**Example recommendation:**
```typescript
// Before: Business logic in routes
router.get("/users", (req, res) => {
  const users = await User.findAll();
  res.json(users);
});

// After: Proper separation
router.get("/users", controller.getAllUsers);
```

### 2. Security & Authentication Review Agent

**What it checks:**
- Authentication implementation (JWT, sessions)
- Authorization and RBAC
- Sensitive data exposure
- Input validation
- Security headers (Helmet, CORS)
- Hardcoded secrets

**Common findings:**
- Missing authentication module
- No authorization middleware
- Password or token exposure in responses
- Hardcoded API keys or secrets
- Missing security headers

**Example recommendation:**
```typescript
// Before: Exposing sensitive data
res.json(user); // Includes password hash

// After: Exclude sensitive fields
const { password, ...safeUser } = user;
res.json(safeUser);
```

### 3. API & Interface Review Agent

**What it checks:**
- API versioning (/api/v1)
- RESTful conventions
- API documentation (Swagger/OpenAPI)
- Response structure consistency
- Error handling
- Rate limiting

**Common findings:**
- Missing API versioning
- Verb-based endpoints instead of resource-based
- Missing Swagger documentation
- Inconsistent response formats
- No rate limiting

**Example recommendation:**
```typescript
// Before: Non-RESTful
router.post("/createUser", handler);
router.post("/deleteUser", handler);

// After: RESTful
router.post("/users", handler);
router.delete("/users/:id", handler);
```

### 4. Data Layer & Database Review Agent

**What it checks:**
- Database models and ORM structure
- Repository pattern implementation
- SQL injection prevention
- Data validation at model level
- Database migrations
- Connection pooling

**Common findings:**
- Missing or incomplete models
- No repository pattern
- Raw SQL with string concatenation
- Missing field validation
- No migrations directory
- Missing connection pooling

**Example recommendation:**
```typescript
// Before: SQL injection risk
query(`SELECT * FROM users WHERE id = ${userId}`);

// After: Parameterized query
query("SELECT * FROM users WHERE id = ?", [userId]);
```

### 5. Performance & Scalability Review Agent

**What it checks:**
- Caching implementation (Redis)
- Async/await patterns
- Database query optimization
- N+1 query problems
- Resource pooling
- Pagination
- Logging performance

**Common findings:**
- No caching configuration
- Sequential awaits that could be parallel
- SELECT * queries
- Unbounded queries without limits
- Database queries in loops (N+1)
- Missing pagination

**Example recommendation:**
```typescript
// Before: Sequential awaits
const users = await fetchUsers();
const posts = await fetchPosts();

// After: Parallel execution
const [users, posts] = await Promise.all([
  fetchUsers(),
  fetchPosts()
]);
```

### 6. Testing & Quality Assurance Review Agent

**What it checks:**
- Test infrastructure (Jest, Mocha, Cypress)
- Test coverage per module
- Test organization and naming
- Test quality (assertions, setup/teardown)
- E2E tests
- CI/CD integration

**Common findings:**
- Missing testing framework
- No tests for specific modules
- Incorrect test file naming
- Missing test structure (describe blocks)
- No assertions in tests
- Missing E2E tests
- No CI/CD workflows

**Example recommendation:**
```typescript
// Before: No test structure
test("creates user", () => {
  // test code
});

// After: Organized with describe
describe("UserService", () => {
  describe("createUser", () => {
    test("should create user successfully", () => {
      expect(result).toBeDefined();
    });
  });
});
```

## Advanced Configuration

### Filter by Severity

Only show critical and high severity findings:

```json
{
  "targetPath": "/path/to/code",
  "minSeverity": "high",
  "parallel": true
}
```

### Enable Specific Agents

Run only selected agents:

```json
{
  "targetPath": "/path/to/code",
  "enabledAgents": ["architecture", "security"],
  "parallel": true
}
```

### File Patterns

Include/exclude specific file patterns:

```json
{
  "targetPath": "/path/to/code",
  "includePatterns": ["*.ts", "*.js"],
  "excludePatterns": ["node_modules/**", "dist/**", "*.test.ts"],
  "parallel": true
}
```

## Interpreting Recommendations

Each finding includes:

1. **Title**: Brief description of the issue
2. **Description**: Detailed explanation
3. **Severity**: Impact level
4. **Location**: File path and line number
5. **Recommendation**: Specific fix instructions
6. **SOA Principle**: Which SOA principle is violated
7. **Code Example**: Before/after comparison (when applicable)
8. **References**: Links to documentation or resources

Example finding:

```json
{
  "id": "finding-uuid",
  "agentName": "Security & Authentication Review Agent",
  "category": "security",
  "severity": "critical",
  "title": "SQL injection vulnerability",
  "description": "Raw SQL query with string concatenation detected",
  "location": {
    "file": "backend/modules/users/service.ts",
    "line": 42
  },
  "recommendation": "Use parameterized queries or ORM methods",
  "soaPrinciple": "Secure Data Access - Always use parameterized queries",
  "codeExample": {
    "before": "query(`SELECT * FROM users WHERE id = ${userId}`)",
    "after": "query('SELECT * FROM users WHERE id = ?', [userId])"
  },
  "references": [
    "https://owasp.org/www-community/attacks/SQL_Injection"
  ],
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## Best Practices

### When to Run Reviews

1. **Before Pull Requests**: Catch issues early
2. **After Major Changes**: Ensure quality is maintained
3. **Regular Audits**: Weekly or monthly reviews
4. **Before Releases**: Final quality check

### Acting on Findings

1. **Prioritize by Severity**: Fix critical and high issues first
2. **Group Similar Issues**: Fix all instances of the same problem
3. **Track Progress**: Use the report to monitor improvements
4. **Document Decisions**: If ignoring a finding, document why

### Improving Your Score

To improve your SOA Compliance Score:

1. **Fix Critical Issues First**: Each critical issue deducts 20 points
2. **Address High Severity**: Each high issue deducts 10 points
3. **Follow Module Structure**: Ensure all modules have standard files
4. **Add Tests**: Cover all modules with unit and integration tests
5. **Document APIs**: Add Swagger documentation to all endpoints
6. **Implement Security**: Add proper authentication and authorization
7. **Optimize Queries**: Use pagination and avoid N+1 queries
8. **Use Caching**: Implement Redis for frequently accessed data

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: Code Review

on:
  pull_request:
    branches: [ main ]

jobs:
  code-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      
      - name: Install dependencies
        run: npm install
      
      - name: Run Code Review
        run: |
          cd backend
          npx ts-node modules/code-review/test-review.ts > review-output.txt
      
      - name: Upload Report
        uses: actions/upload-artifact@v2
        with:
          name: code-review-report
          path: backend/modules/code-review/reports/test-report.json
      
      - name: Check Score
        run: |
          SCORE=$(cat backend/modules/code-review/reports/test-report.json | jq '.soaComplianceScore')
          if [ "$SCORE" -lt 70 ]; then
            echo "SOA Compliance Score too low: $SCORE%"
            exit 1
          fi
```

## Troubleshooting

### "Cannot find module" errors

Ensure all dependencies are installed:
```bash
npm install uuid @types/uuid
```

### Slow execution

The system runs all 6 agents in parallel. If it's slow:
- Check if you're scanning large directories
- Use `excludePatterns` to skip `node_modules`, `dist`, etc.
- Consider scanning specific modules instead of entire codebase

### Too many findings

Start with specific severity:
```json
{
  "minSeverity": "high"
}
```

Or run specific agents:
```json
{
  "enabledAgents": ["security", "architecture"]
}
```

## Support

For issues or questions:
- Check the [README](./README.md)
- Review example findings in the test report
- Open an issue in the repository
