import actorService from '../services/actorService';

class ActorController {
  async create(req, res) {
    try {
      const item = await actorService.create(req.body);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getById(req, res) {
    try {
      const item = await actorService.getById(req.params.id);
      res.json(item);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async list(req, res) {
    try {
      const items = await actorService.list(req.query);
      res.json(items);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async update(req, res) {
    try {
      const item = await actorService.update(req.params.id, req.body);
      res.json(item);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const result = await actorService.delete(req.params.id);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getCampaigns(req, res) {
    try {
      const actorProfile = await actorService.getActorProfile(req.params.id);
      res.json({ 
        success: true,
        data: actorProfile.campaigns || []
      });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  }

  async getTTPs(req, res) {
    try {
      const actorProfile = await actorService.getActorProfile(req.params.id);
      res.json({ 
        success: true,
        data: actorProfile.ttps || []
      });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  }
}

export default new ActorController();

