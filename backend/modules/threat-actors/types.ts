/**
 * Type definitions for Threat Actors Module
 * Supports all 7 production-ready features
 */

// ========================================
// Enums and Constants
// ========================================

export type ActorType = 'nation_state' | 'cybercrime' | 'hacktivist' | 'insider' | 'terrorist' | 'unknown';
export type SophisticationLevel = 'none' | 'minimal' | 'intermediate' | 'advanced' | 'expert' | 'innovator' | 'strategic';
export type Motivation = 'financial' | 'espionage' | 'ideology' | 'sabotage' | 'revenge' | 'notoriety' | 'unknown';
export type ResourceLevel = 'individual' | 'group' | 'organization' | 'government';
export type ActivityStatus = 'active' | 'dormant' | 'retired' | 'unknown';
export type ConfidenceLevel = 'low' | 'medium' | 'high' | 'confirmed';
export type AttackPhase = 'reconnaissance' | 'weaponization' | 'delivery' | 'exploitation' | 'installation' | 'command_and_control' | 'actions_on_objective';

// ========================================
// Core Interfaces - Threat Actor
// ========================================

export interface ThreatActorProfile {
  id: string;
  name: string;
  aliases: string[];
  type: ActorType;
  sophisticationLevel: SophisticationLevel;
  motivations: Motivation[];
  description: string;
  firstSeen: Date;
  lastSeen: Date;
  activityStatus: ActivityStatus;
  origin?: {
    country?: string;
    region?: string;
  };
  attribution: AttributionInfo;
  capabilities: ActorCapabilities;
  targetProfile: TargetingProfile;
  relationships: ActorRelationship[];
  campaigns: string[]; // Campaign IDs
  ttps: ActorTTP[];
  indicators: string[]; // IOC IDs
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface AttributionInfo {
  confidence: ConfidenceLevel;
  evidenceCount: number;
  primaryIndicators: AttributionIndicator[];
  supportingEvidence: string[];
  analystNotes: string;
  lastUpdated: Date;
  alternativeAttributions: AlternativeAttribution[];
}

export interface AttributionIndicator {
  id: string;
  type: 'technical' | 'behavioral' | 'contextual' | 'linguistic';
  indicator: string;
  description: string;
  weight: number; // 0-100
  confidence: ConfidenceLevel;
  source: string;
  observedDate: Date;
}

export interface AlternativeAttribution {
  actorId: string;
  actorName: string;
  confidence: ConfidenceLevel;
  reasoning: string;
  evidenceCount: number;
}

// ========================================
// TTPs (Tactics, Techniques, Procedures)
// ========================================

export interface ActorTTP {
  id: string;
  actorId: string;
  mitreAttackId: string; // e.g., "T1566", "T1059"
  tactic: string; // e.g., "Initial Access", "Execution"
  technique: string; // e.g., "Phishing", "Command and Scripting Interpreter"
  subTechnique?: string;
  description: string;
  frequency: 'rare' | 'occasional' | 'frequent' | 'signature';
  observedCount: number;
  firstObserved: Date;
  lastObserved: Date;
  killChainPhases: AttackPhase[];
  associatedCampaigns: string[];
  tools: string[];
  mitigations: string[];
  detectionMethods: string[];
  confidence: ConfidenceLevel;
  metadata: Record<string, any>;
}

export interface TTPPattern {
  actorId: string;
  actorName: string;
  ttps: ActorTTP[];
  signature: {
    uniqueTechniques: string[];
    commonTechniques: string[];
    tacticalPreferences: Record<string, number>;
    toolPreferences: string[];
  };
  similarity: {
    overlapWith: Array<{
      actorId: string;
      actorName: string;
      overlapPercentage: number;
      sharedTechniques: string[];
    }>;
  };
}

export interface MitreAttackMapping {
  tactics: TacticMapping[];
  totalTechniques: number;
  coveragePercentage: number;
  heatMap: Record<string, number>; // Tactic -> Frequency
}

export interface TacticMapping {
  tacticId: string;
  tacticName: string;
  techniques: TechniqueMapping[];
  frequency: number;
}

export interface TechniqueMapping {
  techniqueId: string;
  techniqueName: string;
  subTechniques?: SubTechniqueMapping[];
  observedCount: number;
  firstSeen: Date;
  lastSeen: Date;
  campaigns: string[];
}

export interface SubTechniqueMapping {
  subTechniqueId: string;
  subTechniqueName: string;
  observedCount: number;
}

// ========================================
// Campaign Tracking
// ========================================

export interface Campaign {
  id: string;
  name: string;
  description: string;
  actorIds: string[];
  objectives: string[];
  startDate: Date;
  endDate?: Date;
  status: 'active' | 'concluded' | 'paused' | 'unknown';
  targets: CampaignTarget[];
  ttps: string[]; // TTP IDs
  infrastructure: CampaignInfrastructure;
  indicators: string[]; // IOC IDs
  victims: VictimOrganization[];
  timeline: CampaignEvent[];
  impactAssessment: ImpactAssessment;
  confidence: ConfidenceLevel;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CampaignTarget {
  targetType: 'sector' | 'organization' | 'individual' | 'geography' | 'technology';
  value: string;
  description?: string;
  priority: 'primary' | 'secondary' | 'opportunistic';
}

export interface CampaignInfrastructure {
  domains: InfrastructureAsset[];
  ipAddresses: InfrastructureAsset[];
  certificates: InfrastructureAsset[];
  registrars: string[];
  hostingProviders: string[];
  infrastructurePattern: string;
}

export interface InfrastructureAsset {
  value: string;
  type: string;
  firstSeen: Date;
  lastSeen: Date;
  status: 'active' | 'inactive' | 'sinkholed';
  relatedAssets: string[];
  notes?: string;
}

export interface VictimOrganization {
  id: string;
  name: string;
  sector: string;
  country: string;
  size?: string;
  attackDate: Date;
  impactLevel: 'low' | 'medium' | 'high' | 'critical';
  dataCompromised?: string[];
  publicDisclosure: boolean;
  sourceReferences: string[];
}

export interface CampaignEvent {
  id: string;
  timestamp: Date;
  eventType: 'initial_compromise' | 'lateral_movement' | 'data_exfiltration' | 'detection' | 'remediation' | 'other';
  description: string;
  ttps?: string[];
  indicators?: string[];
  source: string;
  confidence: ConfidenceLevel;
}

export interface ImpactAssessment {
  overallImpact: 'low' | 'medium' | 'high' | 'critical';
  affectedOrganizations: number;
  affectedSectors: string[];
  geographicSpread: string[];
  estimatedLosses?: {
    financial?: string;
    data?: string;
    operational?: string;
  };
  publicImpact: 'none' | 'limited' | 'moderate' | 'significant' | 'severe';
}

// ========================================
// Capability Assessment
// ========================================

export interface ActorCapabilities {
  overall: SophisticationLevel;
  technical: CapabilityDomain;
  operational: CapabilityDomain;
  resources: ResourceCapabilities;
  specializations: string[];
  assessment: CapabilityAssessment;
}

export interface CapabilityDomain {
  level: SophisticationLevel;
  strengths: string[];
  weaknesses: string[];
  uniqueCapabilities: string[];
  tools: ToolCapability[];
  techniques: string[];
}

export interface ToolCapability {
  name: string;
  type: 'malware' | 'exploit' | 'tool' | 'framework';
  sophistication: SophisticationLevel;
  custom: boolean;
  description?: string;
  firstSeen: Date;
  lastUsed: Date;
}

export interface ResourceCapabilities {
  level: ResourceLevel;
  funding: 'limited' | 'moderate' | 'substantial' | 'nation_state';
  personnel: 'individual' | 'small_team' | 'organization' | 'government';
  infrastructure: 'minimal' | 'moderate' | 'extensive';
  intelligence: 'limited' | 'moderate' | 'advanced';
  sustainabilityScore: number; // 0-100
}

export interface CapabilityAssessment {
  assessmentDate: Date;
  assessedBy: string;
  threatScore: number; // 0-100
  trendAnalysis: {
    direction: 'increasing' | 'stable' | 'decreasing';
    factors: string[];
  };
  comparisonToKnownActors: ActorComparison[];
  evolutionNotes: string;
  futureProjections: string[];
}

export interface ActorComparison {
  actorId: string;
  actorName: string;
  similarityScore: number; // 0-100
  similarCapabilities: string[];
  distinctCapabilities: string[];
}

// ========================================
// Targeting Analysis
// ========================================

export interface TargetingProfile {
  sectors: SectorTargeting[];
  geographies: GeographicTargeting[];
  organizations: OrganizationTargeting[];
  technologies: TechnologyTargeting[];
  patterns: TargetingPattern;
  victimology: VictimologyAnalysis;
}

export interface SectorTargeting {
  sector: string;
  priority: 'primary' | 'secondary' | 'opportunistic';
  attackCount: number;
  firstTargeted: Date;
  lastTargeted: Date;
  successRate: number; // percentage
  objectives: string[];
}

export interface GeographicTargeting {
  country: string;
  region?: string;
  attackCount: number;
  firstTargeted: Date;
  lastTargeted: Date;
  motivation?: string;
  geopoliticalContext?: string;
}

export interface OrganizationTargeting {
  organizationType: string; // e.g., "government", "defense", "financial"
  characteristics: string[];
  attackCount: number;
  selectionCriteria: string[];
}

export interface TechnologyTargeting {
  technology: string; // e.g., "Windows", "VPN", "Cloud Infrastructure"
  purpose: 'exploitation' | 'reconnaissance' | 'persistence' | 'exfiltration';
  frequency: 'rare' | 'occasional' | 'frequent';
  relatedTTPs: string[];
}

export interface TargetingPattern {
  primaryFocus: string;
  targetSelection: 'opportunistic' | 'targeted' | 'strategic';
  geographicSpread: 'localized' | 'regional' | 'global';
  sectorDiversity: 'focused' | 'diverse';
  timingPatterns: {
    timeOfDay?: string;
    daysOfWeek?: string[];
    seasonality?: string;
  };
  evolutionTrend: string;
}

export interface VictimologyAnalysis {
  totalVictims: number;
  victimProfile: {
    averageSize?: string;
    commonCharacteristics: string[];
    vulnerabilities: string[];
  };
  victimDistribution: {
    bySector: Record<string, number>;
    byCountry: Record<string, number>;
    bySize: Record<string, number>;
  };
  successFactors: string[];
  protectiveFactors: string[];
}

// ========================================
// Actor Relationships
// ========================================

export interface ActorRelationship {
  id: string;
  actorId: string; // Primary actor
  relatedActorId: string; // Related actor
  relatedActorName: string;
  relationshipType: RelationshipType;
  confidence: ConfidenceLevel;
  description: string;
  evidence: string[];
  sharedAttributes: SharedAttributes;
  firstObserved: Date;
  lastObserved: Date;
  status: 'active' | 'historical' | 'suspected';
  metadata: Record<string, any>;
}

export type RelationshipType =
  | 'alias' // Same actor, different name
  | 'affiliated' // Working together
  | 'contractor' // One hired by the other
  | 'competitor' // Competing interests
  | 'supplier' // Provides tools/services
  | 'customer' // Uses tools/services
  | 'merged' // Merged into one
  | 'split' // Split from another
  | 'successor' // Successor to another
  | 'predecessor' // Predecessor of another
  | 'overlapping' // Some overlap in TTPs/targets
  | 'unknown';

export interface SharedAttributes {
  ttps: string[]; // Shared TTP IDs
  tools: string[];
  infrastructure: string[];
  targets: string[];
  indicators: string[];
  operationalPatterns: string[];
}

export interface RelationshipGraph {
  actorId: string;
  actorName: string;
  relationships: ActorRelationship[];
  network: {
    directConnections: number;
    indirectConnections: number;
    clusters: ActorCluster[];
    centralityScore: number; // 0-100
  };
  visualization?: {
    nodes: GraphNode[];
    edges: GraphEdge[];
  };
}

export interface ActorCluster {
  id: string;
  name: string;
  members: string[]; // Actor IDs
  commonAttributes: string[];
  description: string;
}

export interface GraphNode {
  id: string;
  label: string;
  type: ActorType;
  sophistication: SophisticationLevel;
  metadata: Record<string, any>;
}

export interface GraphEdge {
  source: string;
  target: string;
  relationshipType: RelationshipType;
  confidence: ConfidenceLevel;
  weight: number;
}

// ========================================
// Statistics and Analytics
// ========================================

export interface ActorStatistics {
  totalActors: number;
  activeActors: number;
  byType: Record<ActorType, number>;
  bySophistication: Record<SophisticationLevel, number>;
  byMotivation: Record<Motivation, number>;
  byOrigin: Record<string, number>;
  totalCampaigns: number;
  activeCampaigns: number;
  totalTTPs: number;
  topActorsByActivity: Array<{
    actorId: string;
    actorName: string;
    campaignCount: number;
    ttpCount: number;
    threatScore: number;
  }>;
  emergingThreats: Array<{
    actorId: string;
    actorName: string;
    reason: string;
    firstSeen: Date;
  }>;
  trends: {
    newActorsThisMonth: number;
    newCampaignsThisMonth: number;
    mostTargetedSectors: string[];
    mostTargetedCountries: string[];
  };
}

export interface ActorSearchFilters {
  actorType?: ActorType;
  sophistication?: SophisticationLevel;
  motivation?: Motivation;
  activityStatus?: ActivityStatus;
  country?: string;
  sector?: string; // Targeting sector
  minThreatScore?: number;
  hasActiveCampaigns?: boolean;
  searchTerm?: string;
}

export interface ActorEnrichmentData {
  actorId: string;
  sourceType: 'osint' | 'threat_feed' | 'internal' | 'partner';
  source: string;
  dataType: 'ttp' | 'indicator' | 'campaign' | 'relationship' | 'capability';
  data: Record<string, any>;
  confidence: ConfidenceLevel;
  timestamp: Date;
  verified: boolean;
}

// ========================================
// Response Types
// ========================================

export interface ActorAnalysisResponse {
  actor: ThreatActorProfile;
  analysis: {
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    threatScore: number;
    keyFindings: string[];
    recommendations: string[];
  };
  relatedActors: Array<{
    actorId: string;
    actorName: string;
    relationshipType: RelationshipType;
    similarity: number;
  }>;
  recentActivity: {
    campaigns: Campaign[];
    newTTPs: ActorTTP[];
    newTargets: string[];
  };
}

export interface CampaignAnalysisResponse {
  campaign: Campaign;
  analysis: {
    stage: 'initial' | 'active' | 'advanced' | 'concluded';
    threatLevel: 'low' | 'medium' | 'high' | 'critical';
    scope: 'limited' | 'moderate' | 'widespread';
    sophistication: SophisticationLevel;
  };
  attribution: {
    primaryActor: string;
    confidence: ConfidenceLevel;
    alternativeActors: string[];
  };
  indicators: {
    iocs: string[];
    ttps: string[];
    infrastructure: string[];
  };
  recommendations: {
    defensiveMeasures: string[];
    detectionRules: string[];
    mitigations: string[];
  };
}
