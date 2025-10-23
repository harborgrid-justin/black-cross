import type { Request, Response } from 'express';
import huntingService from '../services/huntingService';

class HuntController {
  async createSession(req: Request, res: Response): Promise<void> {
    try {
      const session = await huntingService.createSession(req.body);
      res.status(201).json(session);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getSession(req: Request, res: Response): Promise<void> {
    try {
      const session = await huntingService.getSession(req.params.id);
      res.json(session);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async executeQuery(req: Request, res: Response): Promise<void> {
    try {
      const result = await huntingService.executeQuery(req.params.id, req.body.query);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async addFinding(req: Request, res: Response): Promise<void> {
    try {
      const session = await huntingService.addFinding(req.params.id, req.body);
      res.json(session);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async listSessions(req: Request, res: Response): Promise<void> {
    try {
      const sessions = await huntingService.listSessions(req.query);
      res.json(sessions);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

export default new HuntController();
