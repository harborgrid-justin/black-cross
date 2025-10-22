/**
 * Central export file for all custom hooks
 * 
 * This file provides a single import point for all domain-specific hooks
 * Each hook provides queries, mutations, and composite operations for its domain
 */

// Threat Intelligence hooks
export { useThreatIntelligence, useThreatQuery, useThreatMutation, useThreatComposite } from './useThreatIntelligence';

// Incident Response hooks
export { useIncidentResponse, useIncidentQuery, useIncidentMutation, useIncidentComposite } from './useIncidentResponse';

// Vulnerability Management hooks
export { useVulnerabilityManagement, useVulnerabilityQuery, useVulnerabilityMutation, useVulnerabilityComposite } from './useVulnerabilityManagement';

// IoC Management hooks
export { useIoCManagement, useIoCQuery, useIoCMutation, useIoCComposite } from './useIoCManagement';

// Threat Actor hooks
export { useThreatActors, useThreatActorQuery, useThreatActorMutation, useThreatActorComposite } from './useThreatActors';

// Threat Feeds hooks
export { useThreatFeeds, useThreatFeedQuery, useThreatFeedMutation, useThreatFeedComposite } from './useThreatFeeds';

// Risk Assessment hooks
export { useRiskAssessment, useRiskQuery, useRiskMutation, useRiskComposite } from './useRiskAssessment';

// Automation/Playbooks hooks
export { useAutomation, useAutomationQuery, useAutomationMutation, useAutomationComposite } from './useAutomation';

// SIEM hooks
export { useSIEM, useSIEMQuery, useSIEMMutation, useSIEMComposite } from './useSIEM';

// Malware Analysis hooks
export { useMalwareAnalysis, useMalwareQuery, useMalwareMutation, useMalwareComposite } from './useMalwareAnalysis';

// Dark Web Monitoring hooks
export { useDarkWeb, useDarkWebQuery, useDarkWebMutation, useDarkWebComposite } from './useDarkWeb';

// Compliance Management hooks
export { useCompliance, useComplianceQuery, useComplianceMutation, useComplianceComposite } from './useCompliance';

// Collaboration hooks
export { useCollaboration, useCollaborationQuery, useCollaborationMutation, useCollaborationComposite } from './useCollaboration';

// Reporting & Analytics hooks
export { useReporting, useReportingQuery, useReportingMutation, useReportingComposite } from './useReporting';

// Threat Hunting hooks
export { useThreatHunting, useThreatHuntingQuery, useThreatHuntingMutation, useThreatHuntingComposite } from './useThreatHunting';
