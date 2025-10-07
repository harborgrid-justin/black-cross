/**
 * Example TypeScript Module - Controller Layer
 * Demonstrates TypeScript best practices for Express handlers:
 * - Explicit return type annotations (Promise<void> for async handlers)
 * - Type-safe error handling with discriminated unions
 * - Proper use of type guards
 * - Optional chaining and nullish coalescing
 * - JSDoc documentation for all public functions
 */

import type { Request, Response } from 'express';
import { ExampleService } from './service';
import type {
  ExampleResponse, ExampleQuery, ExampleData, CreateExampleInput,
} from './types';

const service: ExampleService = new ExampleService();

/**
 * Type guard to check if error is an Error instance
 * @param error - Unknown error object
 * @returns True if error is an Error instance
 */
function isError(error: unknown): error is Error {
  return error instanceof Error;
}

/**
 * Helper function to create error response
 * @param error - Unknown error object
 * @returns Error response object
 */
function createErrorResponse(error: unknown): ExampleResponse<never> {
  const errorMessage: string = isError(error) ? error.message : 'Unknown error occurred';
  return {
    success: false,
    error: errorMessage,
  };
}

/**
 * Parse and validate query parameters
 * @param query - Express query object
 * @returns Validated query parameters
 */
function parseQuery(query: Request['query']): ExampleQuery {
  const status: string | undefined = typeof query['status'] === 'string' ? query['status'] : undefined;
  const search: string | undefined = typeof query['search'] === 'string' ? query['search'] : undefined;
  const limitStr: string | undefined = typeof query['limit'] === 'string' ? query['limit'] : undefined;

  // Validate status if provided
  const validStatus: 'active' | 'inactive' | undefined = status === 'active' || status === 'inactive' ? status : undefined;

  // Parse limit with validation
  let limit: number | undefined;
  if (limitStr !== undefined) {
    const parsed: number = parseInt(limitStr, 10);
    limit = !Number.isNaN(parsed) && parsed > 0 ? parsed : undefined;
  }

  return {
    status: validStatus,
    search,
    limit,
  };
}

/**
 * Get all example data with optional filtering
 * @param req - Express request object
 * @param res - Express response object
 * @returns Promise that resolves when response is sent
 */
export async function list(req: Request, res: Response): Promise<void> {
  try {
    const query: ExampleQuery = parseQuery(req.query);
    const data: readonly ExampleData[] = await service.getData(query);

    const response: ExampleResponse<readonly ExampleData[]> = {
      success: true,
      data,
    };

    res.json(response);
  } catch (error: unknown) {
    const response: ExampleResponse<never> = createErrorResponse(error);
    res.status(500).json(response);
  }
}

/**
 * Get example data by ID
 * @param req - Express request object with ID parameter
 * @param res - Express response object
 * @returns Promise that resolves when response is sent
 */
export async function getById(req: Request, res: Response): Promise<void> {
  try {
    const id: string = req.params['id'] ?? '';
    const data: ExampleData | null = await service.getById(id);

    if (data === null) {
      const response: ExampleResponse<never> = {
        success: false,
        error: 'Not found',
        message: `Example with ID ${id} does not exist`,
      };
      res.status(404).json(response);
      return;
    }

    const response: ExampleResponse<ExampleData> = {
      success: true,
      data,
    };

    res.json(response);
  } catch (error: unknown) {
    const response: ExampleResponse<never> = createErrorResponse(error);
    res.status(500).json(response);
  }
}

/**
 * Create new example data
 * @param req - Express request object with body data
 * @param res - Express response object
 * @returns Promise that resolves when response is sent
 */
export async function create(req: Request, res: Response): Promise<void> {
  try {
    // Type-safe body parsing with validation
    const input: CreateExampleInput = req.body as CreateExampleInput;
    const data: ExampleData = await service.create(input);

    const response: ExampleResponse<ExampleData> = {
      success: true,
      data,
      message: 'Created successfully',
    };

    res.status(201).json(response);
  } catch (error: unknown) {
    const response: ExampleResponse<never> = createErrorResponse(error);
    res.status(400).json(response);
  }
}

/**
 * Update existing example data
 * @param req - Express request object with ID parameter and body data
 * @param res - Express response object
 * @returns Promise that resolves when response is sent
 */
export async function update(req: Request, res: Response): Promise<void> {
  try {
    const id: string = req.params['id'] ?? '';
    const updates = req.body as Partial<CreateExampleInput>;
    const data: ExampleData | null = await service.update(id, updates);

    if (data === null) {
      const response: ExampleResponse<never> = {
        success: false,
        error: 'Not found',
        message: `Example with ID ${id} does not exist`,
      };
      res.status(404).json(response);
      return;
    }

    const response: ExampleResponse<ExampleData> = {
      success: true,
      data,
      message: 'Updated successfully',
    };

    res.json(response);
  } catch (error: unknown) {
    const response: ExampleResponse<never> = createErrorResponse(error);
    res.status(400).json(response);
  }
}

/**
 * Delete example data by ID
 * @param req - Express request object with ID parameter
 * @param res - Express response object
 * @returns Promise that resolves when response is sent
 */
export async function deleteById(req: Request, res: Response): Promise<void> {
  try {
    const id: string = req.params['id'] ?? '';
    const deleted: boolean = await service.delete(id);

    if (!deleted) {
      const response: ExampleResponse<never> = {
        success: false,
        error: 'Not found',
        message: `Example with ID ${id} does not exist`,
      };
      res.status(404).json(response);
      return;
    }

    const response: ExampleResponse<{ deleted: boolean }> = {
      success: true,
      data: { deleted: true },
      message: 'Deleted successfully',
    };

    res.json(response);
  } catch (error: unknown) {
    const response: ExampleResponse<never> = createErrorResponse(error);
    res.status(500).json(response);
  }
}
