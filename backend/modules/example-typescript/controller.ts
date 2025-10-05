/**
 * Example TypeScript Module - Controller Layer
 * This demonstrates request handling with type safety
 */

import { Request, Response } from 'express';
import { ExampleService } from './service';
import { ExampleResponse, ExampleQuery } from './types';

const service = new ExampleService();

/**
 * Get all example data with optional filtering
 */
export async function list(req: Request, res: Response): Promise<void> {
  try {
    const query: ExampleQuery = {
      status: req.query.status as 'active' | 'inactive' | undefined,
      search: req.query.search as string | undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
    };

    const data = await service.getData(query);

    const response: ExampleResponse = {
      success: true,
      data,
    };

    res.json(response);
  } catch (error) {
    const response: ExampleResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    res.status(500).json(response);
  }
}

/**
 * Get example data by ID
 */
export async function getById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const data = await service.getById(id);

    if (!data) {
      const response: ExampleResponse = {
        success: false,
        message: 'Not found',
      };
      res.status(404).json(response);
      return;
    }

    const response: ExampleResponse = {
      success: true,
      data,
    };

    res.json(response);
  } catch (error) {
    const response: ExampleResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    res.status(500).json(response);
  }
}

/**
 * Create new example data
 */
export async function create(req: Request, res: Response): Promise<void> {
  try {
    const data = await service.create(req.body);

    const response: ExampleResponse = {
      success: true,
      data,
      message: 'Created successfully',
    };

    res.status(201).json(response);
  } catch (error) {
    const response: ExampleResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    res.status(500).json(response);
  }
}
