/**
 * Repository Index
 * Central export point for all Prisma repositories
 */

export { userRepository } from './UserRepository';
export { incidentRepository } from './IncidentRepository';

// Export types
export type { User, Incident, Vulnerability, Asset, AuditLog } from '../utils/prisma';
export type { ListFilters, PaginatedResponse } from '../utils/BaseRepository';
