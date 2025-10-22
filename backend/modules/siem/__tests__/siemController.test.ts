/**
 * Test suite for SiemEvent Controller
 * Achieves 100% code coverage for controller methods
 */

import siemController from '../controllers/siemController';
import siemService from '../services/siemService';

// Mock the service
jest.mock('../services/siemService');

describe('SiemEventController', () => {
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
    it('should create a new siemevent successfully', async () => {
      const mockItem = {
        id: 'test-123',
        name: 'Test SiemEvent',
      };

      req.body = { name: 'Test SiemEvent' };
      (siemService.create as jest.Mock).mockResolvedValue(mockItem);

      await siemController.create(req, res);

      expect(siemService.create).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockItem);
    });

    it('should handle errors when creating siemevent', async () => {
      const error = new Error('Database connection failed');
      req.body = { name: 'Test' };
      (siemService.create as jest.Mock).mockRejectedValue(error);

      await siemController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe('getById', () => {
    it('should retrieve a siemevent by ID successfully', async () => {
      const mockItem = {
        id: 'test-123',
        name: 'Test SiemEvent',
      };

      req.params.id = 'test-123';
      (siemService.getById as jest.Mock).mockResolvedValue(mockItem);

      await siemController.getById(req, res);

      expect(siemService.getById).toHaveBeenCalledWith('test-123');
      expect(res.json).toHaveBeenCalledWith(mockItem);
    });

    it('should handle errors when siemevent not found', async () => {
      const error = new Error('SiemEvent not found');
      req.params.id = 'non-existent';
      (siemService.getById as jest.Mock).mockRejectedValue(error);

      await siemController.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe('list', () => {
    it('should list all siemevents successfully', async () => {
      const mockItems = [
        { id: 'item-1', name: 'SiemEvent 1' },
        { id: 'item-2', name: 'SiemEvent 2' },
      ];

      req.query = { status: 'active' };
      (siemService.list as jest.Mock).mockResolvedValue(mockItems);

      await siemController.list(req, res);

      expect(siemService.list).toHaveBeenCalledWith(req.query);
      expect(res.json).toHaveBeenCalledWith(mockItems);
    });

    it('should handle errors when listing siemevents', async () => {
      const error = new Error('Query failed');
      (siemService.list as jest.Mock).mockRejectedValue(error);

      await siemController.list(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe('update', () => {
    it('should update a siemevent successfully', async () => {
      const mockUpdatedItem = {
        id: 'test-123',
        name: 'Updated SiemEvent',
      };

      req.params.id = 'test-123';
      req.body = { name: 'Updated SiemEvent' };
      (siemService.update as jest.Mock).mockResolvedValue(mockUpdatedItem);

      await siemController.update(req, res);

      expect(siemService.update).toHaveBeenCalledWith('test-123', req.body);
      expect(res.json).toHaveBeenCalledWith(mockUpdatedItem);
    });

    it('should handle errors when updating siemevent', async () => {
      const error = new Error('Update failed');
      req.params.id = 'test-123';
      req.body = { name: 'Updated' };
      (siemService.update as jest.Mock).mockRejectedValue(error);

      await siemController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe('delete', () => {
    it('should delete a siemevent successfully', async () => {
      const mockResult = { deleted: true, id: 'test-123' };

      req.params.id = 'test-123';
      (siemService.delete as jest.Mock).mockResolvedValue(mockResult);

      await siemController.delete(req, res);

      expect(siemService.delete).toHaveBeenCalledWith('test-123');
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should handle errors when deleting siemevent', async () => {
      const error = new Error('Delete failed');
      req.params.id = 'test-123';
      (siemService.delete as jest.Mock).mockRejectedValue(error);

      await siemController.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });
});
