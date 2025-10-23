/**
 * @fileoverview Type definitions for the Black-Cross threat intelligence platform.
 * 
 * This file contains all TypeScript interfaces and types used throughout the frontend application,
 * including user authentication, threat intelligence, incidents, vulnerabilities, and API responses.
 * 
 * @module types
 */

/**
 * Represents a user in the Black-Cross platform.
 * 
 * @interface User
 * @property {string} id - Unique identifier for the user
 * @property {string} email - User's email address
 * @property {string} name - User's display name
 * @property {'admin' | 'analyst' | 'viewer'} role - User's role determining access permissions
 * @property {string} createdAt - ISO 8601 timestamp of user creation
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'analyst' | 'viewer';
  createdAt: string;
}

/**
 * Represents the authentication state in the Redux store.
 * 
 * @interface AuthState
 * @property {User | null} user - Currently authenticated user, null if not logged in
 * @property {string | null} token - JWT authentication token, null if not logged in
 * @property {boolean} isAuthenticated - Flag indicating if user is authenticated
 * @property {boolean} loading - Flag indicating if authentication is in progress
 */
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

/**
 * Represents a threat intelligence indicator in the platform.
 * 
 * Contains comprehensive threat information including indicators of compromise (IOCs),
 * MITRE ATT&CK mappings, enrichment data, and relationships to other threats.
 * 
 * @interface Threat
 * @property {string} id - Unique identifier for the threat
 * @property {string} name - Human-readable name of the threat
 * @property {string} type - Type of threat (malware, phishing, ransomware, etc.)
 * @property {'critical' | 'high' | 'medium' | 'low'} severity - Severity level of the threat
 * @property {number} confidence - Confidence score (0-100) in the threat assessment
 * @property {'active' | 'archived' | 'resolved'} status - Current status of the threat
 * @property {string} description - Detailed description of the threat
 * @property {string[]} categories - Threat categories (e.g., APT, targeted attack)
 * @property {string[]} tags - User-defined tags for organization
 * @property {Indicator[]} indicators - Associated indicators of compromise
 * @property {Relationship[]} relationships - Relationships to other threats
 * @property {EnrichmentData} [enrichment] - Optional enrichment data from external sources
 * @property {MitreData} [mitre] - Optional MITRE ATT&CK framework mappings
 * @property {string} firstSeen - ISO 8601 timestamp of first observation
 * @property {string} lastSeen - ISO 8601 timestamp of last observation
 * @property {string} createdAt - ISO 8601 timestamp of record creation
 * @property {string} updatedAt - ISO 8601 timestamp of last update
 */
export interface Threat {
  id: string;
  name: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  confidence: number;
  status: 'active' | 'archived' | 'resolved';
  description: string;
  categories: string[];
  tags: string[];
  indicators: Indicator[];
  relationships: Relationship[];
  enrichment?: EnrichmentData;
  mitre?: MitreData;
  firstSeen: string;
  lastSeen: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Represents an indicator of compromise (IOC).
 * 
 * @interface Indicator
 * @property {'ip' | 'domain' | 'url' | 'hash' | 'email' | 'filename' | 'registry' | 'mutex'} type - Type of indicator
 * @property {string} value - The actual indicator value
 * @property {number} [confidence] - Optional confidence score (0-100)
 */
export interface Indicator {
  type: 'ip' | 'domain' | 'url' | 'hash' | 'email' | 'filename' | 'registry' | 'mutex';
  value: string;
  confidence?: number;
}

/**
 * Represents a relationship between threats.
 * 
 * @interface Relationship
 * @property {string} threatId - ID of the related threat
 * @property {string} relationshipType - Type of relationship (related-to, derived-from, etc.)
 * @property {number} confidence - Confidence score in the relationship (0-100)
 */
export interface Relationship {
  threatId: string;
  relationshipType: string;
  confidence: number;
}

/**
 * External enrichment data for threat intelligence.
 * 
 * Contains data from OSINT sources, geolocation, reputation services, and DNS lookups.
 * 
 * @interface EnrichmentData
 * @property {Object} [geolocation] - Geographic location information
 * @property {string} [geolocation.country] - Country code
 * @property {string} [geolocation.city] - City name
 * @property {number} [geolocation.latitude] - Latitude coordinate
 * @property {number} [geolocation.longitude] - Longitude coordinate
 * @property {Object} [reputation] - Reputation score information
 * @property {number} reputation.score - Reputation score
 * @property {string} reputation.source - Source of reputation data
 * @property {Record<string, unknown>} [osint] - Open source intelligence data
 * @property {Record<string, unknown>} [dns] - DNS resolution data
 */
export interface EnrichmentData {
  geolocation?: {
    country?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
  };
  reputation?: {
    score: number;
    source: string;
  };
  osint?: Record<string, unknown>;
  dns?: Record<string, unknown>;
}

/**
 * MITRE ATT&CK framework mappings.
 * 
 * @interface MitreData
 * @property {string[]} [tactics] - MITRE ATT&CK tactics
 * @property {string[]} [techniques] - MITRE ATT&CK techniques
 * @property {string[]} [groups] - Associated threat groups
 */
export interface MitreData {
  tactics?: string[];
  techniques?: string[];
  groups?: string[];
}

/**
 * Represents a threat taxonomy classification system.
 * 
 * @interface Taxonomy
 * @property {string} id - Unique identifier
 * @property {string} name - Taxonomy name
 * @property {string} description - Detailed description
 * @property {string} version - Version number
 * @property {TaxonomyCategory[]} categories - Hierarchical categories
 * @property {FrameworkMapping[]} frameworkMappings - Mappings to security frameworks
 * @property {string} createdAt - ISO 8601 creation timestamp
 * @property {string} updatedAt - ISO 8601 last update timestamp
 */
export interface Taxonomy {
  id: string;
  name: string;
  description: string;
  version: string;
  categories: TaxonomyCategory[];
  frameworkMappings: FrameworkMapping[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Represents a category within a taxonomy.
 * 
 * Supports hierarchical structure with parent-child relationships.
 * 
 * @interface TaxonomyCategory
 * @property {string} id - Unique identifier
 * @property {string} name - Category name
 * @property {string} description - Category description
 * @property {string} [parentId] - Optional parent category ID for hierarchy
 * @property {TaxonomyCategory[]} [children] - Optional child categories
 */
export interface TaxonomyCategory {
  id: string;
  name: string;
  description: string;
  parentId?: string;
  children?: TaxonomyCategory[];
}

/**
 * Represents a mapping to an external security framework.
 * 
 * @interface FrameworkMapping
 * @property {string} framework - Framework name (NIST, ISO27001, etc.)
 * @property {string} mappingId - Framework-specific identifier
 * @property {string} description - Mapping description
 */
export interface FrameworkMapping {
  framework: string;
  mappingId: string;
  description: string;
}

/**
 * Represents a security incident in the incident response system.
 * 
 * @interface Incident
 * @property {string} id - Unique identifier
 * @property {string} title - Incident title
 * @property {string} description - Detailed incident description
 * @property {'critical' | 'high' | 'medium' | 'low'} severity - Severity level
 * @property {'open' | 'investigating' | 'contained' | 'resolved' | 'closed'} status - Current incident status
 * @property {number} priority - Priority ranking
 * @property {string} [assignedTo] - User ID of assigned analyst
 * @property {string} createdBy - User ID of incident creator
 * @property {string[]} affectedAssets - IDs of affected assets
 * @property {TimelineEvent[]} timeline - Chronological events
 * @property {Evidence[]} evidence - Collected evidence items
 * @property {string} createdAt - ISO 8601 creation timestamp
 * @property {string} updatedAt - ISO 8601 last update timestamp
 * @property {string} [resolvedAt] - ISO 8601 resolution timestamp
 */
export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'investigating' | 'contained' | 'resolved' | 'closed';
  priority: number;
  assignedTo?: string;
  createdBy: string;
  affectedAssets: string[];
  timeline: TimelineEvent[];
  evidence: Evidence[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

/**
 * Represents an event in an incident timeline.
 * 
 * @interface TimelineEvent
 * @property {string} id - Unique identifier
 * @property {string} timestamp - ISO 8601 timestamp of the event
 * @property {string} event - Event description
 * @property {string} actor - User or system that generated the event
 * @property {string} [details] - Optional additional details
 */
export interface TimelineEvent {
  id: string;
  timestamp: string;
  event: string;
  actor: string;
  details?: string;
}

/**
 * Represents evidence collected during an incident investigation.
 * 
 * @interface Evidence
 * @property {string} id - Unique identifier
 * @property {string} type - Type of evidence (log, file, screenshot, etc.)
 * @property {string} description - Evidence description
 * @property {string} [fileUrl] - Optional URL to evidence file
 * @property {Record<string, unknown>} [metadata] - Optional additional metadata
 * @property {string} collectedAt - ISO 8601 collection timestamp
 */
export interface Evidence {
  id: string;
  type: string;
  description: string;
  fileUrl?: string;
  metadata?: Record<string, unknown>;
  collectedAt: string;
}

/**
 * Represents a security vulnerability in the system.
 * 
 * @interface Vulnerability
 * @property {string} id - Unique identifier
 * @property {string} cveId - CVE identifier (e.g., CVE-2024-1234)
 * @property {string} title - Vulnerability title
 * @property {string} description - Detailed description
 * @property {'critical' | 'high' | 'medium' | 'low'} severity - Severity level
 * @property {number} cvssScore - CVSS score (0-10)
 * @property {string[]} affectedAssets - IDs of affected assets
 * @property {boolean} patchAvailable - Whether a patch is available
 * @property {'open' | 'patched' | 'mitigated' | 'accepted'} status - Current status
 * @property {string} discoveredAt - ISO 8601 discovery timestamp
 * @property {string} updatedAt - ISO 8601 last update timestamp
 */
export interface Vulnerability {
  id: string;
  cveId: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  cvssScore: number;
  affectedAssets: string[];
  patchAvailable: boolean;
  status: 'open' | 'patched' | 'mitigated' | 'accepted';
  discoveredAt: string;
  updatedAt: string;
}

/**
 * Represents a risk assessment for an asset.
 * 
 * @interface RiskAssessment
 * @property {string} id - Unique identifier
 * @property {string} assetId - ID of the assessed asset
 * @property {string} assetName - Name of the assessed asset
 * @property {number} threatLevel - Threat level score (0-100)
 * @property {number} vulnerabilityScore - Vulnerability score (0-100)
 * @property {number} riskScore - Calculated risk score (0-100)
 * @property {number} impactScore - Impact score (0-100)
 * @property {number} likelihood - Likelihood score (0-100)
 * @property {string[]} recommendations - Risk mitigation recommendations
 * @property {string} assessedAt - ISO 8601 assessment timestamp
 * @property {string} assessedBy - User ID of assessor
 */
export interface RiskAssessment {
  id: string;
  assetId: string;
  assetName: string;
  threatLevel: number;
  vulnerabilityScore: number;
  riskScore: number;
  impactScore: number;
  likelihood: number;
  recommendations: string[];
  assessedAt: string;
  assessedBy: string;
}

/**
 * Represents an Indicator of Compromise (IOC).
 * 
 * @interface IoC
 * @property {string} id - Unique identifier
 * @property {'ip' | 'domain' | 'url' | 'hash' | 'email'} type - IOC type
 * @property {string} value - The IOC value
 * @property {number} confidence - Confidence score (0-100)
 * @property {'active' | 'inactive' | 'expired'} status - Current status
 * @property {string} source - Source of the IOC
 * @property {string[]} tags - Classification tags
 * @property {string} firstSeen - ISO 8601 first observation timestamp
 * @property {string} lastSeen - ISO 8601 last observation timestamp
 * @property {string} [expiresAt] - Optional ISO 8601 expiration timestamp
 */
export interface IoC {
  id: string;
  type: 'ip' | 'domain' | 'url' | 'hash' | 'email';
  value: string;
  confidence: number;
  status: 'active' | 'inactive' | 'expired';
  source: string;
  tags: string[];
  firstSeen: string;
  lastSeen: string;
  expiresAt?: string;
}

/**
 * Represents a threat actor profile.
 * 
 * @interface ThreatActor
 * @property {string} id - Unique identifier
 * @property {string} name - Primary name/designation
 * @property {string[]} aliases - Known aliases
 * @property {string} description - Detailed description
 * @property {'low' | 'medium' | 'high' | 'advanced'} sophistication - Sophistication level
 * @property {string[]} motivation - Known motivations
 * @property {string[]} targetSectors - Targeted industry sectors
 * @property {string[]} ttps - Tactics, Techniques, and Procedures
 * @property {string[]} campaigns - Associated campaigns
 * @property {boolean} active - Whether currently active
 * @property {string} createdAt - ISO 8601 creation timestamp
 * @property {string} updatedAt - ISO 8601 last update timestamp
 */
export interface ThreatActor {
  id: string;
  name: string;
  aliases: string[];
  description: string;
  sophistication: 'low' | 'medium' | 'high' | 'advanced';
  motivation: string[];
  targetSectors: string[];
  ttps: string[];
  campaigns: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Standard API response wrapper.
 * 
 * @template T - The type of data in the response
 * @interface ApiResponse
 * @property {boolean} success - Whether the request was successful
 * @property {T} [data] - Response data if successful
 * @property {string} [error] - Error message if failed
 * @property {string} [message] - Additional message
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Paginated API response wrapper.
 * 
 * @template T - The type of items in the response
 * @interface PaginatedResponse
 * @property {boolean} success - Whether the request was successful
 * @property {T[]} data - Array of items
 * @property {Object} pagination - Pagination metadata
 * @property {number} pagination.page - Current page number
 * @property {number} pagination.perPage - Items per page
 * @property {number} pagination.total - Total number of items
 * @property {number} pagination.pages - Total number of pages
 */
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    pages: number;
  };
}

/**
 * Filter and query options for data requests.
 * 
 * @interface FilterOptions
 * @property {string} [search] - Search query string
 * @property {string} [status] - Filter by status
 * @property {string} [severity] - Filter by severity level
 * @property {string} [dateFrom] - Filter by start date (ISO 8601)
 * @property {string} [dateTo] - Filter by end date (ISO 8601)
 * @property {string[]} [tags] - Filter by tags
 * @property {number} [page] - Page number for pagination
 * @property {number} [perPage] - Items per page
 * @property {string} [sortBy] - Field to sort by
 * @property {'asc' | 'desc'} [sortOrder] - Sort order
 */
export interface FilterOptions {
  search?: string;
  status?: string;
  severity?: string;
  dateFrom?: string;
  dateTo?: string;
  tags?: string[];
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
