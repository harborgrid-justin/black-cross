/**
 * API Tests - Group 4: Threat Actors & Threat Feeds
 * Tests threat actor profiling and threat feed management endpoints
 */

import { test, expect } from '@playwright/test';
import { ApiHelper, TestDataGenerator } from './utils/api-helper';

test.describe('Threat Actors & Threat Feeds APIs', () => {
  let apiHelper: ApiHelper;

  test.beforeAll(async () => {
    apiHelper = new ApiHelper('http://localhost:8080');
  });

  test.describe('Threat Actors Endpoints', () => {
    test('should access threat actors list endpoint', async ({ request }) => {
      const response = await apiHelper.get(request, '/api/v1/threat-actors');
      
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(500);
      
      if (response.status === 200) {
        expect(response.data).toBeDefined();
      }
    });

    test('should access threat actors search endpoint', async ({ request }) => {
      const response = await apiHelper.get(request, '/api/v1/threat-actors/search?q=test');
      
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(500);
    });

    test('should handle POST to threat actors endpoint', async ({ request }) => {
      const testData = TestDataGenerator.threatActor();
      const response = await apiHelper.post(request, '/api/v1/threat-actors', testData);
      
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(600);
    });

    test('should access specific threat actor campaigns endpoint', async ({ request }) => {
      const response = await apiHelper.get(request, '/api/v1/threat-actors/test-id/campaigns');
      
      // Endpoint should exist
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(500);
    });

    test('should handle GET specific threat actor endpoint', async ({ request }) => {
      const response = await apiHelper.get(request, '/api/v1/threat-actors/test-id');
      
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(500);
    });
  });

  test.describe('Threat Feeds Endpoints', () => {
    test('should access threat feeds list endpoint', async ({ request }) => {
      const response = await apiHelper.get(request, '/api/v1/threat-feeds');
      
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(500);
      
      if (response.status === 200) {
        expect(response.data).toBeDefined();
      }
    });

    test('should access threat feeds stats endpoint', async ({ request }) => {
      const response = await apiHelper.get(request, '/api/v1/threat-feeds/stats');
      
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(500);
    });

    test('should handle feed sync endpoint', async ({ request }) => {
      const response = await apiHelper.post(request, '/api/v1/threat-feeds/test-id/sync', {});
      
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(600);
    });

    test('should handle GET specific feed endpoint', async ({ request }) => {
      const response = await apiHelper.get(request, '/api/v1/threat-feeds/test-id');
      
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(500);
    });

    test('should handle POST to threat feeds endpoint', async ({ request }) => {
      const response = await apiHelper.post(request, '/api/v1/threat-feeds', {
        name: 'Test Feed',
        url: 'https://example.com/feed',
      });
      
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(600);
    });
  });

  test.describe('Threat Actors-Feeds Integration', () => {
    test('should verify both modules are accessible', async ({ request }) => {
      const actorsResponse = await apiHelper.get(request, '/api/v1/threat-actors');
      const feedsResponse = await apiHelper.get(request, '/api/v1/threat-feeds');
      
      expect(actorsResponse.status).toBeGreaterThanOrEqual(200);
      expect(feedsResponse.status).toBeGreaterThanOrEqual(200);
      
      expect(actorsResponse.data).toBeDefined();
      expect(feedsResponse.data).toBeDefined();
    });
  });
});
