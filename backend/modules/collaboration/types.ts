/**
 * Type definitions for Collaboration Module
 * Supports all 7 production-ready features
 */

// ========================================
// Enums and Constants
// ========================================

export type WorkspaceRole = 'owner' | 'admin' | 'member' | 'viewer';
export type ProjectStatus = 'active' | 'on_hold' | 'completed' | 'archived';
export type MemberStatus = 'active' | 'inactive' | 'invited' | 'suspended';
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'completed' | 'blocked';
export type ArticleStatus = 'draft' | 'review' | 'published' | 'archived';
export type MessageType = 'text' | 'file' | 'system' | 'alert';
export type NotificationType = 'mention' | 'assignment' | 'comment' | 'update' | 'alert' | 'message';
export type ActivityType = 'create' | 'update' | 'delete' | 'comment' | 'assign' | 'complete' | 'share';
export type PermissionLevel = 'none' | 'read' | 'write' | 'admin' | 'owner';

// ========================================
// Workspace Management
// ========================================

export interface Workspace {
  id: string;
  name: string;
  description: string;
  type: 'personal' | 'team' | 'organization';
  ownerId: string;
  members: WorkspaceMember[];
  projects: string[]; // Project IDs
  settings: WorkspaceSettings;
  quota: WorkspaceQuota;
  statistics: WorkspaceStatistics;
  tags: string[];
  isPublic: boolean;
  isArchived: boolean;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkspaceMember {
  userId: string;
  username: string;
  email: string;
  role: WorkspaceRole;
  status: MemberStatus;
  joinedAt: Date;
  lastActive?: Date;
  permissions: string[];
  invitedBy?: string;
}

export interface WorkspaceSettings {
  allowInvites: boolean;
  requireApproval: boolean;
  defaultRole: WorkspaceRole;
  visibilityOptions: {
    publicProjects: boolean;
    memberDirectory: boolean;
    activityFeed: boolean;
  };
  integrations: IntegrationConfig[];
  notifications: NotificationSettings;
}

export interface WorkspaceQuota {
  maxMembers: number;
  maxProjects: number;
  maxStorage: number; // bytes
  usedStorage: number;
  maxApiCalls: number;
  usedApiCalls: number;
}

export interface WorkspaceStatistics {
  totalMembers: number;
  activeMembers: number;
  totalProjects: number;
  activeProjects: number;
  totalTasks: number;
  completedTasks: number;
  totalArticles: number;
  totalMessages: number;
}

export interface IntegrationConfig {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  config: Record<string, any>;
  lastSync?: Date;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  slack: boolean;
  digest: 'realtime' | 'hourly' | 'daily' | 'weekly';
  types: NotificationType[];
}

// ========================================
// Project Management
// ========================================

export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  status: ProjectStatus;
  startDate?: Date;
  endDate?: Date;
  dueDate?: Date;
  ownerId: string;
  members: ProjectMember[];
  milestones: Milestone[];
  tasks: string[]; // Task IDs
  tags: string[];
  priority: TaskPriority;
  progress: number; // 0-100
  budget?: ProjectBudget;
  isPublic: boolean;
  template?: string;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectMember {
  userId: string;
  username: string;
  role: 'lead' | 'contributor' | 'viewer';
  joinedAt: Date;
  contributionScore?: number;
  tasksAssigned: number;
  tasksCompleted: number;
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  dueDate: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  progress: number; // 0-100
  tasks: string[]; // Task IDs
  completedAt?: Date;
}

export interface ProjectBudget {
  allocated: number;
  spent: number;
  currency: string;
  categories: BudgetCategory[];
}

export interface BudgetCategory {
  name: string;
  allocated: number;
  spent: number;
}

// ========================================
// Role-Based Access Control
// ========================================

export interface Role {
  id: string;
  name: string;
  description: string;
  workspaceId?: string;
  level: WorkspaceRole;
  permissions: Permission[];
  inheritsFrom?: string; // Role ID
  isSystem: boolean;
  userCount: number;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Permission {
  id: string;
  resource: string; // e.g., 'projects', 'tasks', 'articles'
  action: 'create' | 'read' | 'update' | 'delete' | 'share' | 'admin';
  level: PermissionLevel;
  conditions?: PermissionCondition[];
}

export interface PermissionCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'contains';
  value: any;
}

export interface AccessControl {
  resourceId: string;
  resourceType: string;
  ownerId: string;
  permissions: ResourcePermission[];
  inherited: boolean;
  public: boolean;
}

export interface ResourcePermission {
  subjectType: 'user' | 'role' | 'group';
  subjectId: string;
  level: PermissionLevel;
  grantedBy: string;
  grantedAt: Date;
  expiresAt?: Date;
}

export interface PermissionCheck {
  userId: string;
  resourceId: string;
  resourceType: string;
  action: string;
  allowed: boolean;
  reason?: string;
}

// ========================================
// Real-Time Collaboration
// ========================================

export interface CollaborationSession {
  id: string;
  resourceId: string;
  resourceType: 'document' | 'task' | 'project' | 'board';
  participants: SessionParticipant[];
  startedAt: Date;
  lastActivity: Date;
  isActive: boolean;
  changes: CollaborationChange[];
  cursors: CursorPosition[];
  locks: ResourceLock[];
}

export interface SessionParticipant {
  userId: string;
  username: string;
  joinedAt: Date;
  lastSeen: Date;
  isActive: boolean;
  color: string; // For cursor/selection highlighting
  permissions: string[];
}

export interface CollaborationChange {
  id: string;
  sessionId: string;
  userId: string;
  username: string;
  timestamp: Date;
  operation: 'insert' | 'delete' | 'replace' | 'move';
  path: string; // JSON path to changed field
  oldValue?: any;
  newValue?: any;
  applied: boolean;
  conflicted: boolean;
}

export interface CursorPosition {
  userId: string;
  username: string;
  position: {
    line?: number;
    column?: number;
    field?: string;
    selection?: {
      start: number;
      end: number;
    };
  };
  timestamp: Date;
  color: string;
}

export interface ResourceLock {
  resourceId: string;
  lockedBy: string;
  lockedAt: Date;
  expiresAt: Date;
  lockType: 'read' | 'write' | 'exclusive';
  reason?: string;
}

export interface PresenceInfo {
  userId: string;
  username: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen: Date;
  currentResource?: {
    type: string;
    id: string;
    name: string;
  };
  customStatus?: string;
}

// ========================================
// Task Management
// ========================================

export interface Task {
  id: string;
  projectId?: string;
  workspaceId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignees: TaskAssignee[];
  reporter: string;
  dueDate?: Date;
  startDate?: Date;
  completedAt?: Date;
  estimatedHours?: number;
  actualHours?: number;
  progress: number; // 0-100
  dependencies: TaskDependency[];
  subtasks: string[]; // Task IDs
  tags: string[];
  attachments: Attachment[];
  comments: Comment[];
  watchers: string[]; // User IDs
  customFields: Record<string, any>;
  metadata: Record<string, any>;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskAssignee {
  userId: string;
  username: string;
  assignedAt: Date;
  assignedBy: string;
  role?: string;
  workload?: number; // percentage
}

export interface TaskDependency {
  taskId: string;
  taskTitle: string;
  type: 'blocks' | 'blocked_by' | 'relates_to' | 'duplicates';
  status: TaskStatus;
}

export interface Attachment {
  id: string;
  filename: string;
  fileType: string;
  fileSize: number;
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
  thumbnail?: string;
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: Date;
  updatedAt?: Date;
  edited: boolean;
  mentions: string[]; // User IDs
  reactions: Reaction[];
  replies: Comment[];
}

export interface Reaction {
  emoji: string;
  userId: string;
  username: string;
  timestamp: Date;
}

export interface TaskBoard {
  id: string;
  workspaceId: string;
  projectId?: string;
  name: string;
  description: string;
  columns: BoardColumn[];
  tasks: string[]; // Task IDs
  filters: TaskFilter[];
  viewSettings: BoardViewSettings;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BoardColumn {
  id: string;
  name: string;
  status: TaskStatus;
  order: number;
  wipLimit?: number; // Work In Progress limit
  color?: string;
  taskCount: number;
}

export interface TaskFilter {
  field: string;
  operator: string;
  value: any;
}

export interface BoardViewSettings {
  groupBy?: 'status' | 'assignee' | 'priority' | 'project';
  sortBy?: 'priority' | 'dueDate' | 'createdAt' | 'title';
  showCompleted: boolean;
  compactView: boolean;
}

// ========================================
// Knowledge Base
// ========================================

export interface Article {
  id: string;
  workspaceId: string;
  categoryId?: string;
  title: string;
  slug: string;
  content: string;
  summary?: string;
  status: ArticleStatus;
  authorId: string;
  authorName: string;
  versions: ArticleVersion[];
  currentVersion: number;
  tags: string[];
  attachments: Attachment[];
  relatedArticles: string[]; // Article IDs
  viewCount: number;
  likeCount: number;
  comments: Comment[];
  isPublic: boolean;
  isPinned: boolean;
  publishedAt?: Date;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ArticleVersion {
  version: number;
  content: string;
  summary?: string;
  changedBy: string;
  changedAt: Date;
  changeNotes?: string;
  diff?: string;
}

export interface ArticleCategory {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  parentId?: string; // For hierarchical categories
  icon?: string;
  color?: string;
  order: number;
  articleCount: number;
  subcategories: string[]; // Category IDs
}

export interface ArticleSearch {
  query: string;
  filters?: {
    categoryId?: string;
    authorId?: string;
    tags?: string[];
    status?: ArticleStatus;
    dateRange?: {
      start: Date;
      end: Date;
    };
  };
  results: ArticleSearchResult[];
  totalCount: number;
  facets: {
    categories: Record<string, number>;
    tags: Record<string, number>;
    authors: Record<string, number>;
  };
}

export interface ArticleSearchResult {
  article: Article;
  score: number;
  highlights: string[];
  excerpt: string;
}

// ========================================
// Secure Messaging
// ========================================

export interface ChatChannel {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  type: 'public' | 'private' | 'direct' | 'group';
  members: ChannelMember[];
  messages: string[]; // Message IDs
  settings: ChannelSettings;
  isPinned: boolean;
  lastActivity: Date;
  metadata: Record<string, any>;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChannelMember {
  userId: string;
  username: string;
  role: 'admin' | 'member';
  joinedAt: Date;
  lastRead?: Date;
  unreadCount: number;
  notificationSettings?: {
    enabled: boolean;
    mentions: boolean;
    all: boolean;
  };
}

export interface ChatMessage {
  id: string;
  channelId: string;
  content: string;
  type: MessageType;
  authorId: string;
  authorName: string;
  timestamp: Date;
  edited: boolean;
  editedAt?: Date;
  encrypted: boolean;
  mentions: string[]; // User IDs
  attachments: Attachment[];
  reactions: Reaction[];
  replies: string[]; // Message IDs (for threads)
  parentId?: string; // For threaded messages
  metadata: Record<string, any>;
}

export interface ChannelSettings {
  allowGuests: boolean;
  requireApproval: boolean;
  messageRetention: number; // days, 0 = forever
  allowFileSharing: boolean;
  allowThreads: boolean;
  encryption: {
    enabled: boolean;
    algorithm?: 'AES-256' | 'RSA';
    keyRotation?: number; // days
  };
}

export interface DirectMessage {
  id: string;
  participants: string[]; // User IDs (max 2)
  messages: ChatMessage[];
  encryption: {
    enabled: boolean;
    publicKeys: Record<string, string>; // userId -> public key
  };
  lastActivity: Date;
  createdAt: Date;
}

// ========================================
// Activity Feed & Notifications
// ========================================

export interface ActivityFeed {
  workspaceId?: string;
  userId?: string;
  activities: Activity[];
  filters: ActivityFilter[];
  pagination: {
    limit: number;
    offset: number;
    totalCount: number;
  };
}

export interface Activity {
  id: string;
  type: ActivityType;
  actorId: string;
  actorName: string;
  resourceType: string;
  resourceId: string;
  resourceName: string;
  action: string;
  description: string;
  metadata: Record<string, any>;
  timestamp: Date;
  workspaceId: string;
  projectId?: string;
  visibility: 'public' | 'workspace' | 'project' | 'private';
}

export interface ActivityFilter {
  field: 'type' | 'actorId' | 'resourceType' | 'workspaceId' | 'projectId';
  value: any;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  actorId?: string;
  actorName?: string;
  resourceType?: string;
  resourceId?: string;
  resourceName?: string;
  actionUrl?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  read: boolean;
  readAt?: Date;
  channels: NotificationChannel[];
  metadata: Record<string, any>;
  createdAt: Date;
  expiresAt?: Date;
}

export interface NotificationChannel {
  type: 'in_app' | 'email' | 'push' | 'sms' | 'slack' | 'webhook';
  sent: boolean;
  sentAt?: Date;
  delivered: boolean;
  deliveredAt?: Date;
  error?: string;
}

export interface NotificationPreferences {
  userId: string;
  channels: {
    in_app: boolean;
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  types: Record<NotificationType, boolean>;
  digest: {
    enabled: boolean;
    frequency: 'daily' | 'weekly';
    time: string; // HH:MM format
  };
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM
    end: string; // HH:MM
    timezone: string;
  };
  workspaces: Record<string, boolean>; // workspaceId -> enabled
}

// ========================================
// Statistics and Analytics
// ========================================

export interface CollaborationStatistics {
  workspaces: {
    total: number;
    active: number;
    archived: number;
  };
  projects: {
    total: number;
    active: number;
    completed: number;
    onHold: number;
  };
  tasks: {
    total: number;
    byStatus: Record<TaskStatus, number>;
    byPriority: Record<TaskPriority, number>;
    overdue: number;
    completionRate: number;
  };
  articles: {
    total: number;
    published: number;
    draft: number;
    views: number;
  };
  messages: {
    total: number;
    today: number;
    activeChannels: number;
  };
  users: {
    total: number;
    active: number;
    online: number;
  };
}

export interface UserActivity {
  userId: string;
  period: {
    start: Date;
    end: Date;
  };
  metrics: {
    tasksCompleted: number;
    tasksCreated: number;
    commentsPosted: number;
    articlesCreated: number;
    messagesShared: number;
    hoursLogged: number;
  };
  topProjects: Array<{
    projectId: string;
    projectName: string;
    contributionScore: number;
  }>;
  activityTrend: Array<{
    date: string;
    activityCount: number;
  }>;
}

export interface TeamPerformance {
  workspaceId: string;
  projectId?: string;
  period: {
    start: Date;
    end: Date;
  };
  metrics: {
    velocity: number; // Tasks completed per period
    cycleTime: number; // Average time to complete
    throughput: number; // Tasks per day
    workInProgress: number;
    blockedTasks: number;
  };
  memberPerformance: Array<{
    userId: string;
    username: string;
    tasksCompleted: number;
    avgCompletionTime: number;
    contributionScore: number;
  }>;
  trends: {
    velocity: TrendData[];
    quality: TrendData[];
  };
}

export interface TrendData {
  date: string;
  value: number;
}
