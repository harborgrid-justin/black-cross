#!/usr/bin/env ts-node
/**
 * Standalone Screenshot Capture Script
 * 
 * This script captures screenshots of all user-accessible pages in the Black-Cross platform.
 * It can be run independently without needing the test framework.
 * 
 * Usage:
 *   ts-node scripts/capture-screenshots.ts
 *   OR
 *   npm run capture-screenshots
 */

import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

// Configuration
const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const SCREENSHOT_DIR = path.join(process.cwd(), 'screenshots');
const LOGIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@blackcross.com';
const LOGIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin123!';

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

async function captureScreenshots() {
  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    console.log('🚀 Starting screenshot capture process...\n');
    
    // Create screenshots directory
    if (!fs.existsSync(SCREENSHOT_DIR)) {
      fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
      console.log(`✓ Created screenshots directory: ${SCREENSHOT_DIR}\n`);
    }

    // Launch browser
    console.log('🌐 Launching browser...');
    browser = await chromium.launch({
      headless: true,
    });
    
    page = await browser.newPage({
      viewport: { width: 1920, height: 1080 },
    });

    // Step 1: Navigate to login page and capture it
    console.log('\n📸 Capturing login page...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '00-login-page.png'),
      fullPage: true,
    });
    console.log('✓ Captured: 00-login-page.png');

    // Step 2: Perform login
    console.log('\n🔐 Logging in...');
    try {
      await page.fill('input[name="email"]', LOGIN_EMAIL);
      await page.fill('input[name="password"]', LOGIN_PASSWORD);
      await page.click('button[type="submit"]');
      
      // Wait for redirect after login
      await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 10000 });
      await page.waitForLoadState('networkidle');
      console.log('✓ Successfully logged in');
    } catch (error) {
      console.error('✗ Login failed:', error);
      console.error('Make sure the backend is running and admin user exists');
      return;
    }

    // Step 3: Capture all routes
    console.log('\n📸 Capturing all pages...\n');
    let successCount = 0;
    let failCount = 0;

    for (const route of routes) {
      try {
        process.stdout.write(`  ${route.name.padEnd(45)} ... `);
        
        // Navigate to the route
        await page.goto(`${BASE_URL}${route.path}`, { 
          waitUntil: 'networkidle',
          timeout: 30000 
        });
        
        // Wait for content to render
        await page.waitForTimeout(2000);
        
        // Capture screenshot
        const screenshotPath = path.join(SCREENSHOT_DIR, `${route.name}.png`);
        await page.screenshot({
          path: screenshotPath,
          fullPage: true,
        });
        
        console.log('✓');
        successCount++;
        
      } catch (error) {
        console.log(`✗ (${error instanceof Error ? error.message : 'unknown error'})`);
        failCount++;
      }
    }

    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 Screenshot Capture Summary');
    console.log('='.repeat(70));
    console.log(`✓ Successfully captured: ${successCount + 1} screenshots (including login)`);
    console.log(`✗ Failed: ${failCount} screenshots`);
    console.log(`📁 Screenshots saved to: ${SCREENSHOT_DIR}`);
    console.log('='.repeat(70) + '\n');

  } catch (error) {
    console.error('\n❌ Error during screenshot capture:', error);
    throw error;
  } finally {
    // Cleanup
    if (page) await page.close();
    if (browser) await browser.close();
  }
}

// Run the script
if (require.main === module) {
  captureScreenshots()
    .then(() => {
      console.log('✅ Screenshot capture completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Screenshot capture failed:', error);
      process.exit(1);
    });
}

export { captureScreenshots };
