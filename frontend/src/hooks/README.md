# Custom React Hooks for Black-Cross

This directory contains production-ready React hooks for all domain/page sets in the Black-Cross platform. Each hook provides a clean abstraction layer between React components and the service layer.

## Architecture

Each domain has three types of hooks:

1. **Query Hooks** (`use[Domain]Query`) - For fetching data (GET operations)
2. **Mutation Hooks** (`use[Domain]Mutation`) - For creating, updating, deleting data (POST, PUT, DELETE operations)
3. **Composite Hooks** (`use[Domain]Composite`) - For complex operations that combine multiple queries/mutations

All hooks return:
- `loading`: Boolean indicating if the operation is in progress
- `error`: String containing error message if operation fails, null otherwise
- Operation-specific methods that return Promises

## Available Hooks

### Threat Intelligence (`useThreatIntelligence`)
Provides hooks for managing threat intelligence data.

**Queries:**
- `getThreats(filters?)` - Fetch all threats with optional filtering
- `getThreat(id)` - Fetch single threat by ID
- `getEnrichedThreat(id)` - Fetch threat with enrichment data

**Mutations:**
- `collectThreat(data)` - Create new threat
- `categorizeThreat(id, categories)` - Categorize existing threat
- `archiveThreat(id)` - Archive a threat
- `enrichThreat(id)` - Enrich threat with external data
- `updateThreat(id, data)` - Update threat
- `deleteThreat(id)` - Delete threat

**Composites:**
- `correlateThreats(threatIds)` - Correlate multiple threats
- `analyzeThreat(id)` - Analyze threat context
- `collectAndEnrich(data)` - Collect and immediately enrich a threat

### Incident Response (`useIncidentResponse`)
Manages security incidents and responses.

**Queries:**
- `getIncidents(filters?)` - Fetch all incidents
- `getIncident(id)` - Fetch single incident

**Mutations:**
- `createIncident(data)` - Create new incident
- `updateIncident(id, data)` - Update incident
- `deleteIncident(id)` - Delete incident
- `updateStatus(id, status)` - Update incident status
- `assignIncident(id, assignedTo)` - Assign incident to user
- `addTimelineEvent(id, event)` - Add event to timeline
- `addEvidence(id, evidence)` - Add evidence to incident

**Composites:**
- `createAndAssign(data, assignedTo)` - Create and immediately assign incident
- `resolveIncident(id, resolutionNotes)` - Resolve incident with notes

### Vulnerability Management (`useVulnerabilityManagement`)
Manages vulnerability scanning and tracking.

**Queries:**
- `getVulnerabilities(filters?)` - Fetch all vulnerabilities
- `getVulnerability(id)` - Fetch single vulnerability
- `getScanResults(scanId)` - Get results of a scan

**Mutations:**
- `createVulnerability(data)` - Create new vulnerability
- `updateVulnerability(id, data)` - Update vulnerability
- `deleteVulnerability(id)` - Delete vulnerability
- `updateStatus(id, status)` - Update vulnerability status
- `runScan(targets?)` - Run vulnerability scan

**Composites:**
- `scanAndRefresh(targets?, filters?)` - Run scan and fetch updated vulnerabilities
- `patchVulnerability(id)` - Mark vulnerability as patched

### IoC Management (`useIoCManagement`)
Manages Indicators of Compromise.

**Queries:**
- `getIoCs(filters?)` - Fetch all IoCs
- `getIoC(id)` - Fetch single IoC

**Mutations:**
- `createIoC(data)` - Create new IoC
- `updateIoC(id, data)` - Update IoC
- `deleteIoC(id)` - Delete IoC
- `bulkImport(iocs)` - Bulk import IoCs
- `exportIoCs(format)` - Export IoCs in specified format

**Composites:**
- `checkIoC(value, type)` - Check IoC against threat feeds
- `importAndCheck(iocs)` - Import and check IoCs

### Threat Actors (`useThreatActors`)
Manages threat actor profiles and intelligence.

**Queries:**
- `getActors(filters?)` - Fetch all threat actors
- `getActor(id)` - Fetch single threat actor
- `getActorCampaigns(id)` - Get actor's campaigns
- `getActorTTPs(id)` - Get actor's TTPs

**Mutations:**
- `createActor(data)` - Create new threat actor
- `updateActor(id, data)` - Update threat actor
- `deleteActor(id)` - Delete threat actor

**Composites:**
- `getActorProfile(id)` - Get complete actor profile with campaigns and TTPs

### Threat Feeds (`useThreatFeeds`)
Manages threat intelligence feeds.

**Queries:**
- `getFeeds()` - Fetch all threat feeds
- `getFeed(id)` - Fetch single feed
- `getFeedStats(id)` - Get feed statistics

**Mutations:**
- `createFeed(data)` - Create new feed
- `updateFeed(id, data)` - Update feed
- `deleteFeed(id)` - Delete feed
- `toggleFeed(id, enabled)` - Enable/disable feed
- `refreshFeed(id)` - Refresh feed data

**Composites:**
- `refreshAllFeeds(feedIds)` - Refresh multiple feeds

### Risk Assessment (`useRiskAssessment`)
Manages risk assessment and scoring.

**Queries:**
- `getRiskScores()` - Fetch all risk scores
- `getAssetCriticality(assetId)` - Get asset criticality
- `getPriorities()` - Get risk priorities
- `getTrends()` - Get risk trends
- `getExecutiveReport()` - Get executive risk report
- `getImpactAnalysis()` - Get impact analysis

**Mutations:**
- `assessAsset(data)` - Assess an asset
- `calculateRisk(data)` - Calculate risk score
- `generateReport(options)` - Generate risk report

**Composites:**
- `assessAndCalculate(assetData)` - Assess and calculate risk for asset

### Automation (`useAutomation`)
Manages security automation playbooks.

**Queries:**
- `listPlaybooks()` - List all playbooks
- `getPlaybook(id)` - Get single playbook
- `listExecutions()` - List playbook executions
- `getExecution(id)` - Get single execution
- `getLibrary()` - Get playbook library
- `getAnalytics()` - Get analytics

**Mutations:**
- `createPlaybook(data)` - Create new playbook
- `updatePlaybook(id, data)` - Update playbook
- `deletePlaybook(id)` - Delete playbook
- `executePlaybook(id, context?)` - Execute playbook
- `cancelExecution(id)` - Cancel execution

**Composites:**
- `createAndExecute(data, context?)` - Create and execute playbook

### SIEM (`useSIEM`)
Security Information and Event Management.

### Malware Analysis (`useMalwareAnalysis`)
Malware sample analysis and tracking.

### Dark Web Monitoring (`useDarkWeb`)
Dark web monitoring and threat detection.

### Compliance Management (`useCompliance`)
Compliance framework and control management.

### Collaboration (`useCollaboration`)
Team collaboration and workspace management.

### Reporting & Analytics (`useReporting`)
Report generation and analytics.

### Threat Hunting (`useThreatHunting`)
Proactive threat hunting operations.

## Usage Example

```typescript
import { useThreatIntelligence } from '@/hooks';

function ThreatsList() {
  const { queries, mutations } = useThreatIntelligence();
  const [threats, setThreats] = useState([]);

  useEffect(() => {
    const fetchThreats = async () => {
      const result = await queries.getThreats({ status: 'active' });
      if (result && result.data) {
        setThreats(result.data);
      }
    };
    fetchThreats();
  }, []);

  const handleArchive = async (id: string) => {
    const result = await mutations.archiveThreat(id);
    if (result) {
      // Refresh threats list
      const updated = await queries.getThreats();
      if (updated && updated.data) {
        setThreats(updated.data);
      }
    }
  };

  return (
    <div>
      {queries.loading && <div>Loading...</div>}
      {queries.error && <div>Error: {queries.error}</div>}
      {threats.map(threat => (
        <div key={threat.id}>
          {threat.name}
          <button onClick={() => handleArchive(threat.id)}>Archive</button>
        </div>
      ))}
    </div>
  );
}
```

## Design Principles

1. **Consistent API**: All hooks follow the same pattern for predictability
2. **Error Handling**: Built-in error handling and state management
3. **Type Safety**: Full TypeScript support with proper types
4. **Composable**: Hooks can be used independently or combined
5. **Separation of Concerns**: Clear distinction between queries, mutations, and composites
6. **Loading States**: Built-in loading state management
7. **Clean Up**: Proper cleanup and cancellation support

## Testing

Each hook can be tested independently using React Testing Library:

```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useThreatIntelligence } from '@/hooks';

test('fetches threats', async () => {
  const { result } = renderHook(() => useThreatIntelligence());
  
  await act(async () => {
    await result.current.queries.getThreats();
  });
  
  expect(result.current.queries.loading).toBe(false);
  expect(result.current.queries.error).toBe(null);
});
```

## Migration Guide

To migrate from direct service calls to hooks:

**Before:**
```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

const fetchThreats = async () => {
  try {
    setLoading(true);
    const response = await threatService.getThreats();
    setThreats(response.data);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

**After:**
```typescript
const { queries } = useThreatIntelligence();

const fetchThreats = async () => {
  const response = await queries.getThreats();
  if (response) {
    setThreats(response.data);
  }
};

// Access loading and error from queries
const { loading, error } = queries;
```

## Contributing

When adding new hooks:
1. Follow the existing pattern (Query, Mutation, Composite)
2. Include proper TypeScript types
3. Add error handling
4. Include loading states
5. Update this README
6. Add to the main index.ts export
