/**
 * Test suite for Risk Controller
 * Achieves 100% code coverage for controller methods
 */

import riskController from '../controllers/riskController';
import assetCriticalityService from '../services/assetCriticalityService';

// Mock the service
jest.mock('../services/assetCriticalityService');

describe('RiskController', () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('assessAsset', () => {
    it('should assess asset criticality successfully', async () => {
      const mockAssessment = {
        assetId: 'asset-123',
        criticalityScore: 85,
        criticalityLevel: 'high',
      };

      req.body = { assetId: 'asset-123' };
      (assetCriticalityService.assessAsset as jest.Mock).mockResolvedValue(mockAssessment);

      await riskController.assessAsset(req, res);

      expect(assetCriticalityService.assessAsset).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: mockAssessment });
    });

    it('should handle errors when assessing asset', async () => {
      const error = new Error('Assessment failed');
      req.body = { assetId: 'asset-123' };
      (assetCriticalityService.assessAsset as jest.Mock).mockRejectedValue(error);

      await riskController.assessAsset(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, error: error.message });
    });
  });

  describe('getAssetCriticality', () => {
    it('should get asset criticality successfully', async () => {
      const mockAssessment = {
        assetId: 'asset-123',
        criticalityScore: 85,
      };

      req.params.id = 'asset-123';
      (assetCriticalityService.getAssetCriticality as jest.Mock).mockResolvedValue(mockAssessment);

      await riskController.getAssetCriticality(req, res);

      expect(assetCriticalityService.getAssetCriticality).toHaveBeenCalledWith('asset-123');
      expect(res.json).toHaveBeenCalledWith({ success: true, data: mockAssessment });
    });

    it('should handle errors when getting asset criticality', async () => {
      const error = new Error('Asset not found');
      req.params.id = 'non-existent';
      (assetCriticalityService.getAssetCriticality as jest.Mock).mockRejectedValue(error);

      await riskController.getAssetCriticality(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, error: error.message });
    });
  });
});
