/**
 * Express Type Extensions
 * Augments Express types with custom properties
 */

declare namespace Express {
  interface Request {
    user?: {
      id: string;
      email: string;
      role: string;
      [key: string]: unknown;
    };
    correlationId?: string;
  }
}
