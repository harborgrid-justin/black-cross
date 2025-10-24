# Quick Start Guide: Parallel API Testing

This guide provides a quick way to run the 8-agent parallel API testing suite.

## Prerequisites

```bash
# Ensure you have Node.js 16+ and npm 7+ installed
node --version
npm --version
```

## Installation

```bash
# Install all dependencies (run from repository root)
npm install

# Install Playwright browsers
npx playwright install chromium
```

## Running Tests

### Option 1: Using Mock Server (Recommended for Quick Testing)

```bash
# Terminal 1: Start mock backend server
npx ts-node tests/api/mock-server.ts

# Terminal 2: Run tests (in a new terminal)
npx playwright test --workers=8
```

### Option 2: Using Real Backend (Requires Setup)

```bash
# Terminal 1: Start PostgreSQL
docker compose up -d postgres

# Terminal 2: Start backend
cd backend
npm run dev

# Terminal 3: Run tests
cd ..
npx playwright test --workers=8
```

## View Results

```bash
# Open HTML report in browser
npx playwright show-report

# Or check the console output from the test run
```

## Expected Results

✅ **91 tests should pass** in approximately 3-4 seconds

```
Running 91 tests using 8 workers
...
91 passed (3.7s)
```

## Test Structure

The tests are organized into 8 files for parallel execution:

1. **01-health-auth.spec.ts** - Health checks & authentication (13 tests)
2. **02-threat-intel-incidents.spec.ts** - Threat intel & incidents (11 tests)
3. **03-vulnerability-ioc.spec.ts** - Vulnerabilities & IOCs (11 tests)
4. **04-threat-actors-feeds.spec.ts** - Threat actors & feeds (11 tests)
5. **05-siem-hunting.spec.ts** - SIEM & threat hunting (11 tests)
6. **06-risk-collaboration.spec.ts** - Risk & collaboration (11 tests)
7. **07-malware-darkweb.spec.ts** - Malware & dark web (11 tests)
8. **08-compliance-automation-reporting.spec.ts** - Compliance, automation, reporting (12 tests)

## What's Being Tested

✅ All 16 backend API modules:
- Authentication, Threat Intelligence, Incident Response
- Vulnerability Management, IOC Management, Threat Actors
- Threat Feeds, SIEM, Threat Hunting
- Risk Assessment, Collaboration, Reporting
- Malware Analysis, Dark Web, Compliance
- Automation, Code Review

✅ Communication patterns:
- HTTP GET, POST, PUT, DELETE operations
- JSON response structures
- Error handling
- Concurrent requests (16 simultaneous calls)

## Troubleshooting

### Mock server not starting
```bash
# Kill any existing process on port 8080
pkill -f "mock-server"

# Try again
npx ts-node tests/api/mock-server.ts
```

### Tests timing out
```bash
# Increase timeout in playwright.config.ts
timeout: 60 * 1000, // Change from 30 to 60 seconds
```

### Port 8080 already in use
```bash
# Find and kill the process
lsof -ti:8080 | xargs kill -9

# Or use a different port for mock server
MOCK_PORT=8081 npx ts-node tests/api/mock-server.ts
```

## Running Specific Tests

```bash
# Run only one test file
npx playwright test 01-health-auth.spec.ts

# Run tests matching a pattern
npx playwright test --grep "Health"

# Run in UI mode (interactive)
npx playwright test --ui

# Run with debug output
DEBUG=pw:api npx playwright test
```

## CI/CD Integration

The tests are CI-ready:

```yaml
# Example GitHub Actions step
- name: Run API Tests
  run: |
    npx ts-node tests/api/mock-server.ts &
    sleep 2
    npx playwright test --workers=4
```

## Performance Metrics

- **Sequential execution estimate**: ~32 seconds
- **Parallel execution (8 workers)**: 3-4 seconds
- **Speed improvement**: 87% faster

## Documentation

For more details, see:
- `tests/api/README.md` - Detailed testing documentation
- `TEST_EXECUTION_SUMMARY.md` - Complete execution report and analysis
- `playwright.config.ts` - Test configuration

## Support

If you encounter issues:
1. Check the test output for specific error messages
2. Review the HTML report: `npx playwright show-report`
3. Verify the mock server is running on port 8080
4. Check that all dependencies are installed: `npm install`

## Next Steps

After successful test execution:
1. Review the HTML report for detailed results
2. Check `TEST_EXECUTION_SUMMARY.md` for analysis
3. Integrate tests into your CI/CD pipeline
4. Expand test coverage as needed
5. Run against real backend once TypeScript issues are resolved
