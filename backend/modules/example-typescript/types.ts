/**
 * Example TypeScript Module - Type Definitions
 * This demonstrates the TypeScript migration pattern
 */

export interface ExampleData {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  metadata?: Record<string, unknown>;
}

export interface ExampleQuery {
  status?: 'active' | 'inactive';
  search?: string;
  limit?: number;
}

export interface ExampleResponse {
  success: boolean;
  data?: ExampleData | ExampleData[];
  message?: string;
  error?: string;
}
