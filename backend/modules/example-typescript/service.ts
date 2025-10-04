/**
 * Example TypeScript Module - Service Layer
 * This demonstrates business logic with type safety
 */

import { ExampleData, ExampleQuery } from './types';

export class ExampleService {
  /**
   * Get example data with optional filtering
   */
  async getData(query: ExampleQuery): Promise<ExampleData[]> {
    // Mock implementation - in real module, this would use Prisma or MongoDB
    const mockData: ExampleData[] = [
      {
        id: '1',
        name: 'Example 1',
        status: 'active',
        createdAt: new Date(),
      },
      {
        id: '2',
        name: 'Example 2',
        status: 'inactive',
        createdAt: new Date(),
      },
    ];

    // Apply filters
    let filtered = mockData;
    if (query.status) {
      filtered = filtered.filter((item) => item.status === query.status);
    }
    if (query.search) {
      filtered = filtered.filter((item) => item.name.toLowerCase().includes(query.search!.toLowerCase()));
    }
    if (query.limit) {
      filtered = filtered.slice(0, query.limit);
    }

    return filtered;
  }

  /**
   * Get example data by ID
   */
  async getById(id: string): Promise<ExampleData | null> {
    // Mock implementation
    if (id === '1') {
      return {
        id: '1',
        name: 'Example 1',
        status: 'active',
        createdAt: new Date(),
      };
    }
    return null;
  }

  /**
   * Create new example data
   */
  async create(data: Omit<ExampleData, 'id' | 'createdAt'>): Promise<ExampleData> {
    // Mock implementation
    return {
      id: Math.random().toString(36).substr(2, 9),
      ...data,
      createdAt: new Date(),
    };
  }
}
