/**
 * Validation Constants
 * Input validation rules and patterns
 */

/**
 * Length Constraints
 */
export const LENGTH_CONSTRAINTS = {
  // Authentication
  PASSWORD_MIN: 8,
  PASSWORD_MAX: 128,
  USERNAME_MIN: 3,
  USERNAME_MAX: 50,
  EMAIL_MAX: 255,

  // General
  NAME_MIN: 2,
  NAME_MAX: 100,
  TITLE_MIN: 3,
  TITLE_MAX: 200,
  DESCRIPTION_MIN: 10,
  DESCRIPTION_MAX: 5000,
  COMMENT_MIN: 1,
  COMMENT_MAX: 1000,
  TAG_MIN: 2,
  TAG_MAX: 30,
  MAX_TAGS: 10,

  // Technical
  URL_MAX: 2000,
  IP_ADDRESS_MAX: 45, // IPv6
  HASH_MD5: 32,
  HASH_SHA1: 40,
  HASH_SHA256: 64,
  HASH_SHA512: 128,
  CVE_ID: 13, // CVE-2023-12345
} as const;

/**
 * Regex Patterns
 */
export const PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  USERNAME: /^[a-zA-Z0-9_-]+$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  IPV4: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  IPV6: /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/,
  DOMAIN: /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i,
  MD5: /^[a-f0-9]{32}$/i,
  SHA1: /^[a-f0-9]{40}$/i,
  SHA256: /^[a-f0-9]{64}$/i,
  SHA512: /^[a-f0-9]{128}$/i,
  CVE: /^CVE-\d{4}-\d{4,7}$/,
  PHONE: /^\+?[1-9]\d{1,14}$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
} as const;

/**
 * Numeric Constraints
 */
export const NUMERIC_CONSTRAINTS = {
  PORT_MIN: 1,
  PORT_MAX: 65535,
  SEVERITY_MIN: 0,
  SEVERITY_MAX: 10,
  CVSS_MIN: 0,
  CVSS_MAX: 10,
  RISK_SCORE_MIN: 0,
  RISK_SCORE_MAX: 100,
  CONFIDENCE_MIN: 0,
  CONFIDENCE_MAX: 100,
  PRIORITY_MIN: 1,
  PRIORITY_MAX: 5,
} as const;

/**
 * File Upload Constraints
 */
export const FILE_CONSTRAINTS = {
  MAX_SIZE: 100 * 1024 * 1024, // 100MB
  MAX_SIZE_LABEL: '100MB',
  MALWARE_MAX_SIZE: 50 * 1024 * 1024, // 50MB for malware samples
  ALLOWED_MIME_TYPES: {
    IMAGES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    DOCUMENTS: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
    CSV: ['text/csv', 'application/vnd.ms-excel'],
    JSON: ['application/json'],
    XML: ['application/xml', 'text/xml'],
    TEXT: ['text/plain'],
    MALWARE: ['application/octet-stream', 'application/x-executable'],
  },
  ALLOWED_EXTENSIONS: {
    IMAGES: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    DOCUMENTS: ['.pdf', '.doc', '.docx', '.xls', '.xlsx'],
    CSV: ['.csv'],
    JSON: ['.json'],
    XML: ['.xml'],
    TEXT: ['.txt', '.log'],
    MALWARE: ['.exe', '.dll', '.bin', '.dat'],
  },
} as const;

/**
 * Search Constraints
 */
export const SEARCH_CONSTRAINTS = {
  MIN_LENGTH: 2,
  MAX_LENGTH: 200,
  MAX_RESULTS: 100,
  DEBOUNCE_MS: 300,
} as const;

/**
 * Threat Intelligence Constraints
 */
export const THREAT_CONSTRAINTS = {
  MAX_INDICATORS: 1000,
  MAX_TAGS: 20,
  MAX_MITRE_TACTICS: 10,
  MAX_RELATIONSHIPS: 50,
} as const;
