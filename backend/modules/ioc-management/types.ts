/**
 * IoC Management Type Definitions
 * Comprehensive types for Indicator of Compromise management
 */

/**
 * Supported IoC types
 */
export type IoCType = 
  | 'ip' 
  | 'domain' 
  | 'md5' 
  | 'sha1' 
  | 'sha256' 
  | 'url' 
  | 'email' 
  | 'cve' 
  | 'registry_key' 
  | 'file_path'
  | 'mutex'
  | 'user_agent';

/**
 * IoC lifecycle status
 */
export type IoCStatus = 
  | 'active' 
  | 'expired' 
  | 'false_positive' 
  | 'whitelisted' 
  | 'reviewing'
  | 'archived';

/**
 * IoC source type
 */
export interface IoCSource {
  readonly name: string;
  readonly reliability: number; // 0-100
  readonly sourceType: 'commercial' | 'open_source' | 'internal' | 'community';
  readonly url?: string;
}

/**
 * File hash information
 */
export interface FileHashes {
  readonly md5?: string;
  readonly sha1?: string;
  readonly sha256?: string;
  readonly ssdeep?: string;
}

/**
 * IoC validation result
 */
export interface ValidationResult {
  readonly ioc: string;
  readonly type: IoCType;
  readonly valid: boolean;
  readonly normalizedValue?: string;
  readonly errors: readonly string[];
}

/**
 * Enrichment data from external sources
 */
export interface EnrichmentData {
  readonly virustotal?: {
    readonly malicious: number;
    readonly suspicious: number;
    readonly harmless: number;
    readonly lastAnalysisDate: Date;
    readonly reputation: number;
  };
  readonly abuseipdb?: {
    readonly abuseConfidenceScore: number;
    readonly totalReports: number;
    readonly lastReportedAt: Date;
    readonly country: string;
  };
  readonly whois?: {
    readonly registrar: string;
    readonly createdDate: Date;
    readonly expiresDate: Date;
    readonly registrant: string;
    readonly country: string;
  };
  readonly geolocation?: {
    readonly country: string;
    readonly city: string;
    readonly latitude: number;
    readonly longitude: number;
    readonly asn: string;
    readonly isp: string;
  };
}

/**
 * Complete IoC data structure
 */
export interface IoC {
  readonly id: string;
  readonly value: string;
  readonly type: IoCType;
  readonly normalizedValue: string;
  readonly status: IoCStatus;
  readonly confidence: number; // 0-100
  readonly severity: 'critical' | 'high' | 'medium' | 'low';
  readonly tags: readonly string[];
  readonly sources: readonly IoCSource[];
  readonly firstSeen: Date;
  readonly lastSeen: Date;
  readonly expiresAt?: Date;
  readonly enrichment?: EnrichmentData;
  readonly metadata: Record<string, any>;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly createdBy: string;
}

/**
 * IoC creation input
 */
export interface CreateIoCInput {
  readonly value: string;
  readonly type?: IoCType; // Auto-detected if not provided
  readonly confidence?: number;
  readonly severity?: 'critical' | 'high' | 'medium' | 'low';
  readonly tags?: readonly string[];
  readonly source: IoCSource;
  readonly metadata?: Record<string, any>;
}

/**
 * IoC update input
 */
export interface UpdateIoCInput {
  readonly status?: IoCStatus;
  readonly confidence?: number;
  readonly severity?: 'critical' | 'high' | 'medium' | 'low';
  readonly tags?: readonly string[];
  readonly expiresAt?: Date;
  readonly metadata?: Record<string, any>;
}

/**
 * IoC search query
 */
export interface IoCSearchQuery {
  readonly text?: string;
  readonly types?: readonly IoCType[];
  readonly tags?: readonly string[];
  readonly confidence?: {
    readonly min: number;
    readonly max: number;
  };
  readonly dateRange?: {
    readonly start: Date;
    readonly end: Date;
    readonly field: 'firstSeen' | 'lastSeen' | 'createdAt';
  };
  readonly status?: readonly IoCStatus[];
  readonly sources?: readonly string[];
  readonly severity?: readonly string[];
  readonly limit?: number;
  readonly offset?: number;
  readonly sortBy?: string;
  readonly sortOrder?: 'asc' | 'desc';
}

/**
 * Bulk import result
 */
export interface ImportResult {
  readonly total: number;
  readonly successful: number;
  readonly failed: number;
  readonly duplicates: number;
  readonly errors: readonly ImportError[];
}

/**
 * Import error
 */
export interface ImportError {
  readonly line: number;
  readonly ioc: string;
  readonly error: string;
}

/**
 * Parsed IoC with metadata
 */
export interface ParsedIoC {
  readonly originalValue: string;
  readonly type: IoCType;
  readonly normalizedValue: string;
  readonly defanged: string;
  readonly metadata: Record<string, any>;
}

/**
 * Confidence calculation factors
 */
export interface ConfidenceFactors {
  readonly sourceReliability: number;
  readonly ageOfIoC: number;
  readonly numberOfSources: number;
  readonly validationResults: number;
  readonly falsePositiveHistory: number;
}

/**
 * IoC statistics
 */
export interface IoCStatistics {
  readonly total: number;
  readonly byType: Record<IoCType, number>;
  readonly byStatus: Record<IoCStatus, number>;
  readonly bySeverity: Record<string, number>;
  readonly recentlyAdded: number;
  readonly expiringSoon: number;
}

/**
 * Service response wrapper
 */
export type IoCResponse<T> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: string };

/**
 * Type guard for error objects
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

/**
 * Type guard for IoC type
 */
export function isValidIoCType(type: string): type is IoCType {
  const validTypes: readonly IoCType[] = [
    'ip', 'domain', 'md5', 'sha1', 'sha256', 'url', 'email', 
    'cve', 'registry_key', 'file_path', 'mutex', 'user_agent'
  ];
  return validTypes.includes(type as IoCType);
}

/**
 * Type guard for IoC status
 */
export function isValidIoCStatus(status: string): status is IoCStatus {
  const validStatuses: readonly IoCStatus[] = [
    'active', 'expired', 'false_positive', 'whitelisted', 'reviewing', 'archived'
  ];
  return validStatuses.includes(status as IoCStatus);
}
