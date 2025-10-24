import { type Request, type Response } from 'express';
import dashboardService from '../services/dashboardService';

class DashboardController {
  async getStats(req: Request, res: Response) {
    try {
      const stats = await dashboardService.getDashboardStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ success: false, error: `Failed to get dashboard stats: ${errorMessage}` });
    }
  }
}

export default new DashboardController();
