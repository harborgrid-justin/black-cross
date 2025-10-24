/**
 * @fileoverview Central export point for all custom React hooks.
 *
 * This module provides domain-specific React hooks for the Black-Cross cybersecurity
 * platform. Each hook encapsulates state management and API operations for a specific
 * security feature domain.
 *
 * ## Architecture
 *
 * All hooks follow a consistent three-tier architecture:
 *
 * 1. **Query Hooks** (`useXxxQuery`): Read-only operations for fetching data
 *    - Manage loading and error states automatically
 *    - Return null on error for safe optional chaining
 *    - Use React Query patterns internally
 *
 * 2. **Mutation Hooks** (`useXxxMutation`): Write operations (create, update, delete)
 *    - Handle optimistic updates where appropriate
 *    - Manage loading and error states
 *    - Return updated entities or boolean success indicators
 *
 * 3. **Composite Hooks** (`useXxxComposite`): Multi-step operations
 *    - Combine multiple operations into single workflows
 *    - Provide convenience functions for common patterns
 *    - Manage state across the entire composite operation
 *
 * 4. **Main Hooks** (`useXxx`): Unified interface combining all three
 *    - Primary entry point for components
 *    - Returns organized object with queries, mutations, and composites
 *
 * ## Usage Pattern
 *
 * @example
 * ```tsx
 * import { useThreatIntelligence } from '@/hooks';
 *
 * function ThreatDashboard() {
 *   const { queries, mutations, composites } = useThreatIntelligence();
 *   const [threats, setThreats] = useState([]);
 *
 *   useEffect(() => {
 *     const loadThreats = async () => {
 *       const data = await queries.getThreats();
 *       if (data) setThreats(data);
 *     };
 *     loadThreats();
 *   }, [queries]);
 *
 *   const handleEnrich = async (id) => {
 *     const enriched = await mutations.enrichThreat(id);
 *     if (enriched) {
 *       // Update UI with enriched data
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       {queries.loading && <Spinner />}
 *       {queries.error && <Error message={queries.error} />}
 *       {threats.map(threat => (
 *         <ThreatCard
 *           key={threat.id}
 *           threat={threat}
 *           onEnrich={() => handleEnrich(threat.id)}
 *         />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 *
 * ## Available Hooks
 *
 * ### Core Security Operations
 * - `useThreatIntelligence` - Threat data collection, enrichment, and analysis
 * - `useIncidentResponse` - Incident lifecycle management and investigation
 * - `useVulnerabilityManagement` - Vulnerability scanning and remediation
 * - `useIoCManagement` - Indicators of Compromise tracking and validation
 *
 * ### Threat Analysis
 * - `useThreatActors` - Threat actor profiles, campaigns, and TTPs
 * - `useThreatFeeds` - External threat feed integration and management
 * - `useThreatHunting` - Proactive threat hunting hypotheses and queries
 * - `useMalwareAnalysis` - Malware sample analysis and YARA rules
 * - `useDarkWeb` - Dark web monitoring and credential leak detection
 *
 * ### Operations & Compliance
 * - `useAutomation` - Security playbook automation and orchestration
 * - `useSIEM` - Security Information and Event Management
 * - `useRiskAssessment` - Risk scoring and business impact analysis
 * - `useCompliance` - Compliance framework tracking and reporting
 *
 * ### Collaboration & Reporting
 * - `useCollaboration` - Team workspaces, tasks, and knowledge sharing
 * - `useReporting` - Analytics dashboards and report generation
 *
 * ## Error Handling
 *
 * All hooks implement consistent error handling:
 * - Errors are caught and stored in the `error` state
 * - Functions return `null` on error for safe optional chaining
 * - Loading state is always set to `false` in finally block
 * - Error messages are user-friendly and actionable
 *
 * ## State Management
 *
 * Each hook manages its own local state:
 * - `loading`: Boolean indicating operation in progress
 * - `error`: String error message or null
 * - Data state is managed by the consuming component
 *
 * ## TypeScript Support
 *
 * All hooks are fully typed with TypeScript:
 * - Strong typing for all parameters and return values
 * - Inferred types for excellent IDE support
 * - Generic types where appropriate for flexibility
 *
 * ## Best Practices
 *
 * 1. **Use the main hook** (`useXxx`) for most use cases
 * 2. **Check loading state** before displaying data
 * 3. **Handle errors gracefully** with user-friendly messages
 * 4. **Use composites** for multi-step workflows
 * 5. **Memoize callbacks** to prevent unnecessary re-renders
 * 6. **Clean up effects** to prevent memory leaks
 *
 * @module hooks
 * @see {@link https://react.dev/learn/reusing-logic-with-custom-hooks | React Custom Hooks}
 */

/**
 * Central export file for all custom hooks.
 *
 * This file provides a single import point for all domain-specific hooks.
 * Each hook provides queries, mutations, and composite operations for its domain.
 *
 * Import individual hooks:
 * ```tsx
 * import { useThreatIntelligence, useIncidentResponse } from '@/hooks';
 * ```
 *
 * Or import specific hook types:
 * ```tsx
 * import { useThreatQuery, useThreatMutation } from '@/hooks';
 * ```
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
