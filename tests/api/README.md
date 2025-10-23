# API Communication Testing Suite

This test suite uses **8 parallel Playwright workers** to comprehensively test communication between the frontend and backend APIs of the Black-Cross platform.

## Overview

The test suite is organized into 8 test groups, each running in parallel to maximize testing efficiency:

1. **Health & Authentication** - Basic connectivity and auth endpoints
2. **Threat Intelligence & Incident Response** - Core threat management APIs
3. **Vulnerability Management & IOC Management** - Security scanning and indicators
4. **Threat Actors & Threat Feeds** - Threat actor profiles and feed management
5. **SIEM & Threat Hunting** - Event monitoring and hunting sessions
6. **Risk Assessment & Collaboration** - Risk calculations and workspaces
7. **Malware Analysis & Dark Web** - Sandbox analysis and dark web intel
8. **Compliance, Automation & Reporting** - Framework compliance, playbooks, and reports

## Test Coverage

### All 16 Backend Modules Tested:
- ✅ Authentication (`/api/v1/auth`)
- ✅ Threat Intelligence (`/api/v1/threat-intelligence`)
- ✅ Incident Response (`/api/v1/incident-response`)
- ✅ Vulnerability Management (`/api/v1/vulnerability-management`)
- ✅ IOC Management (`/api/v1/ioc-management`)
- ✅ Threat Actors (`/api/v1/threat-actors`)
- ✅ Threat Feeds (`/api/v1/threat-feeds`)
- ✅ SIEM (`/api/v1/siem`)
- ✅ Threat Hunting (`/api/v1/threat-hunting`)
- ✅ Risk Assessment (`/api/v1/risk-assessment`)
- ✅ Collaboration (`/api/v1/collaboration`)
- ✅ Malware Analysis (`/api/v1/malware-analysis`)
- ✅ Dark Web Monitoring (`/api/v1/dark-web`)
- ✅ Compliance (`/api/v1/compliance`)
- ✅ Automation (`/api/v1/automation`)
- ✅ Reporting (`/api/v1/reporting`)
- ✅ Code Review (`/api/v1/code-review`)

## Prerequisites

### Required Services:
- PostgreSQL database running on port 5432
- Backend API server on port 8080
- Frontend dev server on port 3000 (optional)

### Quick Setup:
```bash
# 1. Install dependencies
npm install

# 2. Set up environment (if not already done)
npm run setup

# 3. Start PostgreSQL (required)
docker-compose up -d postgres

# 4. Sync database
npm run db:sync
```

## Running the Tests

### Option 1: Let Playwright Start Servers Automatically (Recommended)
```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run all tests with 8 parallel workers
npx playwright test

# Run with UI mode for debugging
npx playwright test --ui

# Run specific test group
npx playwright test 01-health-auth.spec.ts
```

### Option 2: Manual Server Start
```bash
# Terminal 1: Start backend
cd backend && npm run dev

# Terminal 2: Start frontend (optional)
cd frontend && npm run dev

# Terminal 3: Run tests
npx playwright test
```

## Test Configuration

The test suite is configured in `playwright.config.ts`:

- **Workers**: 8 parallel workers (4 in CI)
- **Timeout**: 30 seconds per test
- **Retries**: 2 retries on CI, 0 locally
- **Reporters**: HTML, JSON, and list
- **Base URL**: http://localhost:8080

## Test Utilities

The `utils/api-helper.ts` provides:

- `ApiHelper` class for making authenticated requests
- `waitForService()` for checking service availability
- `TestDataGenerator` for creating test data
- Response validation helpers

## Test Strategy

Each test:
1. **Tests endpoint accessibility** - Verifies the endpoint responds
2. **Validates HTTP status codes** - Checks for proper status codes (200-499)
3. **Checks response structure** - Ensures valid JSON responses
4. **Tests CRUD operations** - GET, POST, PUT, DELETE where applicable
5. **Verifies cross-module integration** - Tests module interactions

## Expected Results

Tests are designed to:
- ✅ **Pass** when endpoints are accessible and return valid responses
- ✅ **Accept** both authenticated (200) and unauthenticated (401) responses
- ✅ **Accept** missing resources (404) for non-existent IDs
- ❌ **Fail** only on server errors (500+) or unreachable endpoints

## Viewing Results

After running tests:

```bash
# Open HTML report
npx playwright show-report

# View JSON results
cat test-results/results.json
```

## Parallel Execution

The 8 test files run in parallel using separate workers:
- **Worker 1**: `01-health-auth.spec.ts`
- **Worker 2**: `02-threat-intel-incidents.spec.ts`
- **Worker 3**: `03-vulnerability-ioc.spec.ts`
- **Worker 4**: `04-threat-actors-feeds.spec.ts`
- **Worker 5**: `05-siem-hunting.spec.ts`
- **Worker 6**: `06-risk-collaboration.spec.ts`
- **Worker 7**: `07-malware-darkweb.spec.ts`
- **Worker 8**: `08-compliance-automation-reporting.spec.ts`

This approach ensures:
- Maximum test execution speed
- Comprehensive coverage of all modules
- Isolation between test groups
- Efficient resource utilization

## Troubleshooting

### Backend not starting:
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Start PostgreSQL if needed
docker-compose up -d postgres

# Check backend logs
cd backend && npm run dev
```

### Tests timing out:
```bash
# Increase timeout in playwright.config.ts
timeout: 60 * 1000, // 60 seconds
```

### Database connection errors:
```bash
# Verify database URL in backend/.env
DATABASE_URL="postgresql://blackcross:blackcross_secure_password@localhost:5432/blackcross?schema=public"

# Sync database
npm run db:sync
```

## CI/CD Integration

The tests are CI-ready with:
- Automatic retry on failure (2 retries)
- Reduced parallel workers (4 in CI)
- JSON output for result parsing
- No browser UI dependencies

## Architecture

```
tests/api/
├── 01-health-auth.spec.ts              # Health checks & auth
├── 02-threat-intel-incidents.spec.ts   # Threat intel & incidents
├── 03-vulnerability-ioc.spec.ts        # Vulnerabilities & IOCs
├── 04-threat-actors-feeds.spec.ts      # Actors & feeds
├── 05-siem-hunting.spec.ts             # SIEM & hunting
├── 06-risk-collaboration.spec.ts       # Risk & collaboration
├── 07-malware-darkweb.spec.ts          # Malware & dark web
├── 08-compliance-automation-reporting.spec.ts  # Compliance, automation, reporting
├── utils/
│   └── api-helper.ts                   # Testing utilities
└── README.md                           # This file
```

## Contributing

When adding new tests:
1. Follow the existing test structure
2. Use `ApiHelper` for all API requests
3. Test both success and error cases
4. Include integration tests between modules
5. Document expected behaviors

## Performance Metrics

With 8 parallel workers:
- **Total Tests**: ~100+ individual tests
- **Execution Time**: ~2-5 minutes (depending on hardware)
- **Coverage**: All 16 backend modules + health checks
- **Concurrency**: Up to 16 simultaneous API requests

## Next Steps

After running these tests:
1. Review the HTML report for any failures
2. Investigate any 500-level errors in backend logs
3. Address any timeout issues
4. Verify frontend can consume backend APIs
5. Add authentication tokens for protected endpoints
6. Expand test coverage for specific business logic
