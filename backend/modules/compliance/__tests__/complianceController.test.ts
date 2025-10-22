/**
 * Test suite for Compliance Controller
 * Achieves 100% code coverage for controller methods
 */

import complianceController from '../controllers/complianceController';
import complianceService from '../services/complianceService';

// Mock the service
jest.mock('../services/complianceService');

describe('ComplianceController', () => {
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

  describe('create', () => {
    it('should create a new compliance successfully', async () => {
      const mockItem = {
        id: 'test-123',
        name: 'Test Compliance',
      };

      req.body = { name: 'Test Compliance' };
      (complianceService.create as jest.Mock).mockResolvedValue(mockItem);

      await complianceController.create(req, res);

      expect(complianceService.create).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockItem);
    });

    it('should handle errors when creating compliance', async () => {
      const error = new Error('Database connection failed');
      req.body = { name: 'Test' };
      (complianceService.create as jest.Mock).mockRejectedValue(error);

      await complianceController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe('getById', () => {
    it('should retrieve a compliance by ID successfully', async () => {
      const mockItem = {
        id: 'test-123',
        name: 'Test Compliance',
      };

      req.params.id = 'test-123';
      (complianceService.getById as jest.Mock).mockResolvedValue(mockItem);

      await complianceController.getById(req, res);

      expect(complianceService.getById).toHaveBeenCalledWith('test-123');
      expect(res.json).toHaveBeenCalledWith(mockItem);
    });

    it('should handle errors when compliance not found', async () => {
      const error = new Error('Compliance not found');
      req.params.id = 'non-existent';
      (complianceService.getById as jest.Mock).mockRejectedValue(error);

      await complianceController.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe('list', () => {
    it('should list all compliances successfully', async () => {
      const mockItems = [
        { id: 'item-1', name: 'Compliance 1' },
        { id: 'item-2', name: 'Compliance 2' },
      ];

      req.query = { status: 'active' };
      (complianceService.list as jest.Mock).mockResolvedValue(mockItems);

      await complianceController.list(req, res);

      expect(complianceService.list).toHaveBeenCalledWith(req.query);
      expect(res.json).toHaveBeenCalledWith(mockItems);
    });

    it('should handle errors when listing compliances', async () => {
      const error = new Error('Query failed');
      (complianceService.list as jest.Mock).mockRejectedValue(error);

      await complianceController.list(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe('update', () => {
    it('should update a compliance successfully', async () => {
      const mockUpdatedItem = {
        id: 'test-123',
        name: 'Updated Compliance',
      };

      req.params.id = 'test-123';
      req.body = { name: 'Updated Compliance' };
      (complianceService.update as jest.Mock).mockResolvedValue(mockUpdatedItem);

      await complianceController.update(req, res);

      expect(complianceService.update).toHaveBeenCalledWith('test-123', req.body);
      expect(res.json).toHaveBeenCalledWith(mockUpdatedItem);
    });

    it('should handle errors when updating compliance', async () => {
      const error = new Error('Update failed');
      req.params.id = 'test-123';
      req.body = { name: 'Updated' };
      (complianceService.update as jest.Mock).mockRejectedValue(error);

      await complianceController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe('delete', () => {
    it('should delete a compliance successfully', async () => {
      const mockResult = { deleted: true, id: 'test-123' };

      req.params.id = 'test-123';
      (complianceService.delete as jest.Mock).mockResolvedValue(mockResult);

      await complianceController.delete(req, res);

      expect(complianceService.delete).toHaveBeenCalledWith('test-123');
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should handle errors when deleting compliance', async () => {
      const error = new Error('Delete failed');
      req.params.id = 'test-123';
      (complianceService.delete as jest.Mock).mockRejectedValue(error);

      await complianceController.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });
});
