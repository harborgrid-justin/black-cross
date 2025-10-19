/**
 * Type definitions for Dark Web Monitoring Module
 * Supports all 7 production-ready features
 */

// ========================================
// Enums and Constants
// ========================================

export type MonitoringSource = 'forum' | 'marketplace' | 'paste_site' | 'chat_room' | 'hidden_service' | 'telegram' | 'other';
export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type AlertStatus = 'new' | 'acknowledged' | 'investigating' | 'resolved' | 'false_positive';
export type LeakType = 'credentials' | 'credit_card' | 'personal_info' | 'corporate_data' | 'source_code' | 'database' | 'other';
export type ActorRole = 'seller' | 'buyer' | 'admin' | 'moderator' | 'member' | 'unknown';
export type CredentialStatus = 'valid' | 'invalid' | 'expired' | 'unknown';
export type DataQuality = 'high' | 'medium' | 'low';
export type CollectionMethod = 'crawler' | 'scraper' | 'manual' | 'api' | 'partner_feed';

// ========================================
// Dark Web Intelligence
// ========================================

export interface DarkWebIntelligence {
  id: string;
  source: MonitoringSource;
  sourceUrl: string;
  sourceName: string;
  title: string;
  content: string;
  author?: string;
  authorId?: string;
  timestamp: Date;
  discoveryDate: Date;
  collectionMethod: CollectionMethod;
  category: string;
  tags: string[];
  language?: string;
  severity: AlertSeverity;
  relevanceScore: number; // 0-100
  dataQuality: DataQuality;
  indicators: ExtractedIndicator[];
  relatedActors: string[];
  metadata: Record<string, any>;
  processed: boolean;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExtractedIndicator {
  type: 'ip' | 'domain' | 'email' | 'username' | 'hash' | 'url' | 'keyword';
  value: string;
  context: string;
  confidence: number; // 0-100
}

// ========================================
// Forum Monitoring
// ========================================

export interface DarkWebForum {
  id: string;
  name: string;
  url: string;
  description: string;
  category: string;
  language: string;
  memberCount?: number;
  postCount?: number;
  lastActivity?: Date;
  registrationRequired: boolean;
  accessMethod: 'tor' | 'i2p' | 'clearnet' | 'other';
  monitoringStatus: 'active' | 'paused' | 'inactive';
  credibilityScore: number; // 0-100
  threatLevel: AlertSeverity;
  keywords: string[];
  lastScraped?: Date;
  scrapingFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ForumPost {
  id: string;
  forumId: string;
  forumName: string;
  threadId: string;
  threadTitle: string;
  author: string;
  authorId?: string;
  content: string;
  postDate: Date;
  replyCount?: number;
  viewCount?: number;
  attachments: ForumAttachment[];
  mentions: string[];
  tags: string[];
  sentiment?: 'positive' | 'neutral' | 'negative';
  relevanceScore: number;
  indicators: ExtractedIndicator[];
  alertGenerated: boolean;
  metadata: Record<string, any>;
}

export interface ForumAttachment {
  id: string;
  filename: string;
  fileType: string;
  fileSize: number;
  hash?: string;
  downloadUrl?: string;
  scanned: boolean;
  malicious: boolean;
}

export interface ForumThread {
  id: string;
  forumId: string;
  title: string;
  author: string;
  authorId?: string;
  createdDate: Date;
  lastActivity: Date;
  postCount: number;
  viewCount: number;
  sticky: boolean;
  locked: boolean;
  category: string;
  posts: ForumPost[];
  relevanceScore: number;
  threatIndicators: string[];
}

export interface ForumActor {
  id: string;
  username: string;
  userId?: string;
  forums: string[]; // Forum IDs
  role: ActorRole;
  reputation?: number;
  postCount: number;
  memberSince?: Date;
  lastSeen?: Date;
  knownAliases: string[];
  activities: ActorActivity[];
  credibilityScore: number; // 0-100
  threatLevel: AlertSeverity;
  associatedLeaks: string[];
  metadata: Record<string, any>;
}

export interface ActorActivity {
  id: string;
  activityType: 'post' | 'sale' | 'purchase' | 'service_offer' | 'data_leak' | 'tool_release' | 'other';
  description: string;
  timestamp: Date;
  forum: string;
  threadId?: string;
  evidence: string[];
  impact: AlertSeverity;
}

// ========================================
// Credential Leak Detection
// ========================================

export interface CredentialLeak {
  id: string;
  source: MonitoringSource;
  sourceUrl: string;
  leakName: string;
  description: string;
  discoveryDate: Date;
  leakDate?: Date;
  affectedDomains: string[];
  credentialCount: number;
  dataTypes: LeakType[];
  severity: AlertSeverity;
  credentials: LeakedCredential[];
  breachDetails?: BreachDetails;
  verified: boolean;
  publicDisclosure: boolean;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeakedCredential {
  id: string;
  leakId: string;
  email?: string;
  username?: string;
  password?: string; // Hashed
  passwordHash?: string;
  hashType?: string;
  domain: string;
  additionalFields: Record<string, any>;
  validationStatus: CredentialStatus;
  validationDate?: Date;
  severity: AlertSeverity;
  compromisedDate?: Date;
}

export interface BreachDetails {
  organizationName?: string;
  industry?: string;
  recordsCompromised: number;
  dataClasses: string[];
  attackVector?: string;
  rootCause?: string;
  timeToDetection?: string;
  impactAssessment: string;
  remediationActions: string[];
}

export interface CredentialSearchParams {
  domains?: string[];
  emails?: string[];
  usernames?: string[];
  startDate?: Date;
  endDate?: Date;
  severity?: AlertSeverity;
  verified?: boolean;
}

export interface CredentialValidationResult {
  credentialId: string;
  status: CredentialStatus;
  validationMethod: string;
  validationDate: Date;
  details: string;
  riskScore: number; // 0-100
}

// ========================================
// Brand and Asset Monitoring
// ========================================

export interface BrandMonitor {
  id: string;
  brandName: string;
  keywords: string[];
  domains: string[];
  aliases: string[];
  monitoringRules: MonitoringRule[];
  alertThreshold: AlertSeverity;
  active: boolean;
  sources: MonitoringSource[];
  notificationChannels: string[];
  monitoringFrequency: 'realtime' | 'hourly' | 'daily';
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface MonitoringRule {
  id: string;
  name: string;
  description: string;
  ruleType: 'keyword' | 'regex' | 'domain' | 'email' | 'ip' | 'hash' | 'custom';
  pattern: string;
  caseSensitive: boolean;
  severity: AlertSeverity;
  action: 'alert' | 'log' | 'block' | 'escalate';
  enabled: boolean;
  matchCount: number;
  lastMatch?: Date;
}

export interface BrandMention {
  id: string;
  monitorId: string;
  brandName: string;
  source: MonitoringSource;
  sourceUrl: string;
  content: string;
  mentionContext: string;
  timestamp: Date;
  discoveryDate: Date;
  sentiment?: 'positive' | 'neutral' | 'negative';
  threatLevel: AlertSeverity;
  matchedKeywords: string[];
  matchedRules: string[];
  indicators: ExtractedIndicator[];
  relatedIncidents: string[];
  reviewed: boolean;
  falsePositive: boolean;
  metadata: Record<string, any>;
}

export interface AssetExposure {
  id: string;
  assetType: 'domain' | 'ip' | 'email' | 'server' | 'database' | 'credential' | 'document' | 'source_code';
  assetIdentifier: string;
  exposureType: string;
  severity: AlertSeverity;
  source: MonitoringSource;
  sourceUrl: string;
  discoveryDate: Date;
  exposureDetails: string;
  impactAssessment: string;
  remediationStatus: 'open' | 'in_progress' | 'resolved' | 'accepted';
  remediationSteps: string[];
  assignedTo?: string;
  metadata: Record<string, any>;
}

// ========================================
// Alert Generation
// ========================================

export interface DarkWebAlert {
  id: string;
  type: 'credential_leak' | 'brand_mention' | 'threat_intel' | 'actor_activity' | 'data_exposure' | 'marketplace_listing' | 'other';
  severity: AlertSeverity;
  status: AlertStatus;
  title: string;
  description: string;
  source: MonitoringSource;
  sourceUrl?: string;
  detectionDate: Date;
  indicators: ExtractedIndicator[];
  affectedAssets: string[];
  relatedAlerts: string[];
  riskScore: number; // 0-100
  confidenceScore: number; // 0-100
  tags: string[];
  assignedTo?: string;
  investigationNotes: string[];
  actions: AlertAction[];
  notificationsSent: NotificationRecord[];
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface AlertAction {
  id: string;
  actionType: 'investigate' | 'escalate' | 'block' | 'notify' | 'remediate' | 'close';
  description: string;
  performedBy: string;
  performedAt: Date;
  outcome: string;
  notes?: string;
}

export interface NotificationRecord {
  id: string;
  channel: 'email' | 'sms' | 'webhook' | 'slack' | 'teams' | 'pagerduty';
  recipient: string;
  sentAt: Date;
  delivered: boolean;
  deliveryStatus: string;
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  priority: number;
  conditions: AlertCondition[];
  actions: string[]; // Action types to trigger
  notificationChannels: string[];
  throttling?: {
    enabled: boolean;
    maxAlertsPerHour: number;
    deduplicationWindow: number; // minutes
  };
  matchCount: number;
  lastTriggered?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AlertCondition {
  field: string;
  operator: 'equals' | 'contains' | 'regex' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
  caseSensitive?: boolean;
}

export interface AlertStatistics {
  totalAlerts: number;
  bySeverity: Record<AlertSeverity, number>;
  byStatus: Record<AlertStatus, number>;
  byType: Record<string, number>;
  bySource: Record<MonitoringSource, number>;
  averageResponseTime: number; // minutes
  falsePositiveRate: number; // percentage
  resolutionRate: number; // percentage
  trendsOverTime: {
    date: string;
    alertCount: number;
    criticalCount: number;
  }[];
}

// ========================================
// Data Collection
// ========================================

export interface CollectionTask {
  id: string;
  taskType: 'forum_scrape' | 'marketplace_scan' | 'paste_monitor' | 'telegram_scan' | 'general_search';
  target: string;
  targetUrl?: string;
  schedule: string; // Cron expression
  status: 'scheduled' | 'running' | 'completed' | 'failed' | 'paused';
  lastRun?: Date;
  nextRun?: Date;
  runCount: number;
  successCount: number;
  failureCount: number;
  dataCollected: number;
  averageRuntime: number; // seconds
  config: CollectionConfig;
  errors: TaskError[];
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CollectionConfig {
  method: CollectionMethod;
  crawlDepth?: number;
  maxPages?: number;
  respectRobotsTxt?: boolean;
  useProxy: boolean;
  proxyRotation?: boolean;
  userAgentRotation?: boolean;
  requestDelay?: number; // milliseconds
  timeout?: number; // seconds
  authentication?: {
    required: boolean;
    method: 'basic' | 'bearer' | 'cookie' | 'custom';
    credentials?: Record<string, string>;
  };
  filters?: {
    keywords?: string[];
    dateRange?: {
      start: Date;
      end: Date;
    };
    languages?: string[];
  };
}

export interface TaskError {
  timestamp: Date;
  errorType: string;
  message: string;
  stackTrace?: string;
  context?: Record<string, any>;
}

export interface DataSource {
  id: string;
  name: string;
  type: MonitoringSource;
  url: string;
  description: string;
  credibilityScore: number; // 0-100
  dataQuality: DataQuality;
  updateFrequency: string;
  lastUpdate?: Date;
  active: boolean;
  accessMethod: string;
  requiresAuthentication: boolean;
  cost?: string;
  coverage: string[];
  strengths: string[];
  limitations: string[];
  metadata: Record<string, any>;
}

export interface CollectionStatistics {
  totalSources: number;
  activeSources: number;
  totalTasks: number;
  runningTasks: number;
  dataPointsCollected: number;
  dataPointsToday: number;
  averageDataQuality: number;
  bySource: Record<MonitoringSource, {
    count: number;
    successRate: number;
    dataQuality: number;
  }>;
  errors: {
    last24h: number;
    lastWeek: number;
    topErrors: Array<{
      type: string;
      count: number;
    }>;
  };
}

// ========================================
// Intelligence Reporting
// ========================================

export interface IntelligenceReport {
  id: string;
  reportType: 'summary' | 'detailed' | 'executive' | 'tactical' | 'strategic' | 'incident';
  title: string;
  description: string;
  timeframe: {
    startDate: Date;
    endDate: Date;
  };
  sources: string[];
  keyFindings: Finding[];
  threatActors: ActorSummary[];
  credentialLeaks: LeakSummary[];
  brandMentions: MentionSummary[];
  indicators: IndicatorSummary[];
  trends: TrendAnalysis[];
  recommendations: Recommendation[];
  riskAssessment: RiskAssessment;
  distribution: string[];
  classification: 'public' | 'internal' | 'confidential' | 'restricted';
  generatedBy: string;
  generatedAt: Date;
  metadata: Record<string, any>;
}

export interface Finding {
  id: string;
  category: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  evidence: string[];
  impact: string;
  confidence: number; // 0-100
  relatedAlerts: string[];
}

export interface ActorSummary {
  actorId: string;
  actorName: string;
  activityCount: number;
  threatLevel: AlertSeverity;
  primaryActivity: string;
  associatedLeaks: number;
  recentActivities: string[];
}

export interface LeakSummary {
  leakId: string;
  leakName: string;
  credentialCount: number;
  severity: AlertSeverity;
  affectedDomains: string[];
  discoveryDate: Date;
  verified: boolean;
}

export interface MentionSummary {
  brandName: string;
  mentionCount: number;
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
  topSources: string[];
  criticalMentions: number;
}

export interface IndicatorSummary {
  type: string;
  count: number;
  topIndicators: Array<{
    value: string;
    occurrences: number;
    severity: AlertSeverity;
  }>;
}

export interface TrendAnalysis {
  metric: string;
  direction: 'increasing' | 'stable' | 'decreasing';
  changePercentage: number;
  description: string;
  dataPoints: Array<{
    date: string;
    value: number;
  }>;
}

export interface Recommendation {
  id: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  rationale: string;
  implementationSteps: string[];
  expectedOutcome: string;
  resources: string[];
}

export interface RiskAssessment {
  overallRisk: 'critical' | 'high' | 'medium' | 'low';
  riskScore: number; // 0-100
  riskFactors: Array<{
    factor: string;
    impact: AlertSeverity;
    likelihood: 'high' | 'medium' | 'low';
    description: string;
  }>;
  mitigatingFactors: string[];
  residualRisk: string;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  reportType: string;
  sections: ReportSection[];
  variables: TemplateVariable[];
  format: 'pdf' | 'html' | 'docx' | 'markdown';
  styling?: Record<string, any>;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportSection {
  id: string;
  title: string;
  order: number;
  contentType: 'text' | 'table' | 'chart' | 'list' | 'image' | 'custom';
  dataSource: string;
  template: string;
  required: boolean;
}

export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'date' | 'array' | 'object';
  description: string;
  defaultValue?: any;
  required: boolean;
}

// ========================================
// Search and Filters
// ========================================

export interface DarkWebSearchParams {
  query?: string;
  sources?: MonitoringSource[];
  startDate?: Date;
  endDate?: Date;
  severity?: AlertSeverity;
  tags?: string[];
  actors?: string[];
  domains?: string[];
  keywords?: string[];
  dataQuality?: DataQuality;
  processed?: boolean;
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  results: DarkWebIntelligence[];
  totalCount: number;
  facets: {
    sources: Record<MonitoringSource, number>;
    severity: Record<AlertSeverity, number>;
    tags: Record<string, number>;
    actors: Record<string, number>;
  };
  queryTime: number; // milliseconds
}

// ========================================
// Analytics
// ========================================

export interface DarkWebAnalytics {
  period: {
    startDate: Date;
    endDate: Date;
  };
  overview: {
    totalIntelligence: number;
    credentialLeaks: number;
    brandMentions: number;
    activeAlerts: number;
    resolvedAlerts: number;
  };
  topThreats: Array<{
    threat: string;
    count: number;
    severity: AlertSeverity;
  }>;
  actorActivity: Array<{
    actorName: string;
    activityCount: number;
    threatLevel: AlertSeverity;
  }>;
  sourceDistribution: Record<MonitoringSource, number>;
  severityTrends: Array<{
    date: string;
    critical: number;
    high: number;
    medium: number;
    low: number;
  }>;
  responseMetrics: {
    averageResponseTime: number;
    averageResolutionTime: number;
    mttr: number; // Mean Time To Respond
    mttd: number; // Mean Time To Detect
  };
}
