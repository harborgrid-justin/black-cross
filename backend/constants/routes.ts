/**
 * API Routes Constants
 * Centralized route paths for the Black-Cross platform
 */

/**
 * API version prefix
 */
export const API_VERSION = '/api/v1' as const;

/**
 * Base routes
 */
export const ROUTES = {
  ROOT: '/',
  HEALTH: '/health',
  API_ROOT: API_VERSION,
  API_DOCS: `${API_VERSION}/docs`,
} as const;

/**
 * Module route paths
 */
export const MODULE_ROUTES = {
  THREAT_INTELLIGENCE: `${API_VERSION}/threat-intelligence`,
  INCIDENT_RESPONSE: `${API_VERSION}/incident-response`,
  THREAT_HUNTING: `${API_VERSION}/threat-hunting`,
  VULNERABILITY_MANAGEMENT: `${API_VERSION}/vulnerability-management`,
  SIEM: `${API_VERSION}/siem`,
  THREAT_ACTORS: `${API_VERSION}/threat-actors`,
  IOC_MANAGEMENT: `${API_VERSION}/ioc-management`,
  THREAT_FEEDS: `${API_VERSION}/threat-feeds`,
  RISK_ASSESSMENT: `${API_VERSION}/risk-assessment`,
  COLLABORATION: `${API_VERSION}/collaboration`,
  REPORTING: `${API_VERSION}/reporting`,
  MALWARE_ANALYSIS: `${API_VERSION}/malware-analysis`,
  DARK_WEB: `${API_VERSION}/dark-web`,
  COMPLIANCE: `${API_VERSION}/compliance`,
  AUTOMATION: `${API_VERSION}/automation`,
} as const;

/**
 * Common route patterns
 */
export const ROUTE_PATTERNS = {
  BY_ID: '/:id',
  SEARCH: '/search',
  EXPORT: '/export',
  STATS: '/stats',
  METRICS: '/metrics',
  SETTINGS: '/settings',
} as const;

/**
 * All module names
 */
export const MODULE_NAMES = {
  THREAT_INTELLIGENCE: 'threatIntelligence',
  INCIDENT_RESPONSE: 'incidentResponse',
  THREAT_HUNTING: 'threatHunting',
  VULNERABILITY_MANAGEMENT: 'vulnerabilityManagement',
  SIEM: 'siem',
  THREAT_ACTORS: 'threatActors',
  IOC_MANAGEMENT: 'iocManagement',
  THREAT_FEEDS: 'threatFeeds',
  RISK_ASSESSMENT: 'riskAssessment',
  COLLABORATION: 'collaboration',
  REPORTING: 'reporting',
  MALWARE_ANALYSIS: 'malwareAnalysis',
  DARK_WEB: 'darkWeb',
  COMPLIANCE: 'compliance',
  AUTOMATION: 'automation',
} as const;
