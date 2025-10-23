/**
 * STIX 2.1 Type Definitions
 * Adapted from OpenCTI Platform
 * 
 * Implements core STIX 2.1 data model types
 */

export const STIX_SPEC_VERSION = '2.1';

// Base STIX Object
export interface STIXObject {
  type: string;
  spec_version: string;
  id: string;
  created: string; // ISO 8601 timestamp
  modified: string; // ISO 8601 timestamp
  created_by_ref?: string;
  revoked?: boolean;
  labels?: string[];
  confidence?: number;
  lang?: string;
  external_references?: ExternalReference[];
  object_marking_refs?: string[];
  granular_markings?: GranularMarking[];
}

// External Reference
export interface ExternalReference {
  source_name: string;
  description?: string;
  url?: string;
  hashes?: { [algorithm: string]: string };
  external_id?: string;
}

// Granular Marking
export interface GranularMarking {
  lang?: string;
  marking_ref?: string;
  selectors: string[];
}

// STIX Domain Objects (SDOs)
export interface AttackPattern extends STIXObject {
  type: 'attack-pattern';
  name: string;
  description?: string;
  aliases?: string[];
  kill_chain_phases?: KillChainPhase[];
}

export interface Campaign extends STIXObject {
  type: 'campaign';
  name: string;
  description?: string;
  aliases?: string[];
  first_seen?: string;
  last_seen?: string;
  objective?: string;
}

export interface CourseOfAction extends STIXObject {
  type: 'course-of-action';
  name: string;
  description?: string;
}

export interface Identity extends STIXObject {
  type: 'identity';
  name: string;
  description?: string;
  roles?: string[];
  identity_class: 'individual' | 'group' | 'system' | 'organization' | 'class' | 'unknown';
  sectors?: string[];
  contact_information?: string;
}

export interface Indicator extends STIXObject {
  type: 'indicator';
  name?: string;
  description?: string;
  indicator_types?: string[];
  pattern: string;
  pattern_type: string;
  pattern_version?: string;
  valid_from: string;
  valid_until?: string;
  kill_chain_phases?: KillChainPhase[];
}

export interface Infrastructure extends STIXObject {
  type: 'infrastructure';
  name: string;
  description?: string;
  infrastructure_types?: string[];
  aliases?: string[];
  kill_chain_phases?: KillChainPhase[];
  first_seen?: string;
  last_seen?: string;
}

export interface IntrusionSet extends STIXObject {
  type: 'intrusion-set';
  name: string;
  description?: string;
  aliases?: string[];
  first_seen?: string;
  last_seen?: string;
  goals?: string[];
  resource_level?: string;
  primary_motivation?: string;
  secondary_motivations?: string[];
}

export interface Malware extends STIXObject {
  type: 'malware';
  name?: string;
  description?: string;
  malware_types?: string[];
  is_family: boolean;
  aliases?: string[];
  kill_chain_phases?: KillChainPhase[];
  first_seen?: string;
  last_seen?: string;
  operating_system_refs?: string[];
  architecture_execution_envs?: string[];
  implementation_languages?: string[];
  capabilities?: string[];
}

export interface ThreatActor extends STIXObject {
  type: 'threat-actor';
  name: string;
  description?: string;
  threat_actor_types?: string[];
  aliases?: string[];
  first_seen?: string;
  last_seen?: string;
  roles?: string[];
  goals?: string[];
  sophistication?: string;
  resource_level?: string;
  primary_motivation?: string;
  secondary_motivations?: string[];
  personal_motivations?: string[];
}

export interface Tool extends STIXObject {
  type: 'tool';
  name: string;
  description?: string;
  tool_types?: string[];
  aliases?: string[];
  kill_chain_phases?: KillChainPhase[];
  tool_version?: string;
}

export interface Vulnerability extends STIXObject {
  type: 'vulnerability';
  name: string;
  description?: string;
}

// STIX Relationship Objects (SROs)
export interface Relationship extends STIXObject {
  type: 'relationship';
  relationship_type: string;
  description?: string;
  source_ref: string;
  target_ref: string;
  start_time?: string;
  stop_time?: string;
}

export interface Sighting extends STIXObject {
  type: 'sighting';
  description?: string;
  first_seen?: string;
  last_seen?: string;
  count?: number;
  sighting_of_ref: string;
  observed_data_refs?: string[];
  where_sighted_refs?: string[];
  summary?: boolean;
}

// STIX Cyber Observable Objects (SCOs)
export interface ObservableObject extends STIXObject {
  type: string;
}

export interface IPv4Address extends ObservableObject {
  type: 'ipv4-addr';
  value: string;
  resolves_to_refs?: string[];
  belongs_to_refs?: string[];
}

export interface IPv6Address extends ObservableObject {
  type: 'ipv6-addr';
  value: string;
  resolves_to_refs?: string[];
  belongs_to_refs?: string[];
}

export interface DomainName extends ObservableObject {
  type: 'domain-name';
  value: string;
  resolves_to_refs?: string[];
}

export interface URL extends ObservableObject {
  type: 'url';
  value: string;
}

export interface File extends ObservableObject {
  type: 'file';
  hashes?: { [algorithm: string]: string };
  size?: number;
  name?: string;
  name_enc?: string;
  magic_number_hex?: string;
  mime_type?: string;
  ctime?: string;
  mtime?: string;
  atime?: string;
  parent_directory_ref?: string;
  contains_refs?: string[];
  content_ref?: string;
}

export interface EmailAddress extends ObservableObject {
  type: 'email-addr';
  value: string;
  display_name?: string;
  belongs_to_ref?: string;
}

export interface EmailMessage extends ObservableObject {
  type: 'email-message';
  is_multipart: boolean;
  date?: string;
  content_type?: string;
  from_ref?: string;
  sender_ref?: string;
  to_refs?: string[];
  cc_refs?: string[];
  bcc_refs?: string[];
  subject?: string;
  received_lines?: string[];
  additional_header_fields?: { [key: string]: any };
  body?: string;
  body_multipart?: EmailMIMEPart[];
  raw_email_ref?: string;
}

export interface EmailMIMEPart {
  body?: string;
  body_raw_ref?: string;
  content_type?: string;
  content_disposition?: string;
}

// Helper types
export interface KillChainPhase {
  kill_chain_name: string;
  phase_name: string;
}

// STIX Bundle
export interface STIXBundle {
  type: 'bundle';
  id: string;
  objects: STIXObject[];
}

// Union types for easier handling
export type STIXDomainObject = 
  | AttackPattern 
  | Campaign 
  | CourseOfAction 
  | Identity 
  | Indicator 
  | Infrastructure
  | IntrusionSet 
  | Malware 
  | ThreatActor 
  | Tool 
  | Vulnerability;

export type STIXRelationshipObject = Relationship | Sighting;

export type STIXCyberObservable = 
  | IPv4Address 
  | IPv6Address 
  | DomainName 
  | URL 
  | File 
  | EmailAddress 
  | EmailMessage;

export type AnySTIXObject = STIXDomainObject | STIXRelationshipObject | STIXCyberObservable;
