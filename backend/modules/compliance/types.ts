/**
 * Type definitions for Compliance Management Module
 * Supports all 7 production-ready features
 */

// ========================================
// Enums and Constants
// ========================================

export type FrameworkType = 'NIST_CSF' | 'ISO_27001' | 'PCI_DSS' | 'SOC2' | 'HIPAA' | 'GDPR' | 'Custom';
export type ComplianceStatus = 'compliant' | 'non_compliant' | 'partially_compliant' | 'not_assessed';
export type ControlStatus = 'implemented' | 'planned' | 'not_implemented' | 'not_applicable';
export type AuditStatus = 'scheduled' | 'in_progress' | 'completed' | 'failed';
export type PolicyStatus = 'draft' | 'review' | 'approved' | 'active' | 'archived';
export type EvidenceType = 'document' | 'screenshot' | 'log' | 'configuration' | 'report' | 'certificate';
export type RequirementStatus = 'met' | 'not_met' | 'partially_met' | 'pending';
export type GapSeverity = 'critical' | 'high' | 'medium' | 'low';

// ========================================
// Core Interfaces
// ========================================

export interface ComplianceFramework {
  id: string;
  name: string;
  type: FrameworkType;
  version: string;
  description: string;
  controls: Control[];
  requirements: Requirement[];
  categories: string[];
  effectiveDate: Date;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Control {
  id: string;
  controlId: string; // e.g., "AC-2", "ISO-27001-A.9.2.1"
  title: string;
  description: string;
  category: string;
  frameworkType: FrameworkType;
  requirements: string[];
  status: ControlStatus;
  implementation?: ControlImplementation;
  evidence: string[]; // Evidence IDs
  lastAssessed?: Date;
  nextAssessment?: Date;
  owner?: string;
  metadata: Record<string, any>;
}

export interface ControlImplementation {
  description: string;
  implementationDate: Date;
  implementedBy: string;
  configuration?: Record<string, any>;
  automationEnabled: boolean;
  testingRequired: boolean;
  lastTested?: Date;
}

export interface Requirement {
  id: string;
  requirementId: string;
  title: string;
  description: string;
  frameworkType: FrameworkType;
  category: string;
  controlIds: string[];
  status: RequirementStatus;
  mandatory: boolean;
  applicability?: string;
  guidance?: string;
  metadata: Record<string, any>;
}

// ========================================
// Audit Trail
// ========================================

export interface AuditEvent {
  id: string;
  timestamp: Date;
  eventType: string;
  userId: string;
  username?: string;
  action: string;
  resource: string;
  resourceId: string;
  changes?: Record<string, any>;
  outcome: 'success' | 'failure';
  ipAddress?: string;
  userAgent?: string;
  metadata: Record<string, any>;
}

export interface AuditFilters {
  startDate: Date;
  endDate: Date;
  userId?: string;
  eventType?: string;
  resource?: string;
  outcome?: 'success' | 'failure';
}

export interface AuditTrail {
  events: AuditEvent[];
  totalEvents: number;
  summary: {
    byEventType: Record<string, number>;
    byUser: Record<string, number>;
    byResource: Record<string, number>;
    successRate: number;
  };
}

// ========================================
// Gap Analysis
// ========================================

export interface ComplianceGap {
  id: string;
  controlId: string;
  controlTitle: string;
  requirementId: string;
  requirementTitle: string;
  frameworkType: FrameworkType;
  severity: GapSeverity;
  description: string;
  currentState: string;
  targetState: string;
  impact: string;
  remediation: RemediationPlan;
  identifiedDate: Date;
  dueDate?: Date;
  status: 'open' | 'in_progress' | 'resolved' | 'accepted';
  owner?: string;
  metadata: Record<string, any>;
}

export interface RemediationPlan {
  description: string;
  steps: RemediationStep[];
  estimatedEffort: string;
  assignedTo?: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  startDate?: Date;
  targetCompletionDate?: Date;
}

export interface RemediationStep {
  id: string;
  order: number;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  completedAt?: Date;
  completedBy?: string;
  notes?: string;
}

export interface GapAnalysisResult {
  frameworkType: FrameworkType;
  assessmentDate: Date;
  overallScore: number;
  complianceStatus: ComplianceStatus;
  totalControls: number;
  compliantControls: number;
  nonCompliantControls: number;
  gaps: ComplianceGap[];
  recommendations: string[];
  summary: {
    bySeverity: Record<GapSeverity, number>;
    byCategory: Record<string, number>;
  };
}

// ========================================
// Policy Management
// ========================================

export interface Policy {
  id: string;
  title: string;
  description: string;
  content: string;
  version: string;
  status: PolicyStatus;
  frameworkIds: string[];
  controlIds: string[];
  category: string;
  owner: string;
  approvers: string[];
  effectiveDate?: Date;
  reviewDate?: Date;
  nextReviewDate?: Date;
  approvalHistory: PolicyApproval[];
  attachments: string[];
  tags: string[];
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface PolicyApproval {
  approver: string;
  approvedAt: Date;
  comments?: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface PolicyViolation {
  id: string;
  policyId: string;
  policyTitle: string;
  violationType: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  detectedAt: Date;
  detectedBy?: string;
  userId?: string;
  resourceId?: string;
  evidence: string[];
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  resolution?: string;
  resolvedAt?: Date;
  resolvedBy?: string;
  metadata: Record<string, any>;
}

export interface PolicyEnforcementRule {
  id: string;
  policyId: string;
  name: string;
  description: string;
  ruleType: 'preventive' | 'detective' | 'corrective';
  conditions: RuleCondition[];
  action: 'block' | 'alert' | 'log' | 'escalate';
  enabled: boolean;
  severity: 'critical' | 'high' | 'medium' | 'low';
  metadata: Record<string, any>;
}

export interface RuleCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'regex';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

// ========================================
// Compliance Reporting
// ========================================

export interface ComplianceReport {
  id: string;
  title: string;
  frameworkType: FrameworkType;
  reportType: 'assessment' | 'audit' | 'gap_analysis' | 'executive_summary' | 'custom';
  period: {
    start: Date;
    end: Date;
  };
  overallScore: number;
  status: ComplianceStatus;
  controls: ControlAssessment[];
  gaps: ComplianceGap[];
  evidence: EvidenceReference[];
  recommendations: string[];
  executiveSummary: string;
  generatedAt: Date;
  generatedBy: string;
  metadata: Record<string, any>;
}

export interface ControlAssessment {
  controlId: string;
  controlTitle: string;
  status: ComplianceStatus;
  score: number;
  evidence: string[];
  findings: string[];
  assessedAt: Date;
  assessedBy?: string;
}

// ========================================
// Evidence Collection
// ========================================

export interface Evidence {
  id: string;
  title: string;
  description: string;
  type: EvidenceType;
  frameworkIds: string[];
  controlIds: string[];
  requirementIds: string[];
  filePath?: string;
  fileHash?: string;
  content?: string;
  capturedAt: Date;
  capturedBy: string;
  validFrom: Date;
  validUntil?: Date;
  tags: string[];
  chainOfCustody: CustodyRecord[];
  metadata: Record<string, any>;
  createdAt: Date;
}

export interface CustodyRecord {
  timestamp: Date;
  action: 'created' | 'accessed' | 'modified' | 'transferred' | 'verified';
  userId: string;
  username?: string;
  reason?: string;
  ipAddress?: string;
}

export interface EvidenceReference {
  evidenceId: string;
  title: string;
  type: EvidenceType;
  controlIds: string[];
  capturedAt: Date;
}

export interface EvidenceRequest {
  id: string;
  title: string;
  description: string;
  frameworkType: FrameworkType;
  controlIds: string[];
  requirementIds: string[];
  requestedBy: string;
  requestedAt: Date;
  dueDate: Date;
  assignedTo?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  evidenceIds: string[];
  metadata: Record<string, any>;
}

// ========================================
// Regulatory Requirement Tracking
// ========================================

export interface RegulatoryUpdate {
  id: string;
  frameworkType: FrameworkType;
  updateType: 'new_requirement' | 'modified_requirement' | 'removed_requirement' | 'guidance_update';
  title: string;
  description: string;
  affectedControls: string[];
  affectedRequirements: string[];
  effectiveDate: Date;
  publishedDate: Date;
  source: string;
  sourceUrl?: string;
  impact: 'high' | 'medium' | 'low';
  status: 'pending_review' | 'under_review' | 'implemented' | 'not_applicable';
  reviewedBy?: string;
  reviewedAt?: Date;
  implementationNotes?: string;
  metadata: Record<string, any>;
}

export interface RequirementMapping {
  id: string;
  frameworkType: FrameworkType;
  requirementId: string;
  controlIds: string[];
  policyIds: string[];
  automationEnabled: boolean;
  monitoringEnabled: boolean;
  lastVerified?: Date;
  nextVerification?: Date;
  metadata: Record<string, any>;
}

// ========================================
// Compliance Statistics
// ========================================

export interface ComplianceStatistics {
  frameworkType?: FrameworkType;
  overallScore: number;
  totalControls: number;
  compliantControls: number;
  nonCompliantControls: number;
  partiallyCompliantControls: number;
  notAssessedControls: number;
  byFramework: Record<FrameworkType, {
    score: number;
    controls: number;
    compliant: number;
  }>;
  byCategory: Record<string, {
    score: number;
    controls: number;
    compliant: number;
  }>;
  totalGaps: number;
  gapsBySeverity: Record<GapSeverity, number>;
  totalPolicies: number;
  activePolicies: number;
  totalEvidence: number;
  evidenceByType: Record<EvidenceType, number>;
  lastAssessment?: Date;
  nextAssessment?: Date;
}
