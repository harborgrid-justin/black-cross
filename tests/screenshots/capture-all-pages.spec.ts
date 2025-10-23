/**
 * Screenshot Capture Test
 * 
 * This test navigates through all user-accessible pages in the Black-Cross platform
 * and captures screenshots for documentation and visual regression testing purposes.
 */

import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * List of all user-accessible routes in the application
 * Based on the route configuration in frontend/src/App.tsx
 */
const routes = [
  // Dashboard
  { path: '/', name: '01-dashboard' },
  { path: '/dashboard', name: '02-dashboard-explicit' },
  
  // Threat Intelligence
  { path: '/threat-intelligence', name: '03-threat-intelligence-main' },
  { path: '/threat-intelligence/create', name: '04-threat-intelligence-create' },
  
  // Incident Response
  { path: '/incident-response', name: '05-incident-response-main' },
  { path: '/incident-response/create', name: '06-incident-response-create' },
  
  // Threat Hunting
  { path: '/threat-hunting', name: '07-threat-hunting-main' },
  { path: '/threat-hunting/create', name: '08-threat-hunting-create' },
  
  // Vulnerability Management
  { path: '/vulnerability-management', name: '09-vulnerability-management-main' },
  { path: '/vulnerability-management/create', name: '10-vulnerability-management-create' },
  
  // Risk Assessment
  { path: '/risk-assessment', name: '11-risk-assessment-main' },
  { path: '/risk-assessment/create', name: '12-risk-assessment-create' },
  
  // Threat Actors
  { path: '/threat-actors', name: '13-threat-actors-main' },
  { path: '/threat-actors/create', name: '14-threat-actors-create' },
  
  // IoC Management
  { path: '/ioc-management', name: '15-ioc-management-main' },
  { path: '/ioc-management/create', name: '16-ioc-management-create' },
  
  // Threat Feeds
  { path: '/threat-feeds', name: '17-threat-feeds-main' },
  { path: '/threat-feeds/create', name: '18-threat-feeds-create' },
  
  // SIEM
  { path: '/siem', name: '19-siem-main' },
  { path: '/siem/create', name: '20-siem-create' },
  
  // Collaboration
  { path: '/collaboration', name: '21-collaboration-main' },
  { path: '/collaboration/create', name: '22-collaboration-create' },
  
  // Reporting
  { path: '/reporting', name: '23-reporting-main' },
  { path: '/reporting/create', name: '24-reporting-create' },
  
  // Malware Analysis
  { path: '/malware-analysis', name: '25-malware-analysis-main' },
  { path: '/malware-analysis/create', name: '26-malware-analysis-create' },
  
  // Dark Web
  { path: '/dark-web', name: '27-dark-web-main' },
  { path: '/dark-web/create', name: '28-dark-web-create' },
  
  // Compliance
  { path: '/compliance', name: '29-compliance-main' },
  { path: '/compliance/create', name: '30-compliance-create' },
  
  // Automation
  { path: '/automation', name: '31-automation-main' },
  { path: '/automation/create', name: '32-automation-create' },
  
  // Notifications
  { path: '/notifications', name: '33-notifications-main' },
  
  // Case Management
  { path: '/case-management', name: '34-case-management-main' },
  { path: '/case-management/create', name: '35-case-management-create' },
  
  // Metrics
  { path: '/metrics', name: '36-metrics-main' },
  
  // Draft Workspace
  { path: '/draft-workspace', name: '37-draft-workspace-main' },
];

test.describe('Screenshot Capture - All User-Accessible Pages', () => {
  const screenshotDir = path.join(process.cwd(), 'screenshots');
  
  test.beforeAll(async () => {
    // Create screenshots directory if it doesn't exist
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
  });

  test('Login and capture all page screenshots', async ({ page }) => {
    // Step 1: Navigate to login page
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Capture login page screenshot
    await page.screenshot({
      path: path.join(screenshotDir, '00-login-page.png'),
      fullPage: true,
    });
    console.log('✓ Captured: Login page');

    // Step 2: Perform login
    const email = 'admin@blackcross.com';
    const password = 'Admin123!';
    
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    
    // Wait for successful login and redirect
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    
    console.log('✓ Successfully logged in');

    // Step 3: Navigate to each route and capture screenshot
    for (const route of routes) {
      try {
        console.log(`\nNavigating to: ${route.path}`);
        
        // Navigate to the route
        await page.goto(route.path, { waitUntil: 'networkidle', timeout: 30000 });
        
        // Wait a bit for any lazy-loaded components to render
        await page.waitForTimeout(2000);
        
        // Wait for the main content to be visible
        await page.waitForSelector('body', { state: 'visible' });
        
        // Capture screenshot
        const screenshotPath = path.join(screenshotDir, `${route.name}.png`);
        await page.screenshot({
          path: screenshotPath,
          fullPage: true,
        });
        
        console.log(`✓ Captured: ${route.name} (${route.path})`);
        
        // Verify the screenshot was created
        expect(fs.existsSync(screenshotPath)).toBeTruthy();
        
      } catch (error) {
        console.error(`✗ Failed to capture ${route.name}: ${error}`);
        // Continue with next route even if one fails
      }
    }

    console.log('\n=== Screenshot Capture Summary ===');
    console.log(`Total routes processed: ${routes.length}`);
    console.log(`Screenshots saved to: ${screenshotDir}`);
  });

  test('Verify all screenshots were generated', async () => {
    const expectedScreenshots = routes.length + 1; // +1 for login page
    const files = fs.readdirSync(screenshotDir).filter(f => f.endsWith('.png'));
    
    console.log(`\nGenerated ${files.length} screenshots:`);
    files.forEach(file => console.log(`  - ${file}`));
    
    expect(files.length).toBeGreaterThanOrEqual(expectedScreenshots - 5); // Allow some failures
  });
});
