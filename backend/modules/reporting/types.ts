/**
 * Type definitions for Reporting Module
 * Supports all 7 production-ready features
 */

// ========================================
// Enums and Constants
// ========================================

export type ReportType = 'threat_intelligence' | 'incident' | 'vulnerability' | 'compliance' | 'executive_summary' | 'trend_analysis' | 'custom';
export type ReportStatus = 'draft' | 'generating' | 'completed' | 'failed' | 'scheduled';
export type ReportFormat = 'pdf' | 'html' | 'docx' | 'xlsx' | 'csv' | 'json' | 'markdown';
export type ScheduleFrequency = 'hourly' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'custom';
export type ChartType = 'line' | 'bar' | 'pie' | 'doughnut' | 'area' | 'scatter' | 'heatmap' | 'treemap';
export type MetricAggregation = 'sum' | 'avg' | 'min' | 'max' | 'count';
export type TrendDirection = 'up' | 'down' | 'stable';
export type DashboardRefreshRate = 'realtime' | '1min' | '5min' | '15min' | '1hour';

// ========================================
// Report Templates
// ========================================

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: ReportType;
  sections: TemplateSection[];
  layout: TemplateLayout;
  styling: TemplateStyling;
  variables: TemplateVariable[];
  filters: ReportFilter[];
  version: string;
  isDefault: boolean;
  isPublic: boolean;
  createdBy: string;
  tags: string[];
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateSection {
  id: string;
  name: string;
  order: number;
  type: 'header' | 'content' | 'chart' | 'table' | 'metrics' | 'custom';
  title: string;
  description?: string;
  dataSource: string;
  query?: string;
  visualization?: VisualizationConfig;
  formatting?: SectionFormatting;
  required: boolean;
  pageBreakBefore?: boolean;
  pageBreakAfter?: boolean;
}

export interface TemplateLayout {
  pageSize: 'A4' | 'Letter' | 'Legal' | 'A3';
  orientation: 'portrait' | 'landscape';
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  header?: string;
  footer?: string;
  pageNumbers: boolean;
  watermark?: string;
}

export interface TemplateStyling {
  fontFamily: string;
  fontSize: number;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  headerStyle?: Record<string, any>;
  bodyStyle?: Record<string, any>;
  tableStyle?: Record<string, any>;
  customCss?: string;
}

export interface TemplateVariable {
  name: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'select' | 'multiselect';
  defaultValue?: any;
  options?: string[];
  required: boolean;
  description?: string;
}

export interface ReportFilter {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'between' | 'in';
  value: any;
  label: string;
}

export interface VisualizationConfig {
  type: ChartType;
  options: Record<string, any>;
  data: {
    labels: string[];
    datasets: DatasetConfig[];
  };
}

export interface DatasetConfig {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string;
  borderWidth?: number;
}

export interface SectionFormatting {
  alignment?: 'left' | 'center' | 'right' | 'justify';
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  color?: string;
  backgroundColor?: string;
  padding?: number;
  margin?: number;
}

// ========================================
// Reports
// ========================================

export interface Report {
  id: string;
  name: string;
  description: string;
  type: ReportType;
  templateId?: string;
  status: ReportStatus;
  format: ReportFormat;
  generatedBy: string;
  generatedAt?: Date;
  scheduledAt?: Date;
  parameters: Record<string, any>;
  timeRange: {
    startDate: Date;
    endDate: Date;
  };
  content: ReportContent;
  filePath?: string;
  fileSize?: number;
  downloadUrl?: string;
  recipients: string[];
  distribution: ReportDistribution;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportContent {
  title: string;
  subtitle?: string;
  summary: string;
  sections: ReportSection[];
  charts: ChartData[];
  tables: TableData[];
  metrics: MetricData[];
  appendices?: AppendixSection[];
}

export interface ReportSection {
  id: string;
  title: string;
  order: number;
  content: string;
  subsections?: ReportSubsection[];
}

export interface ReportSubsection {
  title: string;
  content: string;
  order: number;
}

export interface ChartData {
  id: string;
  title: string;
  type: ChartType;
  data: any;
  options: Record<string, any>;
  section: string;
}

export interface TableData {
  id: string;
  title: string;
  columns: TableColumn[];
  rows: TableRow[];
  section: string;
  pagination?: boolean;
  sortable?: boolean;
}

export interface TableColumn {
  key: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  sortable?: boolean;
  format?: string;
  width?: number;
}

export interface TableRow {
  [key: string]: any;
}

export interface MetricData {
  id: string;
  label: string;
  value: number | string;
  unit?: string;
  trend?: TrendIndicator;
  section: string;
  icon?: string;
  color?: string;
}

export interface TrendIndicator {
  direction: TrendDirection;
  percentage: number;
  period: string;
}

export interface AppendixSection {
  title: string;
  content: string;
  attachments?: string[];
}

export interface ReportDistribution {
  email?: {
    enabled: boolean;
    recipients: string[];
    subject: string;
    body?: string;
  };
  slack?: {
    enabled: boolean;
    channels: string[];
    message?: string;
  };
  webhook?: {
    enabled: boolean;
    url: string;
    headers?: Record<string, string>;
  };
  storage?: {
    enabled: boolean;
    path: string;
  };
}

// ========================================
// Scheduled Reporting
// ========================================

export interface ReportSchedule {
  id: string;
  name: string;
  description: string;
  templateId: string;
  enabled: boolean;
  frequency: ScheduleFrequency;
  cronExpression?: string;
  timezone: string;
  nextRun?: Date;
  lastRun?: Date;
  parameters: Record<string, any>;
  recipients: string[];
  distribution: ReportDistribution;
  runHistory: ScheduleRun[];
  failureNotification: boolean;
  retryOnFailure: boolean;
  maxRetries: number;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScheduleRun {
  id: string;
  scheduleId: string;
  startTime: Date;
  endTime?: Date;
  status: 'success' | 'failed' | 'running';
  reportId?: string;
  error?: string;
  duration?: number; // seconds
  retryCount: number;
}

// ========================================
// Executive Dashboards
// ========================================

export interface Dashboard {
  id: string;
  name: string;
  description: string;
  type: 'executive' | 'operational' | 'tactical' | 'custom';
  layout: DashboardLayout;
  widgets: DashboardWidget[];
  refreshRate: DashboardRefreshRate;
  autoRefresh: boolean;
  isPublic: boolean;
  isDefault: boolean;
  theme: DashboardTheme;
  filters: DashboardFilter[];
  ownerId: string;
  sharedWith: string[];
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardLayout {
  columns: number;
  rows: number;
  gridSize: number; // pixels
  spacing: number; // pixels
  backgroundColor?: string;
}

export interface DashboardWidget {
  id: string;
  title: string;
  type: 'metric' | 'chart' | 'table' | 'list' | 'gauge' | 'map' | 'custom';
  position: WidgetPosition;
  size: WidgetSize;
  dataSource: string;
  query?: string;
  refreshInterval?: number; // seconds
  visualization: WidgetVisualization;
  formatting: WidgetFormatting;
  interactions?: WidgetInteraction[];
  metadata: Record<string, any>;
}

export interface WidgetPosition {
  x: number;
  y: number;
}

export interface WidgetSize {
  width: number;
  height: number;
}

export interface WidgetVisualization {
  type: string;
  config: Record<string, any>;
  thresholds?: Threshold[];
  colorScheme?: string[];
}

export interface WidgetFormatting {
  title?: {
    fontSize?: number;
    fontWeight?: string;
    color?: string;
  };
  body?: {
    fontSize?: number;
    color?: string;
  };
  border?: {
    width?: number;
    color?: string;
    radius?: number;
  };
}

export interface WidgetInteraction {
  type: 'click' | 'hover' | 'drill_down';
  action: string;
  target?: string;
}

export interface DashboardTheme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    danger: string;
    info: string;
    background: string;
    text: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
}

export interface DashboardFilter {
  id: string;
  label: string;
  type: 'date_range' | 'select' | 'multiselect' | 'search';
  field: string;
  options?: string[];
  defaultValue?: any;
  appliedTo: string[]; // Widget IDs
}

export interface Threshold {
  value: number;
  color: string;
  label?: string;
  operator: 'greater_than' | 'less_than' | 'equals';
}

// ========================================
// Trend Analysis
// ========================================

export interface TrendAnalysis {
  id: string;
  name: string;
  description: string;
  metric: string;
  dataPoints: TrendDataPoint[];
  timeRange: {
    startDate: Date;
    endDate: Date;
  };
  granularity: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
  statistics: TrendStatistics;
  forecast?: ForecastData;
  anomalies: AnomalyDetection[];
  insights: TrendInsight[];
  metadata: Record<string, any>;
  generatedAt: Date;
}

export interface TrendDataPoint {
  timestamp: Date;
  value: number;
  label?: string;
  metadata?: Record<string, any>;
}

export interface TrendStatistics {
  mean: number;
  median: number;
  mode?: number;
  standardDeviation: number;
  min: number;
  max: number;
  total: number;
  growth: {
    absolute: number;
    percentage: number;
    period: string;
  };
  movingAverage?: number[];
}

export interface ForecastData {
  method: 'linear_regression' | 'exponential_smoothing' | 'arima' | 'prophet';
  predictions: ForecastPoint[];
  confidence: number; // 0-100
  accuracy?: number; // 0-100
}

export interface ForecastPoint {
  timestamp: Date;
  predictedValue: number;
  lowerBound: number;
  upperBound: number;
  confidence: number;
}

export interface AnomalyDetection {
  timestamp: Date;
  value: number;
  expectedValue: number;
  deviation: number;
  severity: 'low' | 'medium' | 'high';
  type: 'spike' | 'drop' | 'outlier';
  description: string;
}

export interface TrendInsight {
  type: 'pattern' | 'correlation' | 'seasonality' | 'trend_change' | 'other';
  title: string;
  description: string;
  confidence: number; // 0-100
  relevance: number; // 0-100
  supportingData?: any;
}

// ========================================
// KPIs and Metrics
// ========================================

export interface KPI {
  id: string;
  name: string;
  description: string;
  category: string;
  metric: string;
  currentValue: number;
  target: number;
  unit: string;
  formula?: string;
  dataSource: string;
  aggregation: MetricAggregation;
  timeRange: {
    startDate: Date;
    endDate: Date;
  };
  trend: TrendIndicator;
  status: KPIStatus;
  thresholds: KPIThreshold[];
  history: KPIHistory[];
  owner?: string;
  metadata: Record<string, any>;
  updatedAt: Date;
}

export interface KPIStatus {
  health: 'excellent' | 'good' | 'warning' | 'critical';
  achievementPercentage: number; // 0-100
  message?: string;
}

export interface KPIThreshold {
  level: 'excellent' | 'good' | 'warning' | 'critical';
  min?: number;
  max?: number;
  color: string;
}

export interface KPIHistory {
  timestamp: Date;
  value: number;
  target: number;
  notes?: string;
}

export interface MetricTracking {
  id: string;
  metrics: TrackedMetric[];
  aggregations: MetricAggregation[];
  timeRange: {
    startDate: Date;
    endDate: Date;
  };
  groupBy?: string[];
  filters?: Record<string, any>;
  refreshedAt: Date;
}

export interface TrackedMetric {
  id: string;
  name: string;
  value: number;
  unit?: string;
  change?: {
    absolute: number;
    percentage: number;
  };
  breakdown?: MetricBreakdown[];
}

export interface MetricBreakdown {
  dimension: string;
  value: number;
  percentage: number;
}

// ========================================
// Data Visualization
// ========================================

export interface Visualization {
  id: string;
  name: string;
  description: string;
  type: ChartType;
  dataSource: string;
  query?: string;
  data: VisualizationData;
  configuration: VisualizationConfig;
  interactivity: InteractivityConfig;
  annotations?: Annotation[];
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface VisualizationData {
  labels: string[];
  datasets: VisualizationDataset[];
  metadata?: Record<string, any>;
}

export interface VisualizationDataset {
  label: string;
  data: any[];
  type?: string;
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
  tension?: number;
  pointStyle?: string;
  [key: string]: any;
}

export interface InteractivityConfig {
  tooltip: {
    enabled: boolean;
    mode?: 'point' | 'nearest' | 'index';
    format?: string;
  };
  zoom: {
    enabled: boolean;
    mode?: 'x' | 'y' | 'xy';
  };
  pan: {
    enabled: boolean;
    mode?: 'x' | 'y' | 'xy';
  };
  legend: {
    enabled: boolean;
    position?: 'top' | 'bottom' | 'left' | 'right';
  };
  onClick?: string; // Handler function name
}

export interface Annotation {
  type: 'line' | 'box' | 'point' | 'label';
  value: any;
  label: string;
  color: string;
  borderWidth?: number;
}

// ========================================
// Export Capabilities
// ========================================

export interface ExportRequest {
  id: string;
  type: 'report' | 'dashboard' | 'data' | 'visualization';
  sourceId: string;
  format: ReportFormat;
  options: ExportOptions;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestedBy: string;
  requestedAt: Date;
  completedAt?: Date;
  filePath?: string;
  fileSize?: number;
  downloadUrl?: string;
  expiresAt?: Date;
  error?: string;
}

export interface ExportOptions {
  includeCharts?: boolean;
  includeTables?: boolean;
  includeRawData?: boolean;
  pageSize?: string;
  orientation?: 'portrait' | 'landscape';
  compression?: boolean;
  encryption?: {
    enabled: boolean;
    password?: string;
  };
  watermark?: string;
  customStyling?: Record<string, any>;
}

export interface DataExport {
  format: 'csv' | 'json' | 'xlsx';
  data: any[];
  columns?: string[];
  filename: string;
  compression?: boolean;
}

export interface PDFExportConfig {
  template?: string;
  header?: string;
  footer?: string;
  pageNumbers: boolean;
  tableOfContents: boolean;
  coverPage?: boolean;
  customStyling?: string;
}

// ========================================
// Analytics and Statistics
// ========================================

export interface ReportingStatistics {
  totalReports: number;
  reportsByType: Record<ReportType, number>;
  reportsByStatus: Record<ReportStatus, number>;
  reportsByFormat: Record<ReportFormat, number>;
  scheduledReports: number;
  activeSchedules: number;
  reportsThisMonth: number;
  averageGenerationTime: number; // seconds
  topTemplates: Array<{
    templateId: string;
    templateName: string;
    usageCount: number;
  }>;
  recentReports: Array<{
    id: string;
    name: string;
    type: ReportType;
    generatedAt: Date;
  }>;
}

export interface DashboardStatistics {
  totalDashboards: number;
  activeDashboards: number;
  totalWidgets: number;
  averageWidgetsPerDashboard: number;
  dashboardsByType: Record<string, number>;
  mostViewedDashboards: Array<{
    id: string;
    name: string;
    viewCount: number;
  }>;
}

export interface UsageAnalytics {
  period: {
    startDate: Date;
    endDate: Date;
  };
  reportGeneration: {
    total: number;
    byFormat: Record<ReportFormat, number>;
    byType: Record<ReportType, number>;
    successful: number;
    failed: number;
  };
  dashboardViews: {
    total: number;
    unique: number;
    byDashboard: Record<string, number>;
  };
  exportActivity: {
    total: number;
    byFormat: Record<ReportFormat, number>;
    successful: number;
    failed: number;
  };
  topUsers: Array<{
    userId: string;
    username: string;
    activityCount: number;
  }>;
}

// ========================================
// Search and Filters
// ========================================

export interface ReportSearchParams {
  query?: string;
  type?: ReportType;
  status?: ReportStatus;
  format?: ReportFormat;
  generatedBy?: string;
  startDate?: Date;
  endDate?: Date;
  tags?: string[];
  limit?: number;
  offset?: number;
}

export interface ReportSearchResult {
  results: Report[];
  totalCount: number;
  facets: {
    types: Record<ReportType, number>;
    formats: Record<ReportFormat, number>;
    statuses: Record<ReportStatus, number>;
  };
}
