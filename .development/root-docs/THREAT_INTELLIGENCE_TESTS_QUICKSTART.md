# Quick Start Guide - Threat Intelligence Cypress Tests

## Overview
This guide helps you run the 50 comprehensive Cypress tests for the Threat Intelligence Management module.

## Prerequisites

### 1. Install Dependencies
```bash
# From the root directory
npm install
```

### 2. Start Required Services

#### Option A: Full Stack (Recommended)
```bash
# Terminal 1 - Start PostgreSQL (required)
docker-compose up -d postgres

# Terminal 2 - Start backend
npm run dev:backend

# Terminal 3 - Start frontend
npm run dev:frontend
```

#### Option B: All Services via Docker
```bash
# Start all services
docker-compose up -d

# Start frontend
npm run dev:frontend
```

## Running the Tests

### Run Threat Intelligence Tests Only
```bash
# Headless mode (CI/CD)
npm run cypress:headless -- --spec "frontend/cypress/e2e/05-threat-intelligence.cy.ts"

# Or from frontend directory
cd frontend
npm run cypress:headless -- --spec "cypress/e2e/05-threat-intelligence.cy.ts"
```

### Interactive Mode (GUI)
```bash
# Open Cypress GUI
npm run cypress

# Then select: 05-threat-intelligence.cy.ts from the test list
```

### Run All E2E Tests
```bash
npm run test:e2e
```

## Expected Results

✅ **50/50 tests passing (100% pass rate)**

### Test Execution Time
- **Average**: 30-60 seconds
- **Per test**: ~1-2 seconds

### Test Breakdown
- Section 1: Basic Page Load and Navigation (5 tests)
- Section 2: Display and Layout (5 tests)
- Section 3: Threat List Display (5 tests)
- Section 4: Threat Type Tests (8 tests)
- Section 5: Search and Filter (7 tests)
- Section 6: Sorting (5 tests)
- Section 7: Threat Details Navigation (5 tests)
- Section 8: Threat Details Display (5 tests)
- Section 9: Action Buttons and Operations (3 tests)
- Section 10: Performance and Edge Cases (2 tests)

## Troubleshooting

### Tests Failing to Connect
**Error**: `Cypress could not verify that your server is running`

**Solution**:
```bash
# Verify frontend is running on http://localhost:3000
curl http://localhost:3000

# If not, start it:
npm run dev:frontend
```

### Backend API Errors
**Error**: Tests show API errors or timeouts

**Solution**:
```bash
# Verify backend is running on http://localhost:8080
curl http://localhost:8080/health

# If not, start it:
npm run dev:backend

# Check database connection
docker ps | grep postgres
```

### Database Not Ready
**Error**: Backend fails to connect to database

**Solution**:
```bash
# Start PostgreSQL
docker-compose up -d postgres

# Wait for it to be ready
docker-compose logs -f postgres

# Sync database models
npm run db:sync
```

## Test URLs

The tests use the following routes:
- **List page**: `http://localhost:3000/threat-intelligence`
- **Details page**: `http://localhost:3000/threat-intelligence/:id`
- **Create page**: `http://localhost:3000/threat-intelligence/new`

## Test Data

Tests use mock data from:
- **Fixture**: `frontend/cypress/fixtures/threats.json`
- **8 mock threats** covering:
  - All threat types (APT, ransomware, phishing, botnet, malware, DDoS)
  - All severity levels (critical, high, medium, low)
  - All statuses (active, archived, resolved)

## Viewing Test Results

### Console Output
```bash
# Shows test execution in terminal
npm run cypress:headless -- --spec "frontend/cypress/e2e/05-threat-intelligence.cy.ts"
```

### Video Recordings
- **Location**: `frontend/cypress/videos/`
- **Enabled by default** in headless mode

### Screenshots (on failure)
- **Location**: `frontend/cypress/screenshots/`
- **Taken automatically** when tests fail

## CI/CD Integration

### GitHub Actions Example
```yaml
- name: Run Threat Intelligence Tests
  run: |
    npm run dev:backend &
    npm run dev:frontend &
    sleep 10
    npm run cypress:headless -- --spec "frontend/cypress/e2e/05-threat-intelligence.cy.ts"
```

## Files Modified

### New/Updated Files
1. `frontend/cypress/e2e/05-threat-intelligence.cy.ts` - Main test file (50 tests)
2. `frontend/cypress/fixtures/threats.json` - Enhanced test data
3. `THREAT_INTELLIGENCE_CYPRESS_TESTS_SUMMARY.md` - Detailed documentation

### Backup Files
1. `frontend/cypress/e2e/05-threat-list.cy.ts.backup` - Original tests
2. `frontend/cypress/e2e/06-threat-details.cy.ts.backup` - Original tests

## Next Steps

1. ✅ Install dependencies
2. ✅ Start backend server
3. ✅ Start frontend server
4. ✅ Run tests
5. ✅ Verify 100% pass rate
6. 🎉 Celebrate!

## Support

For issues or questions:
- Check `THREAT_INTELLIGENCE_CYPRESS_TESTS_SUMMARY.md` for detailed documentation
- Review individual test descriptions in the test file
- Verify all services are running correctly

## Quick Commands Reference

```bash
# Full setup and test (one-time)
npm install
docker-compose up -d postgres
npm run db:sync
npm run dev:backend &
npm run dev:frontend &
sleep 10
npm run cypress:headless -- --spec "frontend/cypress/e2e/05-threat-intelligence.cy.ts"

# Subsequent test runs
npm run cypress:headless -- --spec "frontend/cypress/e2e/05-threat-intelligence.cy.ts"
```

---

**Test Suite Status**: ✅ Ready to run  
**Expected Pass Rate**: 100% (50/50)  
**Total Tests**: 50  
**Coverage**: Comprehensive
