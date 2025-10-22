/**
 * Test suite for DarkWeb Controller
 * Achieves 100% code coverage for controller methods
 */

import darkwebController from '../controllers/darkwebController';
import darkwebService from '../services/darkwebService';

// Mock the service
jest.mock('../services/darkwebService');

describe('DarkwebController', () => {
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
    it('should create a new darkweb successfully', async () => {
      const mockItem = {
        id: 'test-123',
        name: 'Test DarkWeb',
      };

      req.body = { name: 'Test DarkWeb' };
      (darkwebService.create as jest.Mock).mockResolvedValue(mockItem);

      await darkwebController.create(req, res);

      expect(darkwebService.create).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockItem);
    });

    it('should handle errors when creating darkweb', async () => {
      const error = new Error('Database connection failed');
      req.body = { name: 'Test' };
      (darkwebService.create as jest.Mock).mockRejectedValue(error);

      await darkwebController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe('getById', () => {
    it('should retrieve a darkweb by ID successfully', async () => {
      const mockItem = {
        id: 'test-123',
        name: 'Test DarkWeb',
      };

      req.params.id = 'test-123';
      (darkwebService.getById as jest.Mock).mockResolvedValue(mockItem);

      await darkwebController.getById(req, res);

      expect(darkwebService.getById).toHaveBeenCalledWith('test-123');
      expect(res.json).toHaveBeenCalledWith(mockItem);
    });

    it('should handle errors when darkweb not found', async () => {
      const error = new Error('DarkWeb not found');
      req.params.id = 'non-existent';
      (darkwebService.getById as jest.Mock).mockRejectedValue(error);

      await darkwebController.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe('list', () => {
    it('should list all darkwebs successfully', async () => {
      const mockItems = [
        { id: 'item-1', name: 'DarkWeb 1' },
        { id: 'item-2', name: 'DarkWeb 2' },
      ];

      req.query = { status: 'active' };
      (darkwebService.list as jest.Mock).mockResolvedValue(mockItems);

      await darkwebController.list(req, res);

      expect(darkwebService.list).toHaveBeenCalledWith(req.query);
      expect(res.json).toHaveBeenCalledWith(mockItems);
    });

    it('should handle errors when listing darkwebs', async () => {
      const error = new Error('Query failed');
      (darkwebService.list as jest.Mock).mockRejectedValue(error);

      await darkwebController.list(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe('update', () => {
    it('should update a darkweb successfully', async () => {
      const mockUpdatedItem = {
        id: 'test-123',
        name: 'Updated DarkWeb',
      };

      req.params.id = 'test-123';
      req.body = { name: 'Updated DarkWeb' };
      (darkwebService.update as jest.Mock).mockResolvedValue(mockUpdatedItem);

      await darkwebController.update(req, res);

      expect(darkwebService.update).toHaveBeenCalledWith('test-123', req.body);
      expect(res.json).toHaveBeenCalledWith(mockUpdatedItem);
    });

    it('should handle errors when updating darkweb', async () => {
      const error = new Error('Update failed');
      req.params.id = 'test-123';
      req.body = { name: 'Updated' };
      (darkwebService.update as jest.Mock).mockRejectedValue(error);

      await darkwebController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe('delete', () => {
    it('should delete a darkweb successfully', async () => {
      const mockResult = { deleted: true, id: 'test-123' };

      req.params.id = 'test-123';
      (darkwebService.delete as jest.Mock).mockResolvedValue(mockResult);

      await darkwebController.delete(req, res);

      expect(darkwebService.delete).toHaveBeenCalledWith('test-123');
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should handle errors when deleting darkweb', async () => {
      const error = new Error('Delete failed');
      req.params.id = 'test-123';
      (darkwebService.delete as jest.Mock).mockRejectedValue(error);

      await darkwebController.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });
});
