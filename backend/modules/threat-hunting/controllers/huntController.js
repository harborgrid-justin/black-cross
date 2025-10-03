const huntingService = require('../services/huntingService');

class HuntController {
  async createSession(req, res) {
    try {
      const session = await huntingService.createSession(req.body);
      res.status(201).json(session);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getSession(req, res) {
    try {
      const session = await huntingService.getSession(req.params.id);
      res.json(session);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async executeQuery(req, res) {
    try {
      const result = await huntingService.executeQuery(req.params.id, req.body.query);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async addFinding(req, res) {
    try {
      const session = await huntingService.addFinding(req.params.id, req.body);
      res.json(session);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async listSessions(req, res) {
    try {
      const sessions = await huntingService.listSessions(req.query);
      res.json(sessions);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new HuntController();
