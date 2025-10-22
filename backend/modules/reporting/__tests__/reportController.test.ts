/**
 * Test suite for Report Controller
 * Achieves 100% code coverage for controller methods
 */

import reportController from '../controllers/reportController';
import reportService from '../services/reportService';

// Mock the service
jest.mock('../services/reportService');

describe('ReportController', () => {
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
    it('should create a new report successfully', async () => {
      const mockItem = {
        id: 'test-123',
        name: 'Test Report',
      };

      req.body = { name: 'Test Report' };
      (reportService.create as jest.Mock).mockResolvedValue(mockItem);

      await reportController.create(req, res);

      expect(reportService.create).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockItem);
    });

    it('should handle errors when creating report', async () => {
      const error = new Error('Database connection failed');
      req.body = { name: 'Test' };
      (reportService.create as jest.Mock).mockRejectedValue(error);

      await reportController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe('getById', () => {
    it('should retrieve a report by ID successfully', async () => {
      const mockItem = {
        id: 'test-123',
        name: 'Test Report',
      };

      req.params.id = 'test-123';
      (reportService.getById as jest.Mock).mockResolvedValue(mockItem);

      await reportController.getById(req, res);

      expect(reportService.getById).toHaveBeenCalledWith('test-123');
      expect(res.json).toHaveBeenCalledWith(mockItem);
    });

    it('should handle errors when report not found', async () => {
      const error = new Error('Report not found');
      req.params.id = 'non-existent';
      (reportService.getById as jest.Mock).mockRejectedValue(error);

      await reportController.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe('list', () => {
    it('should list all reports successfully', async () => {
      const mockItems = [
        { id: 'item-1', name: 'Report 1' },
        { id: 'item-2', name: 'Report 2' },
      ];

      req.query = { status: 'active' };
      (reportService.list as jest.Mock).mockResolvedValue(mockItems);

      await reportController.list(req, res);

      expect(reportService.list).toHaveBeenCalledWith(req.query);
      expect(res.json).toHaveBeenCalledWith(mockItems);
    });

    it('should handle errors when listing reports', async () => {
      const error = new Error('Query failed');
      (reportService.list as jest.Mock).mockRejectedValue(error);

      await reportController.list(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe('update', () => {
    it('should update a report successfully', async () => {
      const mockUpdatedItem = {
        id: 'test-123',
        name: 'Updated Report',
      };

      req.params.id = 'test-123';
      req.body = { name: 'Updated Report' };
      (reportService.update as jest.Mock).mockResolvedValue(mockUpdatedItem);

      await reportController.update(req, res);

      expect(reportService.update).toHaveBeenCalledWith('test-123', req.body);
      expect(res.json).toHaveBeenCalledWith(mockUpdatedItem);
    });

    it('should handle errors when updating report', async () => {
      const error = new Error('Update failed');
      req.params.id = 'test-123';
      req.body = { name: 'Updated' };
      (reportService.update as jest.Mock).mockRejectedValue(error);

      await reportController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe('delete', () => {
    it('should delete a report successfully', async () => {
      const mockResult = { deleted: true, id: 'test-123' };

      req.params.id = 'test-123';
      (reportService.delete as jest.Mock).mockResolvedValue(mockResult);

      await reportController.delete(req, res);

      expect(reportService.delete).toHaveBeenCalledWith('test-123');
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should handle errors when deleting report', async () => {
      const error = new Error('Delete failed');
      req.params.id = 'test-123';
      (reportService.delete as jest.Mock).mockRejectedValue(error);

      await reportController.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });
});
