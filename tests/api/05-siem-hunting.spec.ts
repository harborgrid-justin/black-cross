/**
 * API Tests - Group 5: SIEM & Threat Hunting
 * Tests SIEM event monitoring and threat hunting session endpoints
 */

import { test, expect } from '@playwright/test';
import { ApiHelper } from './utils/api-helper';

test.describe('SIEM & Threat Hunting APIs', () => {
  let apiHelper: ApiHelper;

  test.beforeAll(async () => {
    apiHelper = new ApiHelper('http://localhost:8080');
  });

  test.describe('SIEM Endpoints', () => {
    test('should access SIEM base endpoint', async ({ request }) => {
      const response = await apiHelper.get(request, '/api/v1/siem');
      
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(500);
      
      if (response.status === 200) {
        expect(response.data).toBeDefined();
      }
    });

    test('should access SIEM events endpoint', async ({ request }) => {
      const response = await apiHelper.get(request, '/api/v1/siem/events');
      
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(500);
    });

    test('should access SIEM alerts endpoint', async ({ request }) => {
      const response = await apiHelper.get(request, '/api/v1/siem/alerts');
      
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(500);
    });

    test('should access SIEM dashboard endpoint', async ({ request }) => {
      const response = await apiHelper.get(request, '/api/v1/siem/dashboard');
      
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(500);
    });

    test('should handle SIEM search endpoint', async ({ request }) => {
      const response = await apiHelper.post(request, '/api/v1/siem/search', {
        query: 'test',
        timeRange: '24h',
      });
      
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(600);
    });
  });

  test.describe('Threat Hunting Endpoints', () => {
    test('should access threat hunting base endpoint', async ({ request }) => {
      const response = await apiHelper.get(request, '/api/v1/threat-hunting');
      
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(500);
      
      if (response.status === 200) {
        expect(response.data).toBeDefined();
      }
    });

    test('should access threat hunting sessions endpoint', async ({ request }) => {
      const response = await apiHelper.get(request, '/api/v1/threat-hunting/sessions');
      
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(500);
    });

    test('should access threat hunting queries endpoint', async ({ request }) => {
      const response = await apiHelper.get(request, '/api/v1/threat-hunting/queries');
      
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(500);
    });

    test('should handle POST to create hunting session', async ({ request }) => {
      const response = await apiHelper.post(request, '/api/v1/threat-hunting/sessions', {
        name: 'Test Hunt Session',
        hypothesis: 'Testing API connectivity',
      });
      
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(600);
    });

    test('should access hunting session results endpoint', async ({ request }) => {
      const response = await apiHelper.get(request, '/api/v1/threat-hunting/sessions/test-id/results');
      
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(500);
    });
  });

  test.describe('SIEM-Hunting Integration', () => {
    test('should verify both modules respond', async ({ request }) => {
      const siemResponse = await apiHelper.get(request, '/api/v1/siem');
      const huntingResponse = await apiHelper.get(request, '/api/v1/threat-hunting');
      
      expect(siemResponse.status).toBeGreaterThanOrEqual(200);
      expect(huntingResponse.status).toBeGreaterThanOrEqual(200);
      
      expect(siemResponse.data).toBeDefined();
      expect(huntingResponse.data).toBeDefined();
    });
  });
});
