/**
 * Playbook Automation - Type Definitions
 * Adapted from OpenCTI Platform
 */

export enum PlaybookStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived'
}

export enum ExecutionStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum ComponentType {
  TRIGGER = 'trigger',
  CONDITION = 'condition',
  ACTION = 'action',
  LOOP = 'loop',
  PARALLEL = 'parallel'
}

export enum TriggerType {
  MANUAL = 'manual',
  SCHEDULED = 'scheduled',
  EVENT = 'event',
  WEBHOOK = 'webhook'
}

export enum ActionType {
  CREATE_INCIDENT = 'create_incident',
  UPDATE_ENTITY = 'update_entity',
  SEND_NOTIFICATION = 'send_notification',
  ENRICH_IOC = 'enrich_ioc',
  RUN_QUERY = 'run_query',
  HTTP_REQUEST = 'http_request',
  AI_ANALYSIS = 'ai_analysis',
  EXPORT_DATA = 'export_data'
}

export interface Playbook {
  id: string;
  name: string;
  description?: string;
  status: PlaybookStatus;
  components: PlaybookComponent[];
  created_by: string;
  created_at: Date;
  updated_at: Date;
  tags?: string[];
}

export interface PlaybookComponent {
  id: string;
  type: ComponentType;
  name: string;
  config: ComponentConfig;
  position: { x: number; y: number };
  next?: string[]; // IDs of next components
}

export type ComponentConfig = 
  | TriggerConfig 
  | ConditionConfig 
  | ActionConfig 
  | LoopConfig 
  | ParallelConfig;

export interface TriggerConfig {
  triggerType: TriggerType;
  schedule?: string; // Cron expression
  eventType?: string;
  webhookUrl?: string;
}

export interface ConditionConfig {
  expression: string; // JavaScript expression
  trueNext?: string;
  falseNext?: string;
}

export interface ActionConfig {
  actionType: ActionType;
  parameters: Record<string, any>;
}

export interface LoopConfig {
  collection: string; // Variable name
  itemVariable: string;
  body: string[]; // Component IDs
}

export interface ParallelConfig {
  branches: string[][]; // Array of component ID arrays
}

export interface PlaybookExecution {
  id: string;
  playbook_id: string;
  status: ExecutionStatus;
  started_at: Date;
  completed_at?: Date;
  triggered_by: string;
  trigger_data?: any;
  steps: ExecutionStep[];
  error?: string;
}

export interface ExecutionStep {
  component_id: string;
  component_name: string;
  status: ExecutionStatus;
  started_at: Date;
  completed_at?: Date;
  input?: any;
  output?: any;
  error?: string;
}

export interface ExecutionContext {
  execution_id: string;
  variables: Record<string, any>;
  user_id: string;
}
