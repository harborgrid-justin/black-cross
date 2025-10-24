# React Hooks JSDoc Documentation Template

This template provides comprehensive JSDoc patterns for all custom React hooks in this project.

## Hook Structure Pattern

Each domain-specific hook file exports four main functions:
1. `useXxxQuery()` - Read operations
2. `useXxxMutation()` - Write operations
3. `useXxxComposite()` - Complex multi-step operations
4. `useXxx()` - Main hook combining all three

## Complete Documentation Template

### Query Hook Template

```typescript
/**
 * Custom hook for [domain] query operations.
 *
 * Provides read-only operations for retrieving [domain] data from the backend
 * service. Manages loading and error states automatically for each operation.
 *
 * @returns {Object} Query operations and state
 * @returns {Function} returns.[operation1] - Description of operation
 * @returns {Function} returns.[operation2] - Description of operation
 * @returns {boolean} returns.loading - Loading state indicator
 * @returns {string | null} returns.error - Error message if operation failed
 *
 * @example
 * ```tsx
 * function ComponentName() {
 *   const { [operation], loading, error } = use[Domain]Query();
 *
 *   useEffect(() => {
 *     const fetchData = async () => {
 *       const data = await [operation]();
 *       console.log(data);
 *     };
 *     fetchData();
 *   }, []);
 *
 *   if (loading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error}</div>;
 *   return <div>Data loaded</div>;
 * }
 * ```
 */
export function use[Domain]Query() {
  // Implementation
}
```

### Individual Query Function Template

```typescript
/**
 * Retrieves [description of what is retrieved].
 *
 * [Additional details about the operation, including any side effects,
 * filtering capabilities, or special behavior]
 *
 * @param {Type} [paramName] - Description of parameter
 * @returns {Promise<ReturnType | null>} Description of return value or null on error
 *
 * @example
 * ```tsx
 * const data = await [functionName]('param-value');
 * if (data) {
 *   console.log(`Found ${data.length} items`);
 * }
 * ```
 */
const [functionName] = useCallback(async (param?: Type): Promise<ReturnType | null> => {
  // Implementation
}, []);
```

### Mutation Hook Template

```typescript
/**
 * Custom hook for [domain] mutation operations.
 *
 * Provides write operations for creating, updating, and deleting [domain] data.
 * Manages loading and error states automatically for each operation.
 *
 * @returns {Object} Mutation operations and state
 * @returns {Function} returns.create[Entity] - Create new [entity]
 * @returns {Function} returns.update[Entity] - Update existing [entity]
 * @returns {Function} returns.delete[Entity] - Delete [entity]
 * @returns {boolean} returns.loading - Loading state indicator
 * @returns {string | null} returns.error - Error message if operation failed
 *
 * @example
 * ```tsx
 * function CreateForm() {
 *   const { create[Entity], loading, error } = use[Domain]Mutation();
 *
 *   const handleSubmit = async (data) => {
 *     const result = await create[Entity](data);
 *     if (result) {
 *       console.log('Created:', result.id);
 *     }
 *   };
 *
 *   return <form onSubmit={handleSubmit}>...</form>;
 * }
 * ```
 */
export function use[Domain]Mutation() {
  // Implementation
}
```

### Composite Hook Template

```typescript
/**
 * Custom hook for composite [domain] operations.
 *
 * Provides complex multi-step operations that combine multiple [domain]
 * actions into single convenient functions. Manages loading and error states
 * for the entire composite operation.
 *
 * @returns {Object} Composite operations and state
 * @returns {Function} returns.[compositeName] - Description of composite operation
 * @returns {boolean} returns.loading - Loading state indicator
 * @returns {string | null} returns.error - Error message if operation failed
 *
 * @example
 * ```tsx
 * function ComplexOperation() {
 *   const { [compositeName], loading } = use[Domain]Composite();
 *
 *   const handleOperation = async () => {
 *     const result = await [compositeName](params);
 *     if (result) {
 *       console.log('Operation completed');
 *     }
 *   };
 *
 *   return <button onClick={handleOperation} disabled={loading}>Execute</button>;
 * }
 * ```
 */
export function use[Domain]Composite() {
  // Implementation
}
```

### Main Hook Template

```typescript
/**
 * Main hook that combines all [domain] operations.
 *
 * Provides a unified interface to all [domain]-related operations including
 * queries (read), mutations (write), and composite operations (multi-step).
 * This is the primary hook for most components working with [domain] features.
 *
 * @returns {Object} All [domain] operations organized by category
 * @returns {Object} returns.queries - Query operations ([operation1], [operation2], etc.)
 * @returns {Object} returns.mutations - Mutation operations (create, update, delete, etc.)
 * @returns {Object} returns.composites - Composite operations ([composite1], [composite2], etc.)
 *
 * @example
 * ```tsx
 * function [Domain]Dashboard() {
 *   const { queries, mutations, composites } = use[Domain]();
 *   const [items, setItems] = useState([]);
 *
 *   useEffect(() => {
 *     const loadData = async () => {
 *       const data = await queries.[getOperation]();
 *       if (data) setItems(data);
 *     };
 *     loadData();
 *   }, [queries]);
 *
 *   const handleAction = async (id: string) => {
 *     const result = await mutations.[updateOperation](id, {...});
 *     if (result) {
 *       console.log('Updated:', result);
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       {queries.loading && <div>Loading...</div>}
 *       {queries.error && <div>Error: {queries.error}</div>}
 *       {items.map(item => (
 *         <div key={item.id}>
 *           {item.name}
 *           <button onClick={() => handleAction(item.id)}>Update</button>
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function use[Domain]() {
  const queries = use[Domain]Query();
  const mutations = use[Domain]Mutation();
  const composites = use[Domain]Composite();

  return {
    queries,
    mutations,
    composites,
  };
}
```

## Common JSDoc Tags Reference

### Essential Tags
- `@param {Type} paramName - Description` - Document function parameters
- `@returns {Type} Description` - Document return values
- `@example` - Provide usage examples with code blocks
- `@throws {ErrorType} Description` - Document thrown errors

### Additional Tags
- `@template T` - Document generic type parameters
- `@see {@link RelatedFunction}` - Cross-reference related code
- `@deprecated Use {@link NewFunction} instead` - Mark deprecated functions
- `@since version` - When the function was introduced
- `@remarks` - Additional important notes

## Return Type Patterns

### Query Operations
```typescript
@returns {Promise<Entity[] | null>} Array of entities or null on error
@returns {Promise<Entity | null>} Single entity or null on error
@returns {Promise<PaginatedResponse<Entity> | null>} Paginated results or null on error
@returns {Promise<ApiResponse<unknown> | null>} Generic API response or null on error
```

### Mutation Operations
```typescript
@returns {Promise<Entity | null>} Created/updated entity or null on error
@returns {Promise<boolean>} True if successful, false otherwise
@returns {Promise<ApiResponse<unknown> | null>} Operation response or null on error
```

### Composite Operations
```typescript
@returns {Promise<{field1: Type1 | null; field2: Type2 | null}>} Object with multiple results
```

## State Management Patterns

All hooks manage three pieces of state:

```typescript
/**
 * Loading state indicates when an async operation is in progress.
 * @type {boolean}
 */
const [loading, setLoading] = useState(false);

/**
 * Error state contains error message if an operation failed, null otherwise.
 * @type {string | null}
 */
const [error, setError] = useState<string | null>(null);
```

## Error Handling Pattern

All operations follow this pattern:

```typescript
try {
  setLoading(true);
  setError(null);
  const response = await service.operation();
  return response.data || null;
} catch (err) {
  const message = err instanceof Error ? err.message : 'Failed to perform operation';
  setError(message);
  return null;
} finally {
  setLoading(false);
}
```

## Domain-Specific Documentation Guidelines

### Incident Response
- Emphasize status transitions (new → investigating → resolved)
- Document assignment and timeline capabilities
- Highlight evidence collection features

### Threat Intelligence
- Document enrichment and correlation capabilities
- Explain categorization and archiving
- Highlight analysis operations

### Vulnerability Management
- Document scanning capabilities and targets
- Explain status updates and patching workflows
- Highlight severity and priority handling

### IoC Management
- Document bulk import/export capabilities
- Explain format support (JSON, CSV, STIX)
- Highlight checking and validation operations

### Threat Actors
- Document campaign and TTP relationships
- Explain profile aggregation in composites
- Highlight attribution capabilities

### SIEM
- Document log searching and filtering
- Explain alert acknowledgment/resolution workflow
- Highlight correlation rule capabilities

### Malware Analysis
- Document analysis types (static, dynamic, behavioral)
- Explain YARA rule generation and testing
- Highlight IoC extraction from samples

### Automation
- Document playbook execution with context
- Explain execution monitoring and cancellation
- Highlight library/template capabilities

## Best Practices

1. **Be Specific**: Describe exactly what each operation does
2. **Include Examples**: Show realistic usage scenarios
3. **Document Edge Cases**: Note special behaviors or limitations
4. **Cross-Reference**: Link related functions and types
5. **Keep Updated**: Update docs when functionality changes
6. **Show Return Shapes**: Describe the structure of returned objects
7. **Explain Side Effects**: Document any state changes or async behavior
