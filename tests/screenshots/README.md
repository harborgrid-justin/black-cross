# Screenshot Capture Tests

This directory contains Playwright tests for capturing screenshots of all user-accessible pages in the Black-Cross platform.

## Overview

The screenshot capture tool automatically navigates through all routes defined in the application and captures full-page screenshots. This is useful for:

- Visual documentation
- Visual regression testing
- UI reviews and audits
- Onboarding and training materials

## Prerequisites

Before running the screenshot capture:

1. **Database**: Ensure PostgreSQL is running and accessible
   ```bash
   docker-compose up -d postgres
   ```

2. **Backend**: The backend server must be running
   ```bash
   cd backend
   npm run dev
   ```

3. **Frontend**: The frontend dev server must be running
   ```bash
   cd frontend
   npm run dev
   ```

4. **Admin User**: Ensure an admin user exists with credentials:
   - Email: `admin@blackcross.com`
   - Password: `Admin123!`
   
   You can create this user by running:
   ```bash
   cd backend
   npm run create-admin
   ```

## Usage

### Basic Screenshot Capture

Run the screenshot capture from the root directory:

```bash
npm run screenshots
```

This will:
1. Start the backend and frontend servers (if not already running)
2. Log in as the admin user
3. Navigate through all user-accessible pages
4. Capture full-page screenshots
5. Save screenshots to the `screenshots/` directory

### View Screenshots in Browser

Run with headed mode to see the browser in action:

```bash
npm run screenshots:headed
```

### Manual Execution

You can also run the Playwright tests directly:

```bash
# Run with the UI config
npx playwright test --config=playwright-ui.config.ts

# Run with headed browser
npx playwright test --config=playwright-ui.config.ts --headed

# Run specific test file
npx playwright test tests/screenshots/capture-all-pages.spec.ts --config=playwright-ui.config.ts
```

## Output

Screenshots are saved to the `screenshots/` directory in the project root with descriptive filenames:

- `00-login-page.png` - Login page
- `01-dashboard.png` - Main dashboard
- `02-dashboard-explicit.png` - Dashboard (explicit route)
- `03-threat-intelligence-main.png` - Threat Intelligence main page
- `04-threat-intelligence-create.png` - Threat Intelligence create page
- ... and so on for all modules

## Pages Captured

The tool captures screenshots of the following modules:

1. **Dashboard** - Main application dashboard
2. **Threat Intelligence** - Threat data management
3. **Incident Response** - Incident tracking and response
4. **Threat Hunting** - Proactive threat hunting
5. **Vulnerability Management** - Vulnerability tracking
6. **Risk Assessment** - Security risk evaluation
7. **Threat Actors** - Threat actor profiles
8. **IoC Management** - Indicators of Compromise
9. **Threat Feeds** - External threat feed integration
10. **SIEM** - Security Information and Event Management
11. **Collaboration** - Team collaboration workspaces
12. **Reporting** - Report generation and analytics
13. **Malware Analysis** - Malware sandbox analysis
14. **Dark Web** - Dark web monitoring
15. **Compliance** - Compliance framework management
16. **Automation** - Security automation playbooks
17. **Notifications** - Alert and notification management
18. **Case Management** - Security case tracking
19. **Metrics** - Performance and security metrics
20. **Draft Workspace** - Draft content workspace

For each module, the tool captures:
- Main listing/dashboard page
- Create/new item page (where applicable)

## Configuration

The screenshot capture is configured via `playwright-ui.config.ts`:

- **Viewport**: 1920x1080 (Full HD)
- **Full Page**: Yes (captures entire scrollable area)
- **Workers**: 1 (sequential execution for consistency)
- **Browser**: Chromium (Chrome/Edge)

## Troubleshooting

### Screenshots are blank or incomplete

- Ensure both backend and frontend servers are fully running
- Check that the admin user exists and credentials are correct
- Increase wait times in the test if pages load slowly

### Login fails

- Verify the admin user exists with the correct credentials
- Check backend logs for authentication errors
- Ensure the database is accessible and contains user data

### Some pages don't load

- Check browser console for JavaScript errors
- Verify all route modules are properly implemented
- Check that lazy-loaded components are resolving correctly

### Performance issues

- Close other applications to free up resources
- Run with `--workers=1` to avoid resource contention
- Increase timeout values if pages are slow to load

## Adding New Routes

To capture screenshots of new routes:

1. Open `tests/screenshots/capture-all-pages.spec.ts`
2. Add new route entries to the `routes` array:
   ```typescript
   { path: '/new-module', name: '38-new-module-main' },
   { path: '/new-module/create', name: '39-new-module-create' },
   ```
3. Run the screenshot capture again

## CI/CD Integration

To integrate screenshot capture in CI/CD pipelines:

```yaml
- name: Capture Screenshots
  run: |
    npm run docker:up
    npm run db:sync
    npm run screenshots
    
- name: Upload Screenshots
  uses: actions/upload-artifact@v3
  with:
    name: screenshots
    path: screenshots/
```

## Notes

- Screenshots are captured with full-page rendering (entire scrollable content)
- The tool handles authentication automatically
- Failed screenshot captures are logged but don't stop the entire process
- Screenshots are saved as PNG files for best quality
- The `screenshots/` directory is gitignored by default
