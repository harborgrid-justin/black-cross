/**
 * AI Controller
 * Handles AI-powered content generation requests
 */

import { Request, Response, NextFunction } from 'express';
import { aiService } from './service';
import { ContentFormat, ContentTone } from './types';

export class AIController {
  /**
   * Check if AI service is available
   */
  async getStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const available = aiService.isAvailable();
      
      res.json({
        success: true,
        data: {
          available,
          message: available 
            ? 'AI service is configured and ready' 
            : 'AI service not configured. Set AI_API_KEY environment variable.'
        }
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Fix spelling in content
   */
  async fixSpelling(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { content, format = ContentFormat.TEXT } = req.body;

      if (!content) {
        res.status(400).json({
          success: false,
          error: 'Content is required'
        });
        return;
      }

      const result = await aiService.fixSpelling(content, format, req.user);

      res.json({
        success: true,
        data: { result }
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Make content shorter
   */
  async makeShorter(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { content, format = ContentFormat.TEXT } = req.body;

      if (!content) {
        res.status(400).json({
          success: false,
          error: 'Content is required'
        });
        return;
      }

      const result = await aiService.makeShorter(content, format, req.user);

      res.json({
        success: true,
        data: { result }
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Make content longer
   */
  async makeLonger(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { content, format = ContentFormat.TEXT } = req.body;

      if (!content) {
        res.status(400).json({
          success: false,
          error: 'Content is required'
        });
        return;
      }

      const result = await aiService.makeLonger(content, format, req.user);

      res.json({
        success: true,
        data: { result }
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Change content tone
   */
  async changeTone(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { content, tone, format = ContentFormat.TEXT } = req.body;

      if (!content) {
        res.status(400).json({
          success: false,
          error: 'Content is required'
        });
        return;
      }

      if (!tone) {
        res.status(400).json({
          success: false,
          error: 'Tone is required'
        });
        return;
      }

      const result = await aiService.changeTone(content, tone, format, req.user);

      res.json({
        success: true,
        data: { result }
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Summarize content
   */
  async summarize(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { content, format = ContentFormat.TEXT } = req.body;

      if (!content) {
        res.status(400).json({
          success: false,
          error: 'Content is required'
        });
        return;
      }

      const result = await aiService.summarize(content, format, req.user);

      res.json({
        success: true,
        data: { result }
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Generate report
   */
  async generateReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { data, tone = ContentTone.PROFESSIONAL } = req.body;

      if (!data) {
        res.status(400).json({
          success: false,
          error: 'Report data is required'
        });
        return;
      }

      const result = await aiService.generateReport(data, tone, req.user);

      res.json({
        success: true,
        data: { result }
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Analyze threat
   */
  async analyzeThreat(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { threat } = req.body;

      if (!threat) {
        res.status(400).json({
          success: false,
          error: 'Threat data is required'
        });
        return;
      }

      const result = await aiService.analyzeThreat(threat, req.user);

      res.json({
        success: true,
        data: { result }
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Extract IOCs from text
   */
  async extractIOCs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { text } = req.body;

      if (!text) {
        res.status(400).json({
          success: false,
          error: 'Text is required'
        });
        return;
      }

      const result = await aiService.extractIOCs(text, req.user);

      res.json({
        success: true,
        data: { result }
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get user AI usage statistics
   */
  async getUsage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const days = parseInt(req.query.days as string) || 30;
      const usage = aiService.getUserUsage(req.user.id, days);
      const totalTokens = aiService.getUserTokenUsage(req.user.id, days);

      res.json({
        success: true,
        data: {
          usage,
          total_tokens: totalTokens,
          period_days: days
        }
      });
    } catch (error: any) {
      next(error);
    }
  }
}

export const aiController = new AIController();
