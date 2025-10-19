/**
 * Type definitions for Threat Feeds Module
 * Supports all 7 production-ready features
 */

// ========================================
// Enums and Constants
// ========================================

export type FeedType = 'commercial' | 'open_source' | 'community' | 'custom' | 'government' | 'industry';
export type FeedFormat = 'rss' | 'json' | 'xml' | 'stix' | 'taxii' | 'csv' | 'txt' | 'api';
export type FeedStatus = 'active' | 'paused' | 'error' | 'deprecated';
export type IndicatorType = 'ip' | 'domain' | 'url' | 'hash' | 'email' | 'file' | 'registry' | 'mutex' | 'asn';
export type ThreatType = 'malware' | 'phishing' | 'ransomware' | 'botnet' | 'apt' | 'vulnerability' | 'exploit';
export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'unknown';

// ========================================
// Core Interfaces
// ========================================

export interface ThreatFeed {
  id: string;
  name: string;
  description: string;
  type: FeedType;
  format: FeedFormat;
  url: string;
  status: FeedStatus;
  enabled: boolean;
  reliability: FeedReliability;
  schedule: FeedSchedule;
  authentication?: FeedAuthentication;
  parser: ParserConfig;
  lastFetched?: Date;
  lastSuccess?: Date;
  lastError?: string;
  totalIndicators: number;
  indicatorTypes: IndicatorType[];
  threatTypes: ThreatType[];
  tags: string[];
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface FeedReliability {
  score: number; // 0-100
  accuracy: number; // % of valid indicators
  falsePositiveRate: number;
  lastAssessed: Date;
  historicalPerformance: ReliabilityHistory[];
  adjustmentFactors: Record<string, number>;
}

export interface ReliabilityHistory {
  date: Date;
  score: number;
  accuracy: number;
  validIndicators: number;
  falsePositives: number;
  notes?: string;
}

export interface FeedSchedule {
  enabled: boolean;
  frequency: 'realtime' | 'hourly' | 'daily' | 'weekly' | 'custom';
  interval?: number; // minutes for custom frequency
  nextRun?: Date;
  timezone: string;
}

export interface FeedAuthentication {
  type: 'api_key' | 'basic' | 'bearer' | 'oauth' | 'certificate' | 'none';
  credentials: Record<string, string>;
  headers?: Record<string, string>;
}

export interface ParserConfig {
  format: FeedFormat;
  mapping: FieldMapping;
  filters?: ParsingFilter[];
  transformation?: TransformationRule[];
  validation?: ValidationRule[];
}

export interface FieldMapping {
  indicator: string; // JSONPath or XPath to indicator field
  type?: string;
  confidence?: string;
  firstSeen?: string;
  lastSeen?: string;
  description?: string;
  tags?: string;
  metadata?: Record<string, string>;
}

export interface ParsingFilter {
  field: string;
  operator: 'equals' | 'contains' | 'regex' | 'in' | 'not_in';
  value: any;
}

export interface TransformationRule {
  field: string;
  operation: 'lowercase' | 'uppercase' | 'trim' | 'extract' | 'replace' | 'format';
  parameters?: Record<string, any>;
}

export interface ValidationRule {
  field: string;
  type: 'required' | 'format' | 'range' | 'custom';
  parameters?: Record<string, any>;
}

// ========================================
// Feed Indicators
// ========================================

export interface FeedIndicator {
  id: string;
  feedId: string;
  feedName: string;
  indicator: string;
  type: IndicatorType;
  threatType?: ThreatType;
  confidence: ConfidenceLevel;
  confidenceScore: number;
  firstSeen: Date;
  lastSeen: Date;
  expiresAt?: Date;
  active: boolean;
  description?: string;
  tags: string[];
  sources: string[];
  references: string[];
  metadata: Record<string, any>;
  isDuplicate: boolean;
  duplicateOf?: string;
  enrichmentData?: EnrichmentData;
  createdAt: Date;
  updatedAt: Date;
}

export interface EnrichmentData {
  geoLocation?: {
    country?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
  };
  asn?: {
    number: number;
    organization: string;
  };
  malwareFamily?: string[];
  campaigns?: string[];
  actors?: string[];
  ttps?: string[];
  relatedIndicators?: string[];
}

// ========================================
// Feed Aggregation
// ========================================

export interface FeedAggregationResult {
  totalFeeds: number;
  activeFeeds: number;
  totalIndicators: number;
  uniqueIndicators: number;
  duplicates: number;
  byType: Record<IndicatorType, number>;
  byThreatType: Record<ThreatType, number>;
  byConfidence: Record<ConfidenceLevel, number>;
  bySources: Record<string, number>;
  timeRange: {
    start: Date;
    end: Date;
  };
}

export interface FeedConflict {
  indicator: string;
  feeds: string[];
  conflictType: 'confidence' | 'type' | 'metadata';
  values: any[];
  resolution: 'manual' | 'auto' | 'pending';
  resolvedValue?: any;
}

// ========================================
// Feed Parsing
// ========================================

export interface ParsingResult {
  success: boolean;
  feedId: string;
  feedName: string;
  format: FeedFormat;
  parsedAt: Date;
  totalItems: number;
  validIndicators: number;
  invalidIndicators: number;
  duplicates: number;
  indicators: FeedIndicator[];
  errors: ParsingError[];
  warnings: string[];
  statistics: {
    parseTime: number;
    byType: Record<IndicatorType, number>;
    byConfidence: Record<ConfidenceLevel, number>;
  };
}

export interface ParsingError {
  line?: number;
  field?: string;
  value?: any;
  error: string;
  severity: 'error' | 'warning';
}

// ========================================
// Feed Normalization
// ========================================

export interface NormalizedIndicator {
  original: string;
  normalized: string;
  type: IndicatorType;
  valid: boolean;
  format?: string;
  transformations: string[];
}

export interface NormalizationRules {
  lowercase: boolean;
  removeWhitespace: boolean;
  defang: boolean; // Convert hxxp to http, etc.
  extractFromUrl: boolean;
  customRules: Array<{
    pattern: RegExp;
    replacement: string;
  }>;
}

// ========================================
// Custom Feed Creation
// ========================================

export interface CustomFeed extends Omit<ThreatFeed, 'id' | 'createdAt' | 'updatedAt' | 'totalIndicators'> {
  isCustom: true;
  owner: string;
  sharing: FeedSharingConfig;
  contributors?: string[];
}

export interface FeedSharingConfig {
  visibility: 'private' | 'organization' | 'public';
  allowedUsers?: string[];
  allowedOrganizations?: string[];
  permissions: {
    canRead: boolean;
    canWrite: boolean;
    canShare: boolean;
  };
}

export interface CustomIndicatorInput {
  indicator: string;
  type: IndicatorType;
  threatType?: ThreatType;
  confidence?: ConfidenceLevel;
  description?: string;
  tags?: string[];
  expiresAt?: Date;
  metadata?: Record<string, any>;
}

// ========================================
// Feed Management
// ========================================

export interface FeedHealthCheck {
  feedId: string;
  feedName: string;
  status: 'healthy' | 'degraded' | 'error';
  lastCheck: Date;
  uptime: number; // percentage
  averageResponseTime: number; // ms
  errorRate: number; // percentage
  recentErrors: string[];
  recommendations: string[];
}

export interface FeedUpdate {
  feedId: string;
  updateType: 'config' | 'credentials' | 'schedule' | 'status';
  changes: Record<string, any>;
  updatedBy: string;
  updatedAt: Date;
}

export interface FeedTestResult {
  feedId: string;
  success: boolean;
  responseTime: number;
  statusCode?: number;
  indicatorsFound: number;
  sampleIndicators: string[];
  errors: string[];
  warnings: string[];
  testedAt: Date;
}

// ========================================
// Duplicate Detection
// ========================================

export interface DuplicateDetectionConfig {
  enabled: boolean;
  strategy: 'exact' | 'fuzzy' | 'hash' | 'custom';
  threshold?: number; // for fuzzy matching
  fields: string[];
  mergeStrategy: 'latest' | 'highest_confidence' | 'manual';
  crossFeedDeduplication: boolean;
}

export interface DuplicateMatch {
  originalId: string;
  duplicateId: string;
  indicator: string;
  similarity: number;
  matchedFields: string[];
  sources: string[];
  recommendedAction: 'merge' | 'keep_both' | 'review';
}

export interface DeduplicationResult {
  totalProcessed: number;
  duplicatesFound: number;
  duplicatesRemoved: number;
  duplicatesMerged: number;
  keptUnique: number;
  matches: DuplicateMatch[];
  timeTaken: number;
}

// ========================================
// Feed Statistics
// ========================================

export interface FeedStatistics {
  feedId?: string;
  totalFeeds: number;
  activeFeeds: number;
  totalIndicators: number;
  activeIndicators: number;
  expiredIndicators: number;
  byFeedType: Record<FeedType, {
    count: number;
    indicators: number;
  }>;
  byIndicatorType: Record<IndicatorType, number>;
  byThreatType: Record<ThreatType, number>;
  byConfidence: Record<ConfidenceLevel, number>;
  averageReliability: number;
  topFeeds: Array<{
    feedId: string;
    name: string;
    indicators: number;
    reliability: number;
  }>;
  recentActivity: {
    lastHour: number;
    lastDay: number;
    lastWeek: number;
  };
  performanceMetrics: {
    averageFetchTime: number;
    successRate: number;
    errorRate: number;
  };
}

// ========================================
// Feed Connector Framework
// ========================================

export interface FeedConnector {
  id: string;
  name: string;
  type: FeedFormat;
  connect: (config: FeedAuthentication) => Promise<boolean>;
  fetch: (url: string) => Promise<string>;
  parse: (data: string, mapping: FieldMapping) => Promise<FeedIndicator[]>;
  validate: (indicator: FeedIndicator) => boolean;
  disconnect: () => Promise<void>;
}

export interface ConnectorRegistry {
  [key: string]: FeedConnector;
}

// ========================================
// Feed Scheduling
// ========================================

export interface ScheduledJob {
  id: string;
  feedId: string;
  feedName: string;
  schedule: FeedSchedule;
  lastRun?: Date;
  nextRun: Date;
  status: 'scheduled' | 'running' | 'completed' | 'failed';
  retryCount: number;
  maxRetries: number;
  results?: ParsingResult;
}

export interface JobHistory {
  jobId: string;
  feedId: string;
  startedAt: Date;
  completedAt?: Date;
  status: 'success' | 'failure' | 'partial';
  indicatorsAdded: number;
  errors: string[];
  duration: number;
}
