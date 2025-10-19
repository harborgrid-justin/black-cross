/**
 * SIEM Integration Type Definitions
 * Comprehensive types for Security Information and Event Management
 */

/**
 * Log source types
 */
export type LogSourceType =
  | 'syslog'
  | 'json'
  | 'cef'
  | 'leef'
  | 'windows_event'
  | 'apache'
  | 'nginx'
  | 'firewall'
  | 'ids_ips'
  | 'custom';

/**
 * Event severity levels
 */
export type EventSeverity =
  | 'critical'
  | 'high'
  | 'medium'
  | 'low'
  | 'info';

/**
 * Alert status
 */
export type AlertStatus =
  | 'open'
  | 'investigating'
  | 'resolved'
  | 'false_positive'
  | 'closed';

/**
 * Detection rule type
 */
export type RuleType =
  | 'correlation'
  | 'threshold'
  | 'anomaly'
  | 'pattern_match'
  | 'behavioral';

/**
 * Normalized log event structure
 */
export interface NormalizedEvent {
  readonly id: string;
  readonly timestamp: Date;
  readonly sourceType: LogSourceType;
  readonly sourceIp?: string;
  readonly destIp?: string;
  readonly sourcePort?: number;
  readonly destPort?: number;
  readonly protocol?: string;
  readonly action?: string;
  readonly outcome?: 'success' | 'failure' | 'unknown';
  readonly severity: EventSeverity;
  readonly category: string;
  readonly eventType: string;
  readonly message: string;
  readonly rawLog: string;
  readonly userId?: string;
  readonly username?: string;
  readonly hostname?: string;
  readonly processName?: string;
  readonly processId?: number;
  readonly parentProcessId?: number;
  readonly commandLine?: string;
  readonly fileHash?: string;
  readonly fileName?: string;
  readonly filePath?: string;
  readonly registryKey?: string;
  readonly url?: string;
  readonly domain?: string;
  readonly tags: readonly string[];
  readonly metadata: Record<string, any>;
  readonly correlationId?: string;
  readonly normalized: boolean;
}

/**
 * Log parsing result
 */
export interface ParsingResult {
  readonly success: boolean;
  readonly event?: NormalizedEvent;
  readonly error?: string;
  readonly sourceType: LogSourceType;
}

/**
 * Detection rule definition
 */
export interface DetectionRule {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly type: RuleType;
  readonly enabled: boolean;
  readonly severity: EventSeverity;
  readonly conditions: RuleCondition[];
  readonly timeWindow?: number; // seconds
  readonly threshold?: number;
  readonly actions: RuleAction[];
  readonly tags: readonly string[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly createdBy: string;
}

/**
 * Rule condition
 */
export interface RuleCondition {
  readonly field: string;
  readonly operator: 'equals' | 'contains' | 'regex' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'not_in';
  readonly value: any;
  readonly logicalOperator?: 'AND' | 'OR';
}

/**
 * Rule action
 */
export interface RuleAction {
  readonly type: 'alert' | 'email' | 'webhook' | 'log' | 'block';
  readonly config: Record<string, any>;
}

/**
 * Alert data structure
 */
export interface Alert {
  readonly id: string;
  readonly ruleId: string;
  readonly ruleName: string;
  readonly severity: EventSeverity;
  readonly status: AlertStatus;
  readonly title: string;
  readonly description: string;
  readonly events: readonly string[]; // Event IDs
  readonly triggeredAt: Date;
  readonly acknowledgedAt?: Date;
  readonly acknowledgedBy?: string;
  readonly resolvedAt?: Date;
  readonly resolvedBy?: string;
  readonly tags: readonly string[];
  readonly metadata: Record<string, any>;
}

/**
 * Correlation pattern
 */
export interface CorrelationPattern {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly eventTypes: readonly string[];
  readonly timeWindow: number; // seconds
  readonly minimumEvents: number;
  readonly conditions: Record<string, any>;
  readonly severity: EventSeverity;
}

/**
 * Event correlation result
 */
export interface CorrelationResult {
  readonly correlationId: string;
  readonly pattern: CorrelationPattern;
  readonly events: readonly NormalizedEvent[];
  readonly matchedAt: Date;
  readonly confidence: number;
  readonly severity: EventSeverity;
}

/**
 * Dashboard widget data
 */
export interface DashboardWidget {
  readonly id: string;
  readonly type: 'chart' | 'table' | 'metric' | 'timeline' | 'map';
  readonly title: string;
  readonly query: DashboardQuery;
  readonly refreshInterval?: number; // seconds
  readonly size: { readonly width: number; readonly height: number };
  readonly position: { readonly x: number; readonly y: number };
}

/**
 * Dashboard query
 */
export interface DashboardQuery {
  readonly timeRange: {
    readonly start: Date;
    readonly end: Date;
  };
  readonly filters?: Record<string, any>;
  readonly aggregation?: {
    readonly field: string;
    readonly function: 'count' | 'sum' | 'avg' | 'min' | 'max';
    readonly groupBy?: string;
  };
  readonly limit?: number;
}

/**
 * Forensic search query
 */
export interface ForensicQuery {
  readonly query: string;
  readonly timeRange: {
    readonly start: Date;
    readonly end: Date;
  };
  readonly filters?: {
    readonly sourceIp?: string;
    readonly destIp?: string;
    readonly username?: string;
    readonly hostname?: string;
    readonly eventType?: string;
    readonly severity?: readonly EventSeverity[];
  };
  readonly limit?: number;
  readonly offset?: number;
  readonly sortBy?: string;
  readonly sortOrder?: 'asc' | 'desc';
}

/**
 * Event timeline
 */
export interface EventTimeline {
  readonly events: readonly NormalizedEvent[];
  readonly startTime: Date;
  readonly endTime: Date;
  readonly totalEvents: number;
  readonly uniqueHosts: number;
  readonly uniqueUsers: number;
  readonly byCategory: Record<string, number>;
  readonly bySeverity: Record<string, number>;
}

/**
 * Compliance report data
 */
export interface ComplianceReport {
  readonly id: string;
  readonly framework: string;
  readonly period: {
    readonly start: Date;
    readonly end: Date;
  };
  readonly controls: readonly {
    readonly controlId: string;
    readonly controlName: string;
    readonly status: 'compliant' | 'non_compliant' | 'partially_compliant';
    readonly evidence: readonly string[];
    readonly score: number;
  }[];
  readonly overallScore: number;
  readonly generatedAt: Date;
}

/**
 * Alert tuning configuration
 */
export interface AlertTuning {
  readonly ruleId: string;
  readonly suppressionRules: readonly {
    readonly field: string;
    readonly operator: string;
    readonly value: any;
    readonly duration: number; // seconds
  }[];
  readonly severityAdjustment?: {
    readonly conditions: readonly RuleCondition[];
    readonly newSeverity: EventSeverity;
  }[];
  readonly whitelistEntries: readonly {
    readonly field: string;
    readonly value: any;
    readonly reason: string;
    readonly expiresAt?: Date;
  }[];
}

/**
 * Log collection statistics
 */
export interface LogStatistics {
  readonly totalEvents: number;
  readonly eventsPerSecond: number;
  readonly bySourceType: Record<LogSourceType, number>;
  readonly bySeverity: Record<EventSeverity, number>;
  readonly byCategory: Record<string, number>;
  readonly parsingErrors: number;
  readonly normalizedEvents: number;
  readonly period: {
    readonly start: Date;
    readonly end: Date;
  };
}

/**
 * Type guards
 */
export function isValidSeverity(severity: string): severity is EventSeverity {
  return ['critical', 'high', 'medium', 'low', 'info'].includes(severity);
}

export function isValidAlertStatus(status: string): status is AlertStatus {
  return ['open', 'investigating', 'resolved', 'false_positive', 'closed'].includes(status);
}

export function isError(error: unknown): error is Error {
  return error instanceof Error;
}
