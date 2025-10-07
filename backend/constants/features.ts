/**
 * Platform Features Constants
 * Centralized feature names and descriptions
 */

/**
 * Platform feature list
 */
export const FEATURES = [
  'Threat Intelligence Management',
  'Incident Response & Management',
  'Threat Hunting Platform',
  'Vulnerability Management',
  'SIEM Integration',
  'Threat Actor Profiling',
  'IoC Management',
  'Threat Intelligence Feeds Integration',
  'Risk Assessment & Scoring',
  'Collaboration & Workflow',
  'Reporting & Analytics',
  'Malware Analysis & Sandbox',
  'Dark Web Monitoring',
  'Compliance & Audit Management',
  'Automated Response & Playbooks',
] as const;

/**
 * Module descriptions
 */
export const MODULE_DESCRIPTIONS = {
  THREAT_INTELLIGENCE: 'Threat intelligence collection and management',
  INCIDENT_RESPONSE: 'Security incident management and response',
  THREAT_HUNTING: 'Proactive threat hunting',
  VULNERABILITY_MANAGEMENT: 'Vulnerability tracking and management',
  SIEM: 'Security Information and Event Management',
  THREAT_ACTORS: 'Threat actor profiling and tracking',
  IOC_MANAGEMENT: 'Indicators of Compromise management',
  THREAT_FEEDS: 'External threat feed integration',
  RISK_ASSESSMENT: 'Risk assessment and scoring',
  COLLABORATION: 'Team collaboration and workflows',
  REPORTING: 'Reports and analytics',
  MALWARE_ANALYSIS: 'Malware analysis and sandbox',
  DARK_WEB: 'Dark web monitoring',
  COMPLIANCE: 'Compliance and audit management',
  AUTOMATION: 'Automated response and playbooks',
} as const;

/**
 * Swagger tags
 */
export const SWAGGER_TAGS = [
  { name: 'Authentication', description: 'User authentication and authorization' },
  { name: 'Threat Intelligence', description: 'Threat intelligence collection and management' },
  { name: 'Incident Response', description: 'Security incident management and response' },
  { name: 'Vulnerabilities', description: 'Vulnerability tracking and management' },
  { name: 'IoC Management', description: 'Indicators of Compromise management' },
  { name: 'Threat Actors', description: 'Threat actor profiling and tracking' },
  { name: 'Threat Feeds', description: 'External threat feed integration' },
  { name: 'Malware Analysis', description: 'Malware analysis and sandbox' },
  { name: 'SIEM', description: 'Security Information and Event Management' },
  { name: 'Compliance', description: 'Compliance and audit management' },
  { name: 'Dark Web', description: 'Dark web monitoring' },
  { name: 'Collaboration', description: 'Team collaboration and workflows' },
  { name: 'Reporting', description: 'Reports and analytics' },
  { name: 'Threat Hunting', description: 'Proactive threat hunting' },
  { name: 'Risk Assessment', description: 'Risk assessment and scoring' },
  { name: 'Automation', description: 'Automated response and playbooks' },
  { name: 'Health', description: 'System health and monitoring' },
] as const;
