/**
 * Database Constants
 * Database-related constants and configurations
 */

/**
 * Database Names
 */
export const DATABASE_NAMES = {
  MAIN: 'blackcross',
  TEST: 'blackcross_test',
  ANALYTICS: 'blackcross_analytics',
} as const;

/**
 * Collection/Table Names
 */
export const COLLECTIONS = {
  USERS: 'users',
  THREATS: 'threats',
  INCIDENTS: 'incidents',
  VULNERABILITIES: 'vulnerabilities',
  IOCS: 'iocs',
  THREAT_ACTORS: 'threat_actors',
  THREAT_FEEDS: 'threat_feeds',
  PLAYBOOKS: 'playbooks',
  PLAYBOOK_EXECUTIONS: 'playbook_executions',
  INTEGRATIONS: 'integrations',
  WORKSPACES: 'workspaces',
  REPORTS: 'reports',
  COMPLIANCE_FRAMEWORKS: 'compliance_frameworks',
  MALWARE_SAMPLES: 'malware_samples',
  DARK_WEB_INTEL: 'dark_web_intel',
  SIEM_EVENTS: 'siem_events',
  HUNT_SESSIONS: 'hunt_sessions',
  RISK_ASSESSMENTS: 'risk_assessments',
  AUDIT_LOGS: 'audit_logs',
  SESSIONS: 'sessions',
  API_KEYS: 'api_keys',
} as const;

/**
 * Database Connection Pool Sizes
 */
export const CONNECTION_POOL = {
  MONGODB: {
    MIN: 2,
    MAX: 10,
  },
  POSTGRESQL: {
    MIN: 2,
    MAX: 20,
  },
  REDIS: {
    MIN: 1,
    MAX: 5,
  },
} as const;

/**
 * Database Timeout Values (in milliseconds)
 */
export const DB_TIMEOUTS = {
  CONNECT: 10000,      // 10 seconds
  QUERY: 30000,        // 30 seconds
  TRANSACTION: 60000,  // 1 minute
  IDLE: 300000,        // 5 minutes
} as const;

/**
 * Index Names
 */
export const INDEXES = {
  USERS_EMAIL: 'idx_users_email',
  THREATS_TYPE: 'idx_threats_type',
  INCIDENTS_STATUS: 'idx_incidents_status',
  IOCS_INDICATOR: 'idx_iocs_indicator',
  AUDIT_TIMESTAMP: 'idx_audit_timestamp',
} as const;

/**
 * Query Limits
 */
export const QUERY_LIMITS = {
  DEFAULT: 20,
  MAX: 1000,
  BULK_INSERT: 1000,
  EXPORT: 10000,
} as const;
