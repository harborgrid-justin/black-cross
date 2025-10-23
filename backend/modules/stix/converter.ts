/**
 * STIX 2.1 Converter
 * Converts between Black-Cross entities and STIX 2.1 format
 * Adapted from OpenCTI Platform
 */

import { v4 as uuidv4 } from 'uuid';
import type { STIXObject, STIXBundle, Indicator, Malware, ThreatActor, Vulnerability, Relationship } from './types';

export class STIXConverter {
  /**
   * Generate STIX 2.1 ID
   */
  generateSTIXId(type: string): string {
    return `${type}--${uuidv4()}`;
  }

  /**
   * Get current timestamp in STIX format
   */
  getSTIXTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * Convert Black-Cross indicator to STIX Indicator
   */
  indicatorToSTIX(indicator: any): Indicator {
    const timestamp = this.getSTIXTimestamp();
    
    return {
      type: 'indicator',
      spec_version: '2.1',
      id: indicator.stix_id || this.generateSTIXId('indicator'),
      created: indicator.created_at || timestamp,
      modified: indicator.updated_at || timestamp,
      name: indicator.name,
      description: indicator.description,
      indicator_types: indicator.types || ['malicious-activity'],
      pattern: indicator.pattern || `[${indicator.type}:value = '${indicator.value}']`,
      pattern_type: 'stix',
      valid_from: indicator.valid_from || timestamp,
      valid_until: indicator.valid_until,
      confidence: indicator.confidence,
      labels: indicator.labels
    };
  }

  /**
   * Convert Black-Cross threat to STIX Malware
   */
  threatToSTIX(threat: any): Malware {
    const timestamp = this.getSTIXTimestamp();
    
    return {
      type: 'malware',
      spec_version: '2.1',
      id: threat.stix_id || this.generateSTIXId('malware'),
      created: threat.created_at || timestamp,
      modified: threat.updated_at || timestamp,
      name: threat.name,
      description: threat.description,
      malware_types: threat.types || ['trojan'],
      is_family: threat.is_family || false,
      aliases: threat.aliases,
      first_seen: threat.first_seen,
      last_seen: threat.last_seen,
      labels: threat.labels
    };
  }

  /**
   * Convert Black-Cross threat actor to STIX ThreatActor
   */
  threatActorToSTIX(actor: any): ThreatActor {
    const timestamp = this.getSTIXTimestamp();
    
    return {
      type: 'threat-actor',
      spec_version: '2.1',
      id: actor.stix_id || this.generateSTIXId('threat-actor'),
      created: actor.created_at || timestamp,
      modified: actor.updated_at || timestamp,
      name: actor.name,
      description: actor.description,
      threat_actor_types: actor.types || ['criminal'],
      aliases: actor.aliases,
      first_seen: actor.first_seen,
      last_seen: actor.last_seen,
      goals: actor.goals,
      sophistication: actor.sophistication,
      resource_level: actor.resource_level,
      primary_motivation: actor.primary_motivation,
      labels: actor.labels
    };
  }

  /**
   * Convert Black-Cross vulnerability to STIX Vulnerability
   */
  vulnerabilityToSTIX(vuln: any): Vulnerability {
    const timestamp = this.getSTIXTimestamp();
    
    return {
      type: 'vulnerability',
      spec_version: '2.1',
      id: vuln.stix_id || this.generateSTIXId('vulnerability'),
      created: vuln.created_at || timestamp,
      modified: vuln.updated_at || timestamp,
      name: vuln.name || vuln.cve_id,
      description: vuln.description,
      external_references: vuln.cve_id ? [{
        source_name: 'cve',
        external_id: vuln.cve_id,
        url: `https://cve.mitre.org/cgi-bin/cvename.cgi?name=${vuln.cve_id}`
      }] : undefined,
      labels: vuln.labels
    };
  }

  /**
   * Create STIX Relationship
   */
  createRelationship(
    sourceRef: string,
    targetRef: string,
    relationshipType: string,
    description?: string
  ): Relationship {
    const timestamp = this.getSTIXTimestamp();
    
    return {
      type: 'relationship',
      spec_version: '2.1',
      id: this.generateSTIXId('relationship'),
      created: timestamp,
      modified: timestamp,
      relationship_type: relationshipType,
      source_ref: sourceRef,
      target_ref: targetRef,
      description
    };
  }

  /**
   * Create STIX Bundle from objects
   */
  createBundle(objects: STIXObject[]): STIXBundle {
    return {
      type: 'bundle',
      id: this.generateSTIXId('bundle'),
      objects
    };
  }

  /**
   * Convert STIX Indicator to Black-Cross format
   */
  stixToIndicator(stixIndicator: Indicator): any {
    return {
      stix_id: stixIndicator.id,
      name: stixIndicator.name,
      description: stixIndicator.description,
      pattern: stixIndicator.pattern,
      types: stixIndicator.indicator_types,
      valid_from: stixIndicator.valid_from,
      valid_until: stixIndicator.valid_until,
      confidence: stixIndicator.confidence,
      labels: stixIndicator.labels,
      created_at: stixIndicator.created,
      updated_at: stixIndicator.modified
    };
  }

  /**
   * Parse STIX pattern to extract IOC value
   */
  parsePattern(pattern: string): { type: string; value: string } | null {
    // Simple pattern parser for basic patterns
    // Example: [ipv4-addr:value = '192.168.1.1']
    const match = pattern.match(/\[([^:]+):value\s*=\s*'([^']+)'\]/);
    if (match) {
      return { type: match[1], value: match[2] };
    }
    return null;
  }

  /**
   * Export entities to STIX bundle
   */
  exportToBundle(entities: {
    indicators?: any[];
    threats?: any[];
    threatActors?: any[];
    vulnerabilities?: any[];
  }): STIXBundle {
    const objects: STIXObject[] = [];

    if (entities.indicators) {
      objects.push(...entities.indicators.map(i => this.indicatorToSTIX(i)));
    }

    if (entities.threats) {
      objects.push(...entities.threats.map(t => this.threatToSTIX(t)));
    }

    if (entities.threatActors) {
      objects.push(...entities.threatActors.map(a => this.threatActorToSTIX(a)));
    }

    if (entities.vulnerabilities) {
      objects.push(...entities.vulnerabilities.map(v => this.vulnerabilityToSTIX(v)));
    }

    return this.createBundle(objects);
  }

  /**
   * Import STIX bundle
   */
  importBundle(bundle: STIXBundle): {
    indicators: any[];
    threats: any[];
    threatActors: any[];
    vulnerabilities: any[];
    relationships: any[];
  } {
    const result = {
      indicators: [] as any[],
      threats: [] as any[],
      threatActors: [] as any[],
      vulnerabilities: [] as any[],
      relationships: [] as any[]
    };

    for (const obj of bundle.objects) {
      switch (obj.type) {
        case 'indicator':
          result.indicators.push(this.stixToIndicator(obj as Indicator));
          break;
        case 'malware':
          result.threats.push(obj);
          break;
        case 'threat-actor':
          result.threatActors.push(obj);
          break;
        case 'vulnerability':
          result.vulnerabilities.push(obj);
          break;
        case 'relationship':
          result.relationships.push(obj);
          break;
      }
    }

    return result;
  }
}

/**
 * Singleton instance
 */
export const stixConverter = new STIXConverter();
