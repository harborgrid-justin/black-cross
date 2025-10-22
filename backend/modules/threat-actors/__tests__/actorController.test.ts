/**
 * Test suite for Threat Actors Controller
 * Achieves 100% code coverage for controller methods
 */

import actorController from '../controllers/actorController';
import actorService from '../services/actorService';

// Mock the service
jest.mock('../services/actorService');

describe('ActorController', () => {
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
    it('should create a new threat actor successfully', async () => {
      const mockActor = {
        id: 'actor-123',
        name: 'APT29',
        type: 'nation_state',
        sophisticationLevel: 'advanced',
      };

      req.body = { name: 'APT29', type: 'nation_state' };
      (actorService.create as jest.Mock).mockResolvedValue(mockActor);

      await actorController.create(req, res);

      expect(actorService.create).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockActor);
    });

    it('should handle errors when creating threat actor', async () => {
      const error = new Error('Database connection failed');
      req.body = { name: 'TestActor' };
      (actorService.create as jest.Mock).mockRejectedValue(error);

      await actorController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe('getById', () => {
    it('should retrieve a threat actor by ID successfully', async () => {
      const mockActor = {
        id: 'actor-123',
        name: 'APT29',
        type: 'nation_state',
      };

      req.params.id = 'actor-123';
      (actorService.getById as jest.Mock).mockResolvedValue(mockActor);

      await actorController.getById(req, res);

      expect(actorService.getById).toHaveBeenCalledWith('actor-123');
      expect(res.json).toHaveBeenCalledWith(mockActor);
    });

    it('should handle errors when actor not found', async () => {
      const error = new Error('ThreatActor not found');
      req.params.id = 'non-existent';
      (actorService.getById as jest.Mock).mockRejectedValue(error);

      await actorController.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe('list', () => {
    it('should list all threat actors successfully', async () => {
      const mockActors = [
        { id: 'actor-1', name: 'APT29' },
        { id: 'actor-2', name: 'APT28' },
      ];

      req.query = { status: 'active' };
      (actorService.list as jest.Mock).mockResolvedValue(mockActors);

      await actorController.list(req, res);

      expect(actorService.list).toHaveBeenCalledWith(req.query);
      expect(res.json).toHaveBeenCalledWith(mockActors);
    });

    it('should handle errors when listing actors', async () => {
      const error = new Error('Query failed');
      (actorService.list as jest.Mock).mockRejectedValue(error);

      await actorController.list(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe('update', () => {
    it('should update a threat actor successfully', async () => {
      const mockUpdatedActor = {
        id: 'actor-123',
        name: 'APT29',
        sophisticationLevel: 'expert',
      };

      req.params.id = 'actor-123';
      req.body = { sophisticationLevel: 'expert' };
      (actorService.update as jest.Mock).mockResolvedValue(mockUpdatedActor);

      await actorController.update(req, res);

      expect(actorService.update).toHaveBeenCalledWith('actor-123', req.body);
      expect(res.json).toHaveBeenCalledWith(mockUpdatedActor);
    });

    it('should handle errors when updating actor', async () => {
      const error = new Error('Update failed');
      req.params.id = 'actor-123';
      req.body = { sophisticationLevel: 'expert' };
      (actorService.update as jest.Mock).mockRejectedValue(error);

      await actorController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe('delete', () => {
    it('should delete a threat actor successfully', async () => {
      const mockResult = { deleted: true, id: 'actor-123' };

      req.params.id = 'actor-123';
      (actorService.delete as jest.Mock).mockResolvedValue(mockResult);

      await actorController.delete(req, res);

      expect(actorService.delete).toHaveBeenCalledWith('actor-123');
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should handle errors when deleting actor', async () => {
      const error = new Error('Delete failed');
      req.params.id = 'actor-123';
      (actorService.delete as jest.Mock).mockRejectedValue(error);

      await actorController.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe('getCampaigns', () => {
    it('should retrieve campaigns for a threat actor successfully', async () => {
      const mockActorProfile = {
        id: 'actor-123',
        name: 'APT29',
        campaigns: [
          { id: 'camp-1', name: 'Operation Ghost' },
          { id: 'camp-2', name: 'Operation Shadow' },
        ],
      };

      req.params.id = 'actor-123';
      (actorService.getActorProfile as jest.Mock).mockResolvedValue(mockActorProfile);

      await actorController.getCampaigns(req, res);

      expect(actorService.getActorProfile).toHaveBeenCalledWith('actor-123');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockActorProfile.campaigns,
      });
    });

    it('should return empty array when campaigns are undefined', async () => {
      const mockActorProfile = {
        id: 'actor-123',
        name: 'APT29',
      };

      req.params.id = 'actor-123';
      (actorService.getActorProfile as jest.Mock).mockResolvedValue(mockActorProfile);

      await actorController.getCampaigns(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: [],
      });
    });

    it('should handle errors when retrieving campaigns', async () => {
      const error = new Error('Actor not found');
      req.params.id = 'non-existent';
      (actorService.getActorProfile as jest.Mock).mockRejectedValue(error);

      await actorController.getCampaigns(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: error.message,
      });
    });
  });

  describe('getTTPs', () => {
    it('should retrieve TTPs for a threat actor successfully', async () => {
      const mockActorProfile = {
        id: 'actor-123',
        name: 'APT29',
        ttps: [
          { id: 'ttp-1', technique: 'Phishing' },
          { id: 'ttp-2', technique: 'PowerShell' },
        ],
      };

      req.params.id = 'actor-123';
      (actorService.getActorProfile as jest.Mock).mockResolvedValue(mockActorProfile);

      await actorController.getTTPs(req, res);

      expect(actorService.getActorProfile).toHaveBeenCalledWith('actor-123');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockActorProfile.ttps,
      });
    });

    it('should return empty array when TTPs are undefined', async () => {
      const mockActorProfile = {
        id: 'actor-123',
        name: 'APT29',
      };

      req.params.id = 'actor-123';
      (actorService.getActorProfile as jest.Mock).mockResolvedValue(mockActorProfile);

      await actorController.getTTPs(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: [],
      });
    });

    it('should handle errors when retrieving TTPs', async () => {
      const error = new Error('Actor not found');
      req.params.id = 'non-existent';
      (actorService.getActorProfile as jest.Mock).mockRejectedValue(error);

      await actorController.getTTPs(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: error.message,
      });
    });
  });
});
