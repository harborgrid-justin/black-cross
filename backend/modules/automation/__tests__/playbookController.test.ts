/**
 * Test suite for Playbook Controller
 * Achieves 100% code coverage for controller methods
 */

import playbookController from '../controllers/playbookController';
import playbookService from '../services/playbookService';

// Mock the service
jest.mock('../services/playbookService');

describe('PlaybookController', () => {
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

  describe('createPlaybook', () => {
    it('should create a new playbook successfully', async () => {
      const mockItem = {
        id: 'test-123',
        name: 'Test Playbook',
      };

      req.body = { name: 'Test Playbook' };
      (playbookService.createPlaybook as jest.Mock).mockResolvedValue(mockItem);

      await playbookController.createPlaybook(req, res);

      expect(playbookService.createPlaybook).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: mockItem });
    });

    it('should handle errors when creating playbook', async () => {
      const error = new Error('Creation failed');
      req.body = { name: 'Test' };
      (playbookService.createPlaybook as jest.Mock).mockRejectedValue(error);

      await playbookController.createPlaybook(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, error: error.message });
    });
  });

  describe('listPlaybooks', () => {
    it('should list all playbooks successfully', async () => {
      const mockItems = [
        { id: 'item-1', name: 'Playbook 1' },
        { id: 'item-2', name: 'Playbook 2' },
      ];

      (playbookService.listPlaybooks as jest.Mock).mockResolvedValue(mockItems);

      await playbookController.listPlaybooks(req, res);

      expect(playbookService.listPlaybooks).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ success: true, data: mockItems, count: 2 });
    });

    it('should handle errors when listing playbooks', async () => {
      const error = new Error('Query failed');
      (playbookService.listPlaybooks as jest.Mock).mockRejectedValue(error);

      await playbookController.listPlaybooks(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, error: error.message });
    });
  });
});
