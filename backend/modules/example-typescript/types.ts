/**
 * Example TypeScript Module - Type Definitions
 * This demonstrates TypeScript best practices including:
 * - Explicit type annotations
 * - Readonly properties for immutability
 * - Discriminated unions for type safety
 * - String literal unions instead of enums
 * - JSDoc comments for documentation
 */

/**
 * Status type using string literal union for type safety
 * Prefer string literal unions over enums for better type narrowing
 */
export type ExampleStatus = 'active' | 'inactive';

/**
 * Example data entity
 * Uses readonly properties to enforce immutability
 */
export interface ExampleData {
  readonly id: string;
  readonly name: string;
  readonly status: ExampleStatus;
  readonly createdAt: Date;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

/**
 * Query parameters for filtering example data
 * All fields are optional with explicit types
 */
export interface ExampleQuery {
  readonly status?: ExampleStatus;
  readonly search?: string;
  readonly limit?: number;
}

/**
 * API response using discriminated union for type safety
 * This allows TypeScript to narrow types based on the success field
 */
export type ExampleResponse<T = ExampleData> =
  | {
      readonly success: true;
      readonly data: T;
      readonly message?: string;
    }
  | {
      readonly success: false;
      readonly error: string;
      readonly message?: string;
    };

/**
 * Create data input type using utility types
 * Omit is used to exclude fields that are auto-generated
 */
export type CreateExampleInput = Omit<ExampleData, 'id' | 'createdAt'>;

/**
 * Update data input type using utility types
 * Partial makes all fields optional, Pick selects specific fields
 */
export type UpdateExampleInput = Partial<Pick<ExampleData, 'name' | 'status' | 'metadata'>>;

/**
 * Type guard to check if data has active status
 * @param data - Example data to check
 * @returns True if the data status is active
 */
export function isActiveExample(data: ExampleData): data is ExampleData & { status: 'active' } {
  return data.status === 'active';
}
