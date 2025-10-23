import feedService from '../services/feedService';

class FeedController {
  async create(req, res) {
    try {
      const item = await feedService.create(req.body);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getById(req, res) {
    try {
      const item = await feedService.getById(req.params.id);
      res.json(item);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async list(req, res) {
    try {
      const items = await feedService.list(req.query);
      res.json(items);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async update(req, res) {
    try {
      const item = await feedService.update(req.params.id, req.body);
      res.json(item);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const result = await feedService.delete(req.params.id);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async toggleFeed(req, res) {
    try {
      const { enabled } = req.body;
      const item = await feedService.update(req.params.id, { enabled });
      res.json({ success: true, data: item });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async refreshFeed(req, res) {
    try {
      const result = await feedService.fetchAndParseFeed(req.params.id);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getFeedStats(req, res) {
    try {
      const stats = await feedService.getFeedHealth(req.params.id);
      res.json({ success: true, data: stats });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  }
}

export default new FeedController();
