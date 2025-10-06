# Cypress Testing Quick Start Guide

## Prerequisites

Ensure you have Node.js and npm installed, and all dependencies are installed:

```bash
cd frontend
npm install
```

## Running Tests

### 1. Interactive Mode (Recommended for Development)

Open the Cypress Test Runner with a UI to select and run tests:

```bash
# From root directory
npm run cypress

# Or from frontend directory
cd frontend
npm run cypress
```

This will:
- Open the Cypress Test Runner UI
- Allow you to select individual test files
- Show real-time test execution
- Provide debugging capabilities

### 2. Headless Mode (CI/CD)

Run all tests in the terminal without UI:

```bash
# From root directory
npm run test:e2e

# Or from frontend directory
cd frontend
npm run cypress:headless
```

### 3. Run Specific Test File

```bash
cd frontend
npx cypress run --spec "cypress/e2e/01-dashboard.cy.ts"
```

### 4. Run Tests in Specific Browser

```bash
cd frontend
npx cypress run --browser chrome
npx cypress run --browser firefox
npx cypress run --browser edge
```

## Before Running Tests

**Important**: The frontend dev server must be running on port 3000.

In one terminal:
```bash
npm run dev:frontend
```

In another terminal:
```bash
npm run cypress
```

## Test Files Overview

All test files are located in `frontend/cypress/e2e/`:

### Core Tests (1-4)
- `01-dashboard.cy.ts` - Dashboard functionality
- `02-login.cy.ts` - Login authentication
- `03-private-route.cy.ts` - Route protection
- `04-layout.cy.ts` - Layout and navigation

### Feature Tests (5-20)
- Tests for all 16 feature pages (threats, incidents, vulnerabilities, etc.)

### Integration Tests (21-25)
- Navigation, API integration, search, filtering, accessibility

## Common Commands

```bash
# Run all tests
npm run test:e2e

# Open test runner
npm run cypress

# Run with video recording
npm run cypress:headless

# Check Cypress version
npx cypress --version

# Verify Cypress installation
npx cypress verify
```

## Test Results

After running tests:
- **Videos**: Saved in `cypress/videos/`
- **Screenshots**: Saved in `cypress/screenshots/` (on failure)
- **Reports**: Displayed in terminal

## Debugging Tips

1. **Use .only() to run single test**:
   ```typescript
   it.only('should test something', () => {
     // This test runs alone
   });
   ```

2. **Use .skip() to skip tests**:
   ```typescript
   it.skip('should test something', () => {
     // This test is skipped
   });
   ```

3. **Add cy.pause() for debugging**:
   ```typescript
   cy.visit('/');
   cy.pause(); // Pauses execution
   cy.get('button').click();
   ```

## Troubleshooting

### Server not running
**Error**: "cy.visit() failed trying to load http://localhost:3000"

**Solution**: Start the dev server:
```bash
npm run dev:frontend
```

### Tests failing
1. Check if backend API is accessible
2. Clear browser cache: `npx cypress cache clear`
3. Delete node_modules and reinstall: `npm install`

### Slow tests
- Use `cy.intercept()` to mock API calls
- Disable video recording in cypress.config.ts

## CI/CD Integration Example

```yaml
# GitHub Actions
- name: Install dependencies
  run: npm install

- name: Start frontend
  run: npm run dev:frontend &

- name: Wait for server
  run: npx wait-on http://localhost:3000

- name: Run Cypress tests
  run: npm run test:e2e
```

## Need Help?

- Check `frontend/cypress/README.md` for detailed documentation
- See `CYPRESS_TESTING_SUMMARY.md` for complete implementation details
- Visit [Cypress Documentation](https://docs.cypress.io)

## Test Coverage

✅ **25 test files**  
✅ **100% page coverage** (17/17 pages)  
✅ **100% component coverage** (3/3 components)  
✅ **Integration & accessibility tests included**
