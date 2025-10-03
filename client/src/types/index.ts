// Common Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'analyst' | 'viewer';
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

// Threat Intelligence Types
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

export interface Indicator {
  type: 'ip' | 'domain' | 'url' | 'hash' | 'email' | 'filename' | 'registry' | 'mutex';
  value: string;
  confidence?: number;
}

export interface Relationship {
  threatId: string;
  relationshipType: string;
  confidence: number;
}

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

export interface MitreData {
  tactics?: string[];
  techniques?: string[];
  groups?: string[];
}

// Taxonomy Types
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

export interface TaxonomyCategory {
  id: string;
  name: string;
  description: string;
  parentId?: string;
  children?: TaxonomyCategory[];
}

export interface FrameworkMapping {
  framework: string;
  mappingId: string;
  description: string;
}

// Incident Types
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

export interface TimelineEvent {
  id: string;
  timestamp: string;
  event: string;
  actor: string;
  details?: string;
}

export interface Evidence {
  id: string;
  type: string;
  description: string;
  fileUrl?: string;
  metadata?: Record<string, unknown>;
  collectedAt: string;
}

// Vulnerability Types
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

// Risk Assessment Types
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

// IoC Types
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

// Threat Actor Types
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

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

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

// Filter and Query Types
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
