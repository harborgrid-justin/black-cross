/**
 * Test suite for Collaboration Controller
 * Achieves 100% code coverage for controller methods
 */

import collaborationController from '../controllers/collaborationController';
import collaborationService from '../services/collaborationService';

// Mock the service
jest.mock('../services/collaborationService');

describe('CollaborationController', () => {
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
    it('should create a new collaboration successfully', async () => {
      const mockItem = {
        id: 'test-123',
        name: 'Test Collaboration',
      };

      req.body = { name: 'Test Collaboration' };
      (collaborationService.create as jest.Mock).mockResolvedValue(mockItem);

      await collaborationController.create(req, res);

      expect(collaborationService.create).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockItem);
    });

    it('should handle errors when creating collaboration', async () => {
      const error = new Error('Database connection failed');
      req.body = { name: 'Test' };
      (collaborationService.create as jest.Mock).mockRejectedValue(error);

      await collaborationController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe('getById', () => {
    it('should retrieve a collaboration by ID successfully', async () => {
      const mockItem = {
        id: 'test-123',
        name: 'Test Collaboration',
      };

      req.params.id = 'test-123';
      (collaborationService.getById as jest.Mock).mockResolvedValue(mockItem);

      await collaborationController.getById(req, res);

      expect(collaborationService.getById).toHaveBeenCalledWith('test-123');
      expect(res.json).toHaveBeenCalledWith(mockItem);
    });

    it('should handle errors when collaboration not found', async () => {
      const error = new Error('Collaboration not found');
      req.params.id = 'non-existent';
      (collaborationService.getById as jest.Mock).mockRejectedValue(error);

      await collaborationController.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe('list', () => {
    it('should list all collaborations successfully', async () => {
      const mockItems = [
        { id: 'item-1', name: 'Collaboration 1' },
        { id: 'item-2', name: 'Collaboration 2' },
      ];

      req.query = { status: 'active' };
      (collaborationService.list as jest.Mock).mockResolvedValue(mockItems);

      await collaborationController.list(req, res);

      expect(collaborationService.list).toHaveBeenCalledWith(req.query);
      expect(res.json).toHaveBeenCalledWith(mockItems);
    });

    it('should handle errors when listing collaborations', async () => {
      const error = new Error('Query failed');
      (collaborationService.list as jest.Mock).mockRejectedValue(error);

      await collaborationController.list(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe('update', () => {
    it('should update a collaboration successfully', async () => {
      const mockUpdatedItem = {
        id: 'test-123',
        name: 'Updated Collaboration',
      };

      req.params.id = 'test-123';
      req.body = { name: 'Updated Collaboration' };
      (collaborationService.update as jest.Mock).mockResolvedValue(mockUpdatedItem);

      await collaborationController.update(req, res);

      expect(collaborationService.update).toHaveBeenCalledWith('test-123', req.body);
      expect(res.json).toHaveBeenCalledWith(mockUpdatedItem);
    });

    it('should handle errors when updating collaboration', async () => {
      const error = new Error('Update failed');
      req.params.id = 'test-123';
      req.body = { name: 'Updated' };
      (collaborationService.update as jest.Mock).mockRejectedValue(error);

      await collaborationController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe('delete', () => {
    it('should delete a collaboration successfully', async () => {
      const mockResult = { deleted: true, id: 'test-123' };

      req.params.id = 'test-123';
      (collaborationService.delete as jest.Mock).mockResolvedValue(mockResult);

      await collaborationController.delete(req, res);

      expect(collaborationService.delete).toHaveBeenCalledWith('test-123');
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should handle errors when deleting collaboration', async () => {
      const error = new Error('Delete failed');
      req.params.id = 'test-123';
      (collaborationService.delete as jest.Mock).mockRejectedValue(error);

      await collaborationController.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });
});
