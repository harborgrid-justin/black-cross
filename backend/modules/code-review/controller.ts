/**
 * Code Review Controller
 * Handles HTTP requests for code review operations
 */

import { Request, Response } from 'express';
import { CodeReviewOrchestrator } from './services/CodeReviewOrchestrator';
import { ReviewConfig } from './types';
import * as path from 'path';

const orchestrator = new CodeReviewOrchestrator();

/**
 * Execute a comprehensive code review
 */
export async function executeCodeReview(req: Request, res: Response): Promise<void> {
  try {
    const { targetPath, includePatterns, excludePatterns, enabledAgents, minSeverity, parallel = true } = req.body;

    // Use absolute path or default to project root
    const projectRoot = path.resolve(__dirname, '../../..');
    const absoluteTargetPath = targetPath 
      ? path.resolve(projectRoot, targetPath)
      : projectRoot;

    // Security: Validate that the target path is within the project root
    if (!absoluteTargetPath.startsWith(projectRoot)) {
      res.status(400).json({
        success: false,
        error: 'Invalid path',
        message: 'Target path must be within the project directory',
      });
      return;
    }

    const config: ReviewConfig = {
      targetPath: absoluteTargetPath,
      includePatterns,
      excludePatterns,
      enabledAgents,
      minSeverity,
      parallel,
    };

    const report = await orchestrator.executeReview(config);

    res.json({
      success: true,
      data: report,
      message: 'Code review completed successfully',
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Code review execution failed:', error);
    res.status(500).json({
      success: false,
      error: 'Code review failed',
      message: errorMessage,
    });
  }
}

/**
 * Get list of available review agents
 */
export async function getAvailableAgents(req: Request, res: Response): Promise<void> {
  try {
    const agents = orchestrator.getAgents();

    res.json({
      success: true,
      data: {
        agents,
        totalAgents: agents.length,
      },
      message: 'Available review agents retrieved successfully',
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to get agents:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get agents',
      message: errorMessage,
    });
  }
}

/**
 * Get health status of code review module
 */
export async function getHealthStatus(req: Request, res: Response): Promise<void> {
  try {
    const agents = orchestrator.getAgents();

    res.json({
      success: true,
      data: {
        status: 'operational',
        agentsAvailable: agents.length,
        agents: agents.map(a => a.name),
        timestamp: new Date().toISOString(),
      },
      message: 'Code review module is operational',
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Health check failed:', error);
    res.status(500).json({
      success: false,
      error: 'Health check failed',
      message: errorMessage,
    });
  }
}
