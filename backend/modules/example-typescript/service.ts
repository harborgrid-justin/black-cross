/**
 * Example TypeScript Module - Service Layer
 * Demonstrates TypeScript best practices:
 * - Explicit return type annotations
 * - Proper error handling with type guards
 * - Use of readonly for data immutability
 * - Optional chaining and nullish coalescing
 * - Utility types for type transformations
 */

import type {
  ExampleData, ExampleQuery, CreateExampleInput, UpdateExampleInput,
} from './types';

/**
 * Service class for managing example data
 * Demonstrates business logic with comprehensive type safety
 */
// eslint-disable-next-line import/prefer-default-export
export class ExampleService {
  /**
   * Mock data store - in production, this would use Sequelize or MongoDB
   */
  private readonly mockDataStore: ExampleData[] = [
    {
      id: '1',
      name: 'Example 1',
      status: 'active',
      createdAt: new Date('2024-01-01'),
    },
    {
      id: '2',
      name: 'Example 2',
      status: 'inactive',
      createdAt: new Date('2024-01-02'),
    },
  ];

  /**
   * Get example data with optional filtering
   * @param query - Query parameters for filtering
   * @returns Promise resolving to array of filtered example data
   */
  public async getData(query: ExampleQuery): Promise<readonly ExampleData[]> {
    // Apply filters with explicit type checking
    let filtered: readonly ExampleData[] = [...this.mockDataStore];

    // Use optional chaining and type guards for safe property access
    if (query.status !== undefined) {
      filtered = filtered.filter((item): boolean => item.status === query.status);
    }

    if (query.search !== undefined && query.search.length > 0) {
      const searchLower: string = query.search.toLowerCase();
      filtered = filtered.filter((item): boolean => item.name.toLowerCase().includes(searchLower));
    }

    // Use nullish coalescing for default values
    const limit: number = query.limit ?? filtered.length;
    filtered = filtered.slice(0, limit);

    return Promise.resolve(filtered);
  }

  /**
   * Get example data by ID
   * @param id - Unique identifier of the example data
   * @returns Promise resolving to example data or null if not found
   * @throws Error if ID is empty or invalid
   */
  public getById(id: string): Promise<ExampleData | null> {
    // Validate input
    if (!id || id.trim().length === 0) {
      throw new Error('ID must not be empty');
    }

    // Use optional chaining and nullish coalescing
    const found: ExampleData | undefined = this.mockDataStore.find(
      (item): boolean => item.id === id,
    );

    return Promise.resolve(found ?? null);
  }

  /**
   * Create new example data
   * @param input - Data for creating new example
   * @returns Promise resolving to created example data
   * @throws Error if input validation fails
   */
  public create(input: CreateExampleInput): Promise<ExampleData> {
    // Validate input
    if (!input.name || input.name.trim().length === 0) {
      throw new Error('Name must not be empty');
    }

    // Create new data with generated fields
    const newData: ExampleData = {
      id: this.generateId(),
      ...input,
      createdAt: new Date(),
    };

    return Promise.resolve(newData);
  }

  /**
   * Update existing example data
   * @param id - Unique identifier of the example data
   * @param updates - Partial data to update
   * @returns Promise resolving to updated example data or null if not found
   * @throws Error if ID is empty or updates are invalid
   */
  public async update(id: string, updates: UpdateExampleInput): Promise<ExampleData | null> {
    // Validate input
    if (!id || id.trim().length === 0) {
      throw new Error('ID must not be empty');
    }

    const existing: ExampleData | null = await this.getById(id);
    if (existing === null) {
      return null;
    }

    // Merge updates with existing data
    const updated: ExampleData = {
      ...existing,
      ...updates,
    };

    return updated;
  }

  /**
   * Delete example data by ID
   * @param id - Unique identifier of the example data
   * @returns Promise resolving to true if deleted, false if not found
   * @throws Error if ID is empty
   */
  public async delete(id: string): Promise<boolean> {
    if (!id || id.trim().length === 0) {
      throw new Error('ID must not be empty');
    }

    const existing: ExampleData | null = await this.getById(id);
    return existing !== null;
  }

  /**
   * Generate a unique ID
   * @returns A unique identifier string
   */
  // eslint-disable-next-line class-methods-use-this
  private generateId(): string {
    return Math.random().toString(36).substring(2, 11);
  }
}
