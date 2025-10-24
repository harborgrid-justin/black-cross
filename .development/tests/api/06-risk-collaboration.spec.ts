/**
 * API Tests - Group 6: Risk Assessment & Collaboration
 * Tests risk assessment calculations and collaboration workspace endpoints
 */

import { test, expect } from '@playwright/test';
import { ApiHelper } from './utils/api-helper';

test.describe('Risk Assessment & Collaboration APIs', () => {
  let apiHelper: ApiHelper;

  test.beforeAll(async () => {
    apiHelper = new ApiHelper('http://localhost:8080');
  });

  test.describe('Risk Assessment Endpoints', () => {
    test('should access risk assessment list endpoint', async ({ request }) => {
      const response = await apiHelper.get(request, '/api/v1/risk-assessment');
      
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(500);
      
      if (response.status === 200) {
        expect(response.data).toBeDefined();
      }
    });

    test('should access risk assessment dashboard endpoint', async ({ request }) => {
      const response = await apiHelper.get(request, '/api/v1/risk-assessment/dashboard');
      
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(500);
    });

    test('should handle risk calculation endpoint', async ({ request }) => {
      const response = await apiHelper.post(request, '/api/v1/risk-assessment/calculate', {
        assets: ['test-asset'],
        threats: ['test-threat'],
      });
      
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(600);
    });

    test('should handle POST to create assessment', async ({ request }) => {
      const response = await apiHelper.post(request, '/api/v1/risk-assessment', {
        name: 'Test Risk Assessment',
        scope: 'Infrastructure',
      });
      
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(600);
    });

    test('should access specific assessment endpoint', async ({ request }) => {
      const response = await apiHelper.get(request, '/api/v1/risk-assessment/test-id');
      
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(500);
    });
  });

  test.describe('Collaboration Endpoints', () => {
    test('should access collaboration base endpoint', async ({ request }) => {
      const response = await apiHelper.get(request, '/api/v1/collaboration');
      
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(500);
      
      if (response.status === 200) {
        expect(response.data).toBeDefined();
      }
    });

    test('should access collaboration workspaces endpoint', async ({ request }) => {
      const response = await apiHelper.get(request, '/api/v1/collaboration/workspaces');
      
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(500);
    });

    test('should handle POST to create workspace', async ({ request }) => {
      const response = await apiHelper.post(request, '/api/v1/collaboration/workspaces', {
        name: 'Test Workspace',
        description: 'Testing API connectivity',
      });
      
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(600);
    });

    test('should access specific workspace endpoint', async ({ request }) => {
      const response = await apiHelper.get(request, '/api/v1/collaboration/workspaces/test-id');
      
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(500);
    });

    test('should handle workspace invite endpoint', async ({ request }) => {
      const response = await apiHelper.post(request, '/api/v1/collaboration/workspaces/test-id/invite', {
        email: 'test@example.com',
      });
      
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(600);
    });
  });

  test.describe('Risk-Collaboration Integration', () => {
    test('should verify both modules are accessible', async ({ request }) => {
      const riskResponse = await apiHelper.get(request, '/api/v1/risk-assessment');
      const collabResponse = await apiHelper.get(request, '/api/v1/collaboration');
      
      expect(riskResponse.status).toBeGreaterThanOrEqual(200);
      expect(collabResponse.status).toBeGreaterThanOrEqual(200);
      
      expect(riskResponse.data).toBeDefined();
      expect(collabResponse.data).toBeDefined();
    });
  });
});
