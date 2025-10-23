# Black-Cross Screenshot Capture Guide

This guide explains how to use the screenshot capture tools to generate visual documentation of all user-accessible pages in the Black-Cross platform.

## Overview

The screenshot capture tool provides two ways to capture screenshots:

1. **Standalone Script** (`scripts/capture-screenshots.ts`) - Simpler, direct execution
2. **Playwright Tests** (`tests/screenshots/`) - Full test framework with reporting

Both methods capture screenshots of all 37 user-accessible pages across 20 security modules, plus the login page (38 total screenshots).

## Prerequisites

### Required Services

1. **PostgreSQL Database**
   ```bash
   docker compose up -d postgres
   ```

2. **Backend Server** (must be running on port 8080)
   ```bash
   cd backend
   npm run dev
   ```

3. **Frontend Server** (must be running on port 3000)
   ```bash
   cd frontend
   npm run dev
   ```

### Admin User Setup

The screenshot tool requires an admin user for authentication:

- **Email**: `admin@blackcross.com`
- **Password**: `Admin123!`

To create the admin user:

```bash
cd backend
npm run create-admin
```

## Method 1: Standalone Script (Recommended)

The standalone script is the simplest way to capture screenshots.

### Quick Start

```bash
# From project root
npm run capture-screenshots
```

### Features

- ✅ Simple command-line execution
- ✅ Real-time progress display
- ✅ Automatic error handling
- ✅ Summary report with success/failure counts
- ✅ No test framework overhead

### Output

Screenshots are saved to the `screenshots/` directory:

```
screenshots/
├── 00-login-page.png
├── 01-dashboard.png
├── 02-dashboard-explicit.png
├── 03-threat-intelligence-main.png
├── 04-threat-intelligence-create.png
├── ...
└── 37-draft-workspace-main.png
```

### Customization

Environment variables can be used to customize behavior:

```bash
# Use custom URLs and credentials
FRONTEND_URL=http://localhost:3000 \
ADMIN_EMAIL=admin@example.com \
ADMIN_PASSWORD=MyPassword \
npm run capture-screenshots
```

## Method 2: Playwright Tests

The Playwright test method provides full test framework capabilities.

### Run Tests

```bash
# Headless mode (default)
npm run screenshots

# With visible browser (for debugging)
npm run screenshots:headed
```

### Features

- ✅ Full Playwright test framework
- ✅ HTML test reports
- ✅ Video recording on failures
- ✅ Test trace collection
- ✅ Parallel execution support

### Test Reports

After running, view the HTML report:

```bash
npx playwright show-report playwright-report-ui
```

## Pages Captured

The tool captures screenshots of all major modules:

### Core Security Modules

1. **Dashboard** - Main application dashboard
2. **Threat Intelligence** - Threat data management and analysis
3. **Incident Response** - Security incident tracking and response
4. **Threat Hunting** - Proactive threat hunting sessions
5. **Vulnerability Management** - Vulnerability tracking and remediation

### Asset & Risk Management

6. **Risk Assessment** - Security risk evaluation and scoring
7. **IoC Management** - Indicators of Compromise tracking
8. **Threat Actors** - Threat actor profiles and TTPs

### Intelligence & Feeds

9. **Threat Feeds** - External threat intelligence feeds
10. **Dark Web** - Dark web monitoring and intelligence
11. **Malware Analysis** - Malware sandbox analysis

### Operations & Compliance

12. **SIEM** - Security Information and Event Management
13. **Compliance** - Compliance framework management
14. **Automation** - Security automation playbooks

### Collaboration & Reporting

15. **Collaboration** - Team collaboration workspaces
16. **Reporting** - Analytics and report generation
17. **Case Management** - Security case tracking
18. **Notifications** - Alert and notification management

### Additional Features

19. **Metrics** - Performance and security metrics
20. **Draft Workspace** - Draft content workspace

For each module (where applicable), screenshots include:
- Main listing/dashboard page
- Create/new item page

## Screenshot Specifications

- **Resolution**: 1920x1080 (Full HD)
- **Format**: PNG
- **Type**: Full page (captures entire scrollable content)
- **Browser**: Chromium (Chrome/Edge)

## Troubleshooting

### Backend Not Running

**Error**: Connection refused or timeout errors

**Solution**: 
```bash
# Ensure backend is running
cd backend
npm run dev

# Check backend health
curl http://localhost:8080/health
```

### Frontend Not Running

**Error**: Cannot navigate to pages

**Solution**:
```bash
# Ensure frontend is running
cd frontend
npm run dev

# Verify frontend is accessible
curl http://localhost:3000
```

### Login Fails

**Error**: "Login failed" or timeout during authentication

**Solution**:
1. Verify admin user exists:
   ```bash
   cd backend
   npm run create-admin
   ```

2. Check credentials in the script match database

3. Verify backend authentication is working:
   ```bash
   curl -X POST http://localhost:8080/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@blackcross.com","password":"Admin123!"}'
   ```

### Some Pages Don't Load

**Error**: Blank screenshots or timeout errors

**Solution**:
1. Check browser console for JavaScript errors
2. Verify route exists in `frontend/src/App.tsx`
3. Ensure lazy-loaded modules are building correctly
4. Increase timeout in configuration if pages load slowly

### Playwright Not Installed

**Error**: "Playwright is not installed"

**Solution**:
```bash
# Install Playwright browsers
npx playwright install chromium
```

### TypeScript Compilation Errors

**Error**: TypeScript errors during execution

**Solution**:
```bash
# Use the standalone script instead
npm run capture-screenshots

# Or install ts-node if missing
npm install -D ts-node
```

## Advanced Usage

### Capture Specific Module Only

Edit `scripts/capture-screenshots.ts` or `tests/screenshots/capture-all-pages.spec.ts` and filter the `routes` array:

```typescript
const routes = [
  { path: '/threat-intelligence', name: '03-threat-intelligence-main' },
  { path: '/threat-intelligence/create', name: '04-threat-intelligence-create' },
  // Add only the routes you want
];
```

### Custom Screenshot Directory

Modify the `SCREENSHOT_DIR` constant:

```typescript
const SCREENSHOT_DIR = path.join(process.cwd(), 'my-screenshots');
```

### Add New Routes

To capture screenshots of new pages:

1. Open the script file
2. Add new route entries:
   ```typescript
   { path: '/new-feature', name: '38-new-feature-main' },
   { path: '/new-feature/create', name: '39-new-feature-create' },
   ```
3. Run the capture again

### Headless vs Headed Mode

**Headless (default)**: Faster, no GUI
```bash
npm run capture-screenshots
```

**Headed**: See browser in action (debugging)
```typescript
// In scripts/capture-screenshots.ts
browser = await chromium.launch({
  headless: false,  // Change to false
});
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Capture Screenshots

on:
  workflow_dispatch:
  schedule:
    - cron: '0 0 * * 0'  # Weekly on Sunday

jobs:
  screenshots:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm install
        
      - name: Start services
        run: |
          docker compose up -d postgres
          cd backend && npm run dev &
          cd frontend && npm run dev &
          sleep 30
          
      - name: Capture screenshots
        run: npm run capture-screenshots
        
      - name: Upload screenshots
        uses: actions/upload-artifact@v3
        with:
          name: platform-screenshots
          path: screenshots/
          retention-days: 30
```

## Best Practices

1. **Run during off-peak hours** - Screenshot capture is resource-intensive
2. **Keep servers running** - Don't restart services during capture
3. **Use consistent data** - Seed database with consistent test data for reproducible screenshots
4. **Archive regularly** - Save screenshots for version comparison
5. **Automate weekly** - Schedule weekly captures to track UI changes

## Screenshot Use Cases

- **Documentation**: Visual guides for user manuals
- **Training**: Onboarding materials for new users
- **Visual Regression**: Compare UI changes between versions
- **Stakeholder Reviews**: Share UI progress with stakeholders
- **Bug Reports**: Attach current UI state to bug tickets
- **Compliance**: Document UI for audit trails

## Notes

- Screenshots are gitignored by default (in `/screenshots/`)
- Full-page rendering captures scrollable content
- Each screenshot takes 2-3 seconds to capture
- Total capture time: ~3-5 minutes for all pages
- Screenshots are timestamped in Playwright reports

## Support

If you encounter issues:

1. Check this guide's Troubleshooting section
2. Review logs in `playwright-report-ui/`
3. Test individual routes manually
4. Verify all prerequisites are met
5. Check the project's main README.md

## Related Documentation

- [CLAUDE.md](./CLAUDE.md) - Project development guide
- [README.md](./README.md) - Main project documentation
- [tests/screenshots/README.md](./tests/screenshots/README.md) - Test-specific documentation
- [Playwright Documentation](https://playwright.dev/) - Official Playwright docs
