/**
 * Test suite for Feed Controller
 * Achieves 100% code coverage for controller methods
 */

import feedController from '../controllers/feedController';
import feedService from '../services/feedService';

// Mock the service
jest.mock('../services/feedService');

describe('FeedController', () => {
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
    it('should create a new feed successfully', async () => {
      const mockItem = {
        id: 'test-123',
        name: 'Test Feed',
      };

      req.body = { name: 'Test Feed' };
      (feedService.create as jest.Mock).mockResolvedValue(mockItem);

      await feedController.create(req, res);

      expect(feedService.create).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockItem);
    });

    it('should handle errors when creating feed', async () => {
      const error = new Error('Database connection failed');
      req.body = { name: 'Test' };
      (feedService.create as jest.Mock).mockRejectedValue(error);

      await feedController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe('getById', () => {
    it('should retrieve a feed by ID successfully', async () => {
      const mockItem = {
        id: 'test-123',
        name: 'Test Feed',
      };

      req.params.id = 'test-123';
      (feedService.getById as jest.Mock).mockResolvedValue(mockItem);

      await feedController.getById(req, res);

      expect(feedService.getById).toHaveBeenCalledWith('test-123');
      expect(res.json).toHaveBeenCalledWith(mockItem);
    });

    it('should handle errors when feed not found', async () => {
      const error = new Error('Feed not found');
      req.params.id = 'non-existent';
      (feedService.getById as jest.Mock).mockRejectedValue(error);

      await feedController.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe('list', () => {
    it('should list all feeds successfully', async () => {
      const mockItems = [
        { id: 'item-1', name: 'Feed 1' },
        { id: 'item-2', name: 'Feed 2' },
      ];

      req.query = { status: 'active' };
      (feedService.list as jest.Mock).mockResolvedValue(mockItems);

      await feedController.list(req, res);

      expect(feedService.list).toHaveBeenCalledWith(req.query);
      expect(res.json).toHaveBeenCalledWith(mockItems);
    });

    it('should handle errors when listing feeds', async () => {
      const error = new Error('Query failed');
      (feedService.list as jest.Mock).mockRejectedValue(error);

      await feedController.list(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe('update', () => {
    it('should update a feed successfully', async () => {
      const mockUpdatedItem = {
        id: 'test-123',
        name: 'Updated Feed',
      };

      req.params.id = 'test-123';
      req.body = { name: 'Updated Feed' };
      (feedService.update as jest.Mock).mockResolvedValue(mockUpdatedItem);

      await feedController.update(req, res);

      expect(feedService.update).toHaveBeenCalledWith('test-123', req.body);
      expect(res.json).toHaveBeenCalledWith(mockUpdatedItem);
    });

    it('should handle errors when updating feed', async () => {
      const error = new Error('Update failed');
      req.params.id = 'test-123';
      req.body = { name: 'Updated' };
      (feedService.update as jest.Mock).mockRejectedValue(error);

      await feedController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe('delete', () => {
    it('should delete a feed successfully', async () => {
      const mockResult = { deleted: true, id: 'test-123' };

      req.params.id = 'test-123';
      (feedService.delete as jest.Mock).mockResolvedValue(mockResult);

      await feedController.delete(req, res);

      expect(feedService.delete).toHaveBeenCalledWith('test-123');
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should handle errors when deleting feed', async () => {
      const error = new Error('Delete failed');
      req.params.id = 'test-123';
      (feedService.delete as jest.Mock).mockRejectedValue(error);

      await feedController.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });
});
