/**
 * Types and interfaces for the SOA-aligned Code Review System
 */

/**
 * Review severity levels
 */
export enum ReviewSeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  INFO = 'info',
}

/**
 * Review category types
 */
export enum ReviewCategory {
  ARCHITECTURE = 'architecture',
  SECURITY = 'security',
  API_DESIGN = 'api_design',
  DATA_LAYER = 'data_layer',
  PERFORMANCE = 'performance',
  TESTING = 'testing',
}

/**
 * Review status
 */
export enum ReviewStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

/**
 * Single review finding from an agent
 */
export interface ReviewFinding {
  id: string;
  agentName: string;
  category: ReviewCategory;
  severity: ReviewSeverity;
  title: string;
  description: string;
  location: {
    file: string;
    line?: number;
    column?: number;
  };
  recommendation: string;
  soaPrinciple: string;
  codeExample?: {
    before: string;
    after: string;
  };
  references?: string[];
  timestamp: Date;
}

/**
 * Agent review result
 */
export interface AgentReviewResult {
  agentName: string;
  category: ReviewCategory;
  status: ReviewStatus;
  findings: ReviewFinding[];
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  executionTime: number;
  timestamp: Date;
}

/**
 * Complete code review report
 */
export interface CodeReviewReport {
  id: string;
  status: ReviewStatus;
  targetPath: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  agentResults: AgentReviewResult[];
  overallSummary: {
    totalFindings: number;
    criticalFindings: number;
    highFindings: number;
    mediumFindings: number;
    lowFindings: number;
    infoFindings: number;
    agentsCompleted: number;
    agentsFailed: number;
  };
  recommendations: string[];
  soaComplianceScore: number;
}

/**
 * Review configuration
 */
export interface ReviewConfig {
  targetPath: string;
  includePatterns?: string[];
  excludePatterns?: string[];
  enabledAgents?: ReviewCategory[];
  minSeverity?: ReviewSeverity;
  parallel?: boolean;
}

/**
 * Base interface for review agents
 */
export interface IReviewAgent {
  name: string;
  category: ReviewCategory;
  review(config: ReviewConfig): Promise<AgentReviewResult>;
}
