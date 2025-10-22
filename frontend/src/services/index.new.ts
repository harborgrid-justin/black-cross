/**
 * WF-IDX-003 | index.ts - Services module exports
 * Purpose: Centralized exports for all service modules
 * Last Updated: 2025-10-22 | File Type: .ts
 */

// ==========================================
// CORE INFRASTRUCTURE EXPORTS
// ==========================================

// API configuration and instance
export {
  apiInstance,
  tokenUtils,
  API_CONFIG,
} from './config/apiConfig';

// ==========================================
// UTILITY EXPORTS
// ==========================================

export {
  handleApiError,
  extractApiData,
  extractApiDataOptional,
  buildUrlParams,
  buildPaginationParams,
  formatDateForApi,
  parseDateFromApi,
  withRetry,
  createFormData,
  isApiResponse,
  isPaginatedResponse,
  apiCache,
  withCache,
  debounce,
} from './utils/apiUtils';

// ==========================================
// TYPE EXPORTS
// ==========================================

export type { ApiError } from './utils/apiUtils';
export * from './types';

// ==========================================
// CORE SERVICE EXPORTS
// ==========================================

export * from './core';

// ==========================================
// DOMAIN-SPECIFIC API EXPORTS
// ==========================================

// Threat Intelligence API (New structured implementation)
export { threatIntelligenceApi } from './modules/threatIntelligenceApi';
export type { 
  ThreatIntelligenceApi, 
  ThreatFilters, 
  CreateThreatData, 
  UpdateThreatData,
  ThreatStatistics,
} from './modules/threatIntelligenceApi';

// ==========================================
// LEGACY SERVICE EXPORTS (Backward Compatibility)
// ==========================================

// Keep existing service exports for backward compatibility
export { apiClient } from './api';
export { authService } from './authService';
export { threatService } from './threatService';
export { incidentService } from './incidentService';
export { vulnerabilityService } from './vulnerabilityService';
export { iocService } from './iocService';
export { actorService } from './actorService';
export { feedService } from './feedService';
export { siemService } from './siemService';
export { huntingService } from './huntingService';
export { riskService } from './riskService';
export { malwareService } from './malwareService';
export { darkWebService } from './darkWebService';
export { complianceService } from './complianceService';
export { collaborationService } from './collaborationService';
export { reportingService } from './reportingService';
export { playbookService } from './playbookService';
export { dashboardService } from './dashboardService';
