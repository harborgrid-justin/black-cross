# Black-Cross Cypress E2E Tests

This directory contains end-to-end tests for the Black-Cross frontend application using Cypress.

## Overview

The test suite includes 25 comprehensive test files covering:
- Authentication and authorization
- All main feature pages (15 pages)
- Layout and navigation components
- Integration tests (API, navigation)
- Search and filter functionality
- Accessibility compliance

## Test Files

### Authentication & Components (1-4)
- `01-dashboard.cy.ts` - Dashboard page tests
- `02-login.cy.ts` - Login component tests
- `03-private-route.cy.ts` - Protected route tests
- `04-layout.cy.ts` - Layout component tests

### Threat Intelligence (5-6)
- `05-threat-list.cy.ts` - Threat list page
- `06-threat-details.cy.ts` - Threat details page

### Feature Pages (7-20)
- `07-automation-playbooks.cy.ts` - Automation & Playbooks
- `08-collaboration-hub.cy.ts` - Collaboration Hub
- `09-compliance-management.cy.ts` - Compliance Management
- `10-dark-web-monitoring.cy.ts` - Dark Web Monitoring
- `11-incident-response.cy.ts` - Incident Response
- `12-ioc-management.cy.ts` - IoC Management
- `13-malware-analysis.cy.ts` - Malware Analysis
- `14-reporting-analytics.cy.ts` - Reporting & Analytics
- `15-risk-assessment.cy.ts` - Risk Assessment
- `16-siem-dashboard.cy.ts` - SIEM Dashboard
- `17-threat-actors.cy.ts` - Threat Actors
- `18-threat-feeds.cy.ts` - Threat Feeds
- `19-threat-hunting.cy.ts` - Threat Hunting
- `20-vulnerability-management.cy.ts` - Vulnerability Management

### Integration & Functional Tests (21-25)
- `21-navigation-integration.cy.ts` - Navigation flow tests
- `22-api-integration.cy.ts` - API integration tests
- `23-search-functionality.cy.ts` - Search tests
- `24-filter-sort.cy.ts` - Filter and sort tests
- `25-accessibility.cy.ts` - Accessibility tests

## Running Tests

### Interactive Mode (Recommended for Development)
```bash
# From root directory
npm run cypress

# Or from frontend directory
cd frontend
npm run cypress
```

### Headless Mode (CI/CD)
```bash
# Run all tests
npm run test:e2e

# Or from frontend directory
cd frontend
npm run cypress:headless
```

### Specific Test Files
```bash
cd frontend
npx cypress run --spec "cypress/e2e/01-dashboard.cy.ts"
```

## Prerequisites

Before running tests, ensure:
1. Frontend dev server is running: `npm run dev:frontend` (in another terminal)
2. Backend API is accessible (if testing API integration)
3. Database is seeded with test data (optional)

## Test Data

Test fixtures are located in `cypress/fixtures/`:
- `users.json` - Test user credentials
- `threats.json` - Sample threat data

## Custom Commands

Custom Cypress commands are defined in `cypress/support/commands.ts`:
- `cy.login(email, password)` - Login helper
- `cy.setAuthToken(token)` - Set auth token
- `cy.clearAuth()` - Clear authentication

## Configuration

Cypress configuration is in `cypress.config.ts`:
- Base URL: `http://localhost:3000`
- Viewport: 1280x720
- Timeouts: 10000ms
- Video recording: Enabled
- Screenshot on failure: Enabled

## Writing New Tests

Follow this pattern for new tests:

```typescript
describe('Feature Name', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      cy.login(users.validUser.email, users.validUser.password);
    });
    cy.visit('/your-route');
  });

  it('should test specific behavior', () => {
    cy.get('[data-testid="element"]').should('be.visible');
    cy.contains('Expected Text').should('exist');
  });
});
```

## Best Practices

1. **Use data-testid attributes** for selecting elements
2. **Keep tests independent** - Each test should work in isolation
3. **Use fixtures** for test data instead of hardcoding
4. **Clean up after tests** - Reset state in beforeEach/afterEach
5. **Test user behavior** - Focus on what users do, not implementation details
6. **Use meaningful descriptions** - Test names should be clear and descriptive

## Troubleshooting

### Tests failing locally
- Ensure dev server is running on port 3000
- Check that backend API is accessible
- Clear browser cache and Cypress cache: `npx cypress cache clear`

### Slow tests
- Reduce `defaultCommandTimeout` in cypress.config.ts
- Use `cy.intercept()` to mock API calls
- Skip video recording in development

### Flaky tests
- Add explicit waits: `cy.wait('@apiCall')`
- Increase timeouts for slow operations
- Use `cy.should()` with retry-ability instead of `cy.get().then()`

## CI/CD Integration

For GitHub Actions, GitLab CI, or other CI systems:

```yaml
- name: Run Cypress Tests
  run: |
    npm run dev:frontend &
    npm run test:e2e
```

## Resources

- [Cypress Documentation](https://docs.cypress.io)
- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Cypress Testing Library](https://testing-library.com/docs/cypress-testing-library/intro/)
