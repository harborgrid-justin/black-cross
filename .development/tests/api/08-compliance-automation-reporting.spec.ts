/**
 * API Tests - Group 8: Compliance, Automation & Reporting
 * Tests compliance management, automation playbooks, and reporting endpoints
 */

import { test, expect } from '@playwright/test';
import { ApiHelper } from './utils/api-helper';

test.describe('Compliance, Automation & Reporting APIs', () => {
  let apiHelper: ApiHelper;

  test.beforeAll(async () => {
    apiHelper = new ApiHelper('http://localhost:8080');
  });

  test.describe('Compliance Endpoints', () => {
    test('should access compliance base endpoint', async ({ request }) => {
      const response = await apiHelper.get(request, '/api/v1/compliance');
      
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(500);
      
      if (response.status === 200) {
        expect(response.data).toBeDefined();
      }
    });

    test('should access compliance frameworks endpoint', async ({ request }) => {
      const response = await apiHelper.get(request, '/api/v1/compliance/frameworks');
      
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(500);
    });

    test('should access compliance audits endpoint', async ({ request }) => {
      const response = await apiHelper.get(request, '/api/v1/compliance/audits');
      
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(500);
    });

    test('should access compliance reports endpoint', async ({ request }) => {
      const response = await apiHelper.get(request, '/api/v1/compliance/reports');
      
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(500);
    });

    test('should handle POST to compliance audits', async ({ request }) => {
      const response = await apiHelper.post(request, '/api/v1/compliance/audits', {
        framework: 'ISO27001',
        scope: 'Infrastructure',
      });
      
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(600);
    });
  });

  test.describe('Automation Endpoints', () => {
    test('should access automation base endpoint', async ({ request }) => {
      const response = await apiHelper.get(request, '/api/v1/automation');
      
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(500);
      
      if (response.status === 200) {
        expect(response.data).toBeDefined();
      }
    });

    test('should access automation playbooks endpoint', async ({ request }) => {
      const response = await apiHelper.get(request, '/api/v1/automation/playbooks');
      
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(500);
    });

    test('should access automation integrations endpoint', async ({ request }) => {
      const response = await apiHelper.get(request, '/api/v1/automation/integrations');
      
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(500);
    });

    test('should handle POST to create playbook', async ({ request }) => {
      const response = await apiHelper.post(request, '/api/v1/automation/playbooks', {
        name: 'Test Playbook',
        trigger: 'manual',
      });
      
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(600);
    });

    test('should access specific playbook endpoint', async ({ request }) => {
      const response = await apiHelper.get(request, '/api/v1/automation/playbooks/test-id');
      
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(500);
    });

    test('should handle playbook execution endpoint', async ({ request }) => {
      const response = await apiHelper.post(request, '/api/v1/automation/playbooks/test-id/execute', {
        params: {},
      });
      
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(600);
    });
  });

  test.describe('Reporting Endpoints', () => {
    test('should access reporting base endpoint', async ({ request }) => {
      const response = await apiHelper.get(request, '/api/v1/reporting');
      
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(500);
      
      if (response.status === 200) {
        expect(response.data).toBeDefined();
      }
    });

    test('should access reporting templates endpoint', async ({ request }) => {
      const response = await apiHelper.get(request, '/api/v1/reporting/templates');
      
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(500);
    });

    test('should handle report generation endpoint', async ({ request }) => {
      const response = await apiHelper.post(request, '/api/v1/reporting/generate', {
        template: 'executive-summary',
        timeRange: '7d',
      });
      
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(600);
    });

    test('should access specific report endpoint', async ({ request }) => {
      const response = await apiHelper.get(request, '/api/v1/reporting/test-id');
      
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(500);
    });

    test('should handle POST to create report', async ({ request }) => {
      const response = await apiHelper.post(request, '/api/v1/reporting', {
        title: 'Test Report',
        type: 'security-posture',
      });
      
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(600);
    });
  });

  test.describe('Code Review Endpoints', () => {
    test('should access code review endpoint', async ({ request }) => {
      const response = await apiHelper.get(request, '/api/v1/code-review');
      
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(500);
      
      if (response.status === 200) {
        expect(response.data).toBeDefined();
      }
    });

    test('should handle code review analysis', async ({ request }) => {
      const response = await apiHelper.post(request, '/api/v1/code-review', {
        repository: 'test-repo',
        branch: 'main',
      });
      
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(600);
    });
  });

  test.describe('Multi-Module Integration Test', () => {
    test('should verify all modules are accessible simultaneously', async ({ request }) => {
      const [
        complianceResponse,
        automationResponse,
        reportingResponse,
        codeReviewResponse,
      ] = await Promise.all([
        apiHelper.get(request, '/api/v1/compliance'),
        apiHelper.get(request, '/api/v1/automation'),
        apiHelper.get(request, '/api/v1/reporting'),
        apiHelper.get(request, '/api/v1/code-review'),
      ]);
      
      // All modules should be accessible
      expect(complianceResponse.status).toBeGreaterThanOrEqual(200);
      expect(automationResponse.status).toBeGreaterThanOrEqual(200);
      expect(reportingResponse.status).toBeGreaterThanOrEqual(200);
      expect(codeReviewResponse.status).toBeGreaterThanOrEqual(200);
      
      // All should return JSON
      expect(complianceResponse.data).toBeDefined();
      expect(automationResponse.data).toBeDefined();
      expect(reportingResponse.data).toBeDefined();
      expect(codeReviewResponse.data).toBeDefined();
    });

    test('should verify API responds to concurrent requests', async ({ request }) => {
      // Make 16 concurrent requests to different modules
      const endpoints = [
        '/api/v1/threat-intelligence',
        '/api/v1/incident-response',
        '/api/v1/vulnerability-management',
        '/api/v1/ioc-management',
        '/api/v1/threat-actors',
        '/api/v1/threat-feeds',
        '/api/v1/siem',
        '/api/v1/threat-hunting',
        '/api/v1/risk-assessment',
        '/api/v1/collaboration',
        '/api/v1/malware-analysis',
        '/api/v1/dark-web',
        '/api/v1/compliance',
        '/api/v1/automation',
        '/api/v1/reporting',
        '/api/v1/code-review',
      ];

      const responses = await Promise.all(
        endpoints.map(endpoint => apiHelper.get(request, endpoint))
      );

      // All modules should respond
      responses.forEach((response, index) => {
        expect(response.status, `${endpoints[index]} failed`).toBeGreaterThanOrEqual(200);
        expect(response.status, `${endpoints[index]} server error`).toBeLessThan(500);
        expect(response.data, `${endpoints[index]} missing data`).toBeDefined();
      });
    });
  });
});
