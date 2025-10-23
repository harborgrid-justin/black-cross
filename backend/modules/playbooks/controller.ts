/**
 * Playbook Controller
 */

import { Request, Response, NextFunction } from 'express';
import { executionEngine } from './execution-engine';
import type { Playbook } from './types';
import { PlaybookStatus } from './types';

// In-memory storage for demo (would be database in production)
const playbooks: Map<string, Playbook> = new Map();

export class PlaybookController {
  /**
   * Create a new playbook
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, description, components, tags } = req.body;

      if (!name || !components) {
        res.status(400).json({
          success: false,
          error: 'Name and components are required'
        });
        return;
      }

      const playbook: Playbook = {
        id: `playbook-${Date.now()}`,
        name,
        description,
        status: PlaybookStatus.DRAFT,
        components,
        created_by: req.user!.id,
        created_at: new Date(),
        updated_at: new Date(),
        tags
      };

      playbooks.set(playbook.id, playbook);

      res.status(201).json({
        success: true,
        data: playbook
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get all playbooks
   */
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const allPlaybooks = Array.from(playbooks.values());
      
      res.json({
        success: true,
        data: allPlaybooks
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get a specific playbook
   */
  async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const playbook = playbooks.get(req.params.id);

      if (!playbook) {
        res.status(404).json({
          success: false,
          error: 'Playbook not found'
        });
        return;
      }

      res.json({
        success: true,
        data: playbook
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Update a playbook
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const playbook = playbooks.get(req.params.id);

      if (!playbook) {
        res.status(404).json({
          success: false,
          error: 'Playbook not found'
        });
        return;
      }

      const { name, description, components, status, tags } = req.body;

      if (name) playbook.name = name;
      if (description !== undefined) playbook.description = description;
      if (components) playbook.components = components;
      if (status) playbook.status = status;
      if (tags) playbook.tags = tags;
      playbook.updated_at = new Date();

      res.json({
        success: true,
        data: playbook
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Delete a playbook
   */
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deleted = playbooks.delete(req.params.id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Playbook not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Playbook deleted'
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Execute a playbook
   */
  async execute(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const playbook = playbooks.get(req.params.id);

      if (!playbook) {
        res.status(404).json({
          success: false,
          error: 'Playbook not found'
        });
        return;
      }

      if (playbook.status !== PlaybookStatus.ACTIVE) {
        res.status(400).json({
          success: false,
          error: 'Playbook must be active to execute'
        });
        return;
      }

      const { triggerData } = req.body;

      const execution = await executionEngine.execute(
        playbook,
        req.user!.id,
        triggerData
      );

      res.json({
        success: true,
        data: execution
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get execution status
   */
  async getExecution(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const execution = executionEngine.getExecution(req.params.executionId);

      if (!execution) {
        res.status(404).json({
          success: false,
          error: 'Execution not found'
        });
        return;
      }

      res.json({
        success: true,
        data: execution
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Cancel execution
   */
  async cancelExecution(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await executionEngine.cancelExecution(req.params.executionId);

      res.json({
        success: true,
        message: 'Execution cancelled'
      });
    } catch (error: any) {
      next(error);
    }
  }
}

export const playbookController = new PlaybookController();
