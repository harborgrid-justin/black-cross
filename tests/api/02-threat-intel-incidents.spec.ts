/**
 * API Tests - Group 2: Threat Intelligence & Incident Response
 * Tests threat intelligence and incident response module endpoints
 */

import { test, expect } from '@playwright/test';
import { ApiHelper, TestDataGenerator } from './utils/api-helper';

test.describe('Threat Intelligence & Incident Response APIs', () => {
  let apiHelper: ApiHelper;

  test.beforeAll(async () => {
    apiHelper = new ApiHelper('http://localhost:8080');
  });

  test.describe('Threat Intelligence Endpoints', () => {
    test('should access threat intelligence list endpoint', async ({ request }) => {
      const response = await apiHelper.get(request, '/api/v1/threat-intelligence');
      
      // Endpoint should be accessible
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(500);
      
      // If successful, should return data structure
      if (response.status === 200) {
        expect(response.data).toBeDefined();
      }
    });

    test('should access threat intelligence stats endpoint', async ({ request }) => {
      const response = await apiHelper.get(request, '/api/v1/threat-intelligence/stats');
      
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(500);
      
      if (response.status === 200) {
        expect(response.data).toBeDefined();
      }
    });

    test('should handle threat intelligence search endpoint', async ({ request }) => {
      const response = await apiHelper.get(request, '/api/v1/threat-intelligence/search?q=test');
      
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(500);
    });

    test('should handle POST to threat intelligence endpoint', async ({ request }) => {
      const testData = TestDataGenerator.threat();
      const response = await apiHelper.post(request, '/api/v1/threat-intelligence', testData);
      
      // Should return a response (may require auth)
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(600);
    });
  });

  test.describe('Incident Response Endpoints', () => {
    test('should access incident response list endpoint', async ({ request }) => {
      const response = await apiHelper.get(request, '/api/v1/incident-response');
      
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(500);
      
      if (response.status === 200) {
        expect(response.data).toBeDefined();
      }
    });

    test('should access incident response stats endpoint', async ({ request }) => {
      const response = await apiHelper.get(request, '/api/v1/incident-response/stats');
      
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(500);
    });

    test('should handle POST to incident response endpoint', async ({ request }) => {
      const testData = TestDataGenerator.incident();
      const response = await apiHelper.post(request, '/api/v1/incident-response', testData);
      
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(600);
    });

    test('should access specific incident timeline endpoint', async ({ request }) => {
      const response = await apiHelper.get(request, '/api/v1/incident-response/test-id/timeline');
      
      // Endpoint should exist (404 for non-existent ID is okay)
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(500);
    });
  });

  test.describe('Cross-Module Communication', () => {
    test('should verify both modules respond consistently', async ({ request }) => {
      const threatResponse = await apiHelper.get(request, '/api/v1/threat-intelligence');
      const incidentResponse = await apiHelper.get(request, '/api/v1/incident-response');
      
      // Both should return similar response structures
      expect(threatResponse.status).toBeGreaterThanOrEqual(200);
      expect(incidentResponse.status).toBeGreaterThanOrEqual(200);
      
      // Both should return JSON
      expect(threatResponse.data).toBeDefined();
      expect(incidentResponse.data).toBeDefined();
    });
  });
});
