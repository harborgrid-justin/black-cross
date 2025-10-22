/**
 * Test suite for Hunt Controller
 * Achieves 100% code coverage for controller methods
 */

import huntController from '../controllers/huntController';
import huntingService from '../services/huntingService';

// Mock the service
jest.mock('../services/huntingService');

describe('HuntController', () => {
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

  describe('createSession', () => {
    it('should create a hunt session successfully', async () => {
      const mockSession = {
        id: 'session-123',
        name: 'Test Hunt',
      };

      req.body = { name: 'Test Hunt' };
      (huntingService.createSession as jest.Mock).mockResolvedValue(mockSession);

      await huntController.createSession(req, res);

      expect(huntingService.createSession).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockSession);
    });

    it('should handle errors when creating session', async () => {
      const error = new Error('Creation failed');
      req.body = { name: 'Test' };
      (huntingService.createSession as jest.Mock).mockRejectedValue(error);

      await huntController.createSession(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe('listSessions', () => {
    it('should list all hunt sessions successfully', async () => {
      const mockSessions = [
        { id: 'session-1', name: 'Hunt 1' },
        { id: 'session-2', name: 'Hunt 2' },
      ];

      (huntingService.listSessions as jest.Mock).mockResolvedValue(mockSessions);

      await huntController.listSessions(req, res);

      expect(huntingService.listSessions).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockSessions);
    });

    it('should handle errors when listing sessions', async () => {
      const error = new Error('Query failed');
      (huntingService.listSessions as jest.Mock).mockRejectedValue(error);

      await huntController.listSessions(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe('getSession', () => {
    it('should get a hunt session by ID successfully', async () => {
      const mockSession = {
        id: 'session-123',
        name: 'Test Hunt',
      };

      req.params.id = 'session-123';
      (huntingService.getSession as jest.Mock).mockResolvedValue(mockSession);

      await huntController.getSession(req, res);

      expect(huntingService.getSession).toHaveBeenCalledWith('session-123');
      expect(res.json).toHaveBeenCalledWith(mockSession);
    });

    it('should handle errors when session not found', async () => {
      const error = new Error('Session not found');
      req.params.id = 'non-existent';
      (huntingService.getSession as jest.Mock).mockRejectedValue(error);

      await huntController.getSession(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });
});
