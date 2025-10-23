/**
 * Services Index
 * Central export point for all production-grade Sequelize-based services
 *
 * These services demonstrate the proper pattern for CRUD operations using
 * Sequelize repositories with PostgreSQL database.
 */

export { vulnerabilityService, VulnerabilityService } from './VulnerabilityService';
export { assetService, AssetService } from './AssetService';
export { iocService, IOCService } from './IOCService';
export { threatActorService, ThreatActorService } from './ThreatActorService';
export { auditLogService, AuditLogService } from './AuditLogService';
export { playbookExecutionService, PlaybookExecutionService } from './PlaybookExecutionService';

// Export types from repositories
export type {
  Vulnerability,
  Asset,
  IOC,
  ThreatActor,
  AuditLog,
  PlaybookExecution,
  ListFilters,
  PaginatedResponse,
} from '../repositories';
