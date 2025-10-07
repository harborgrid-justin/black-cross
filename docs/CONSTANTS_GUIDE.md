# Constants System Guide

## Overview

This guide documents the centralized constants system for the Black-Cross platform. All hardcoded values, URLs, routes, messages, and configuration values have been extracted into organized constant files for both frontend and backend.

## Benefits

- **Type Safety**: All constants use TypeScript `as const` assertions for literal types
- **Single Source of Truth**: No duplicate hardcoded values scattered across files
- **Easy Maintenance**: Update values in one place to affect entire application
- **Better IntelliSense**: IDE autocomplete for all constants
- **Reduced Errors**: No typos in magic strings or numbers

## Backend Constants

Location: `backend/constants/`

### Structure

```
backend/constants/
├── index.ts          # Barrel export - import everything from here
├── app.ts            # Application metadata, ports, environment, timeouts
├── routes.ts         # All API route paths
├── features.ts       # Feature flags and module configurations
├── http.ts           # HTTP status codes, headers, messages
├── roles.ts          # User roles and permissions
├── database.ts       # Database names, collections, pool sizes
├── validation.ts     # Validation rules, patterns, constraints
└── security.ts       # Security configs, rate limits, encryption
```

### Usage Examples

#### Importing Constants

```typescript
// Import all constants
import * from '../constants';

// Import specific groups
import { APP, PORTS, ENV } from '../constants/app';
import { MODULE_ROUTES, API_VERSION } from '../constants/routes';
import { HTTP_STATUS, ERROR_MESSAGES } from '../constants/http';
```

#### Application Constants (`app.ts`)

```typescript
import { APP, PORTS, ENV, TIME, LIMITS } from '../constants/app';

// Application metadata
console.log(`${APP.NAME} v${APP.VERSION}`);
console.log(APP.DESCRIPTION);

// Port configuration
app.listen(PORTS.APP);
redis.connect({ port: PORTS.REDIS });

// Environment checks
if (ENV.IS_PRODUCTION) {
  // Production-specific logic
}

// Timeouts and intervals
setTimeout(cleanup, TIME.HOUR);
setInterval(healthCheck, TIME.MINUTE * 5);

// Rate limits and pagination
const limit = Math.min(query.limit || LIMITS.DEFAULT_PAGE_SIZE, LIMITS.MAX_PAGE_SIZE);
```

**Available Constants:**
- `APP` - Name, version, description, title
- `PORTS` - All service ports (app, DB, Redis, RabbitMQ, etc.)
- `ENV` - Environment flags (IS_PRODUCTION, IS_DEVELOPMENT, IS_TEST)
- `TIME` - Time constants (SECOND, MINUTE, HOUR, DAY, WEEK, MONTH, YEAR)
- `LIMITS` - Pagination and request limits
- `STATUS` - System status values (HEALTHY, UNHEALTHY, DEGRADED, MAINTENANCE)

#### Route Constants (`routes.ts`)

```typescript
import { MODULE_ROUTES, API_VERSION } from '../constants/routes';

// Register module routes
app.use(MODULE_ROUTES.THREAT_INTELLIGENCE, threatIntelligenceRouter);
app.use(MODULE_ROUTES.INCIDENT_RESPONSE, incidentResponseRouter);
app.use(MODULE_ROUTES.VULNERABILITY_MANAGEMENT, vulnerabilityRouter);

// Build API paths
const endpoint = `${API_VERSION}/custom-endpoint`;
```

**Available Routes:**
- `API_VERSION` - `/api/v1`
- `MODULE_ROUTES` - All 15 module route paths

#### HTTP Constants (`http.ts`)

```typescript
import { HTTP_STATUS, HTTP_HEADERS, CONTENT_TYPE, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants/http';

// Status codes
res.status(HTTP_STATUS.OK).json({ data });
res.status(HTTP_STATUS.BAD_REQUEST).json({ error: ERROR_MESSAGES.VALIDATION_ERROR });
res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: ERROR_MESSAGES.INVALID_CREDENTIALS });

// Headers
res.set(HTTP_HEADERS.CONTENT_TYPE, CONTENT_TYPE.JSON);
res.set(HTTP_HEADERS.CACHE_CONTROL, 'no-cache, no-store');

// Messages
throw new Error(ERROR_MESSAGES.RESOURCE_NOT_FOUND);
logger.info(SUCCESS_MESSAGES.CREATED_SUCCESSFULLY);
```

**Available Constants:**
- `HTTP_STATUS` - All HTTP status codes (OK, CREATED, BAD_REQUEST, UNAUTHORIZED, etc.)
- `HTTP_HEADERS` - Header names (CONTENT_TYPE, AUTHORIZATION, CACHE_CONTROL, etc.)
- `CONTENT_TYPE` - MIME types (JSON, HTML, TEXT, MULTIPART_FORM_DATA, etc.)
- `ERROR_MESSAGES` - Standardized error messages
- `SUCCESS_MESSAGES` - Standardized success messages

#### Database Constants (`database.ts`)

```typescript
import { DATABASE_NAMES, COLLECTIONS, CONNECTION_POOL, DB_TIMEOUTS, QUERY_LIMITS } from '../constants/database';

// Database connections
mongoose.connect(uri, { dbName: DATABASE_NAMES.MAIN });
const testDb = mongoose.connection.useDb(DATABASE_NAMES.TEST);

// Collections
const users = db.collection(COLLECTIONS.USERS);
const threats = db.collection(COLLECTIONS.THREATS);

// Connection pool
const pool = new Pool({
  min: CONNECTION_POOL.POSTGRESQL.MIN,
  max: CONNECTION_POOL.POSTGRESQL.MAX,
});

// Query timeouts
const query = db.query(sql).timeout(DB_TIMEOUTS.QUERY);

// Result limits
const results = await Model.find().limit(QUERY_LIMITS.DEFAULT);
```

**Available Constants:**
- `DATABASE_NAMES` - Database names for main, test, analytics
- `COLLECTIONS` - All collection/table names
- `CONNECTION_POOL` - Pool sizes for MongoDB, PostgreSQL, Redis
- `DB_TIMEOUTS` - Connection, query, transaction timeouts
- `QUERY_LIMITS` - Default, max, bulk insert, export limits

#### Validation Constants (`validation.ts`)

```typescript
import { LENGTH_CONSTRAINTS, PATTERNS, NUMERIC_CONSTRAINTS, FILE_CONSTRAINTS } from '../constants/validation';

// Length validation
if (password.length < LENGTH_CONSTRAINTS.PASSWORD_MIN) {
  throw new Error(`Password must be at least ${LENGTH_CONSTRAINTS.PASSWORD_MIN} characters`);
}

// Pattern validation
if (!PATTERNS.EMAIL.test(email)) {
  throw new Error('Invalid email format');
}
if (PATTERNS.IPV4.test(input)) {
  // Handle IPv4 address
}

// Numeric validation
if (severity < NUMERIC_CONSTRAINTS.SEVERITY_MIN || severity > NUMERIC_CONSTRAINTS.SEVERITY_MAX) {
  throw new Error('Invalid severity score');
}

// File validation
if (file.size > FILE_CONSTRAINTS.MAX_SIZE) {
  throw new Error(`File exceeds ${FILE_CONSTRAINTS.MAX_SIZE_LABEL} limit`);
}
if (!FILE_CONSTRAINTS.ALLOWED_MIME_TYPES.IMAGES.includes(file.mimetype)) {
  throw new Error('Invalid file type');
}
```

**Available Constants:**
- `LENGTH_CONSTRAINTS` - Min/max lengths for all text fields
- `PATTERNS` - Regex patterns (EMAIL, URL, IP, HASH, CVE, UUID, etc.)
- `NUMERIC_CONSTRAINTS` - Min/max for ports, scores, priorities
- `FILE_CONSTRAINTS` - File size limits, allowed MIME types and extensions
- `SEARCH_CONSTRAINTS` - Search query limits and debounce settings
- `THREAT_CONSTRAINTS` - Threat intelligence specific limits

#### Security Constants (`security.ts`)

```typescript
import { PASSWORD_REQUIREMENTS, SESSION_CONFIG, RATE_LIMITS, ENCRYPTION, CORS_CONFIG, SECURITY_HEADERS, AUDIT_EVENTS } from '../constants/security';

// Password validation
if (password.length < PASSWORD_REQUIREMENTS.MIN_LENGTH) {
  errors.push(`Minimum ${PASSWORD_REQUIREMENTS.MIN_LENGTH} characters required`);
}
if (PASSWORD_REQUIREMENTS.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
  errors.push('Must contain uppercase letter');
}

// Session management
const session = {
  duration: SESSION_CONFIG.DURATION,
  maxSessions: SESSION_CONFIG.MAX_SESSIONS_PER_USER,
  idleTimeout: SESSION_CONFIG.IDLE_TIMEOUT,
};

// Rate limiting
const limiter = rateLimit({
  windowMs: RATE_LIMITS.AUTHENTICATION.WINDOW_MS,
  max: RATE_LIMITS.AUTHENTICATION.MAX_ATTEMPTS,
});

// CORS configuration
app.use(cors({
  origin: CORS_CONFIG.ALLOWED_ORIGINS,
  methods: CORS_CONFIG.ALLOWED_METHODS,
  allowedHeaders: CORS_CONFIG.ALLOWED_HEADERS,
  credentials: CORS_CONFIG.CREDENTIALS,
}));

// Security headers
res.set('Strict-Transport-Security', SECURITY_HEADERS.HSTS);
res.set('X-Frame-Options', SECURITY_HEADERS.X_FRAME_OPTIONS);

// Audit logging
auditLog.create({
  event: AUDIT_EVENTS.LOGIN_SUCCESS,
  userId: user.id,
  timestamp: new Date(),
});
```

**Available Constants:**
- `PASSWORD_REQUIREMENTS` - Password policy settings
- `SESSION_CONFIG` - Session duration, timeout, limits
- `RATE_LIMITS` - Rate limit tiers for different operations
- `ENCRYPTION` - Encryption algorithm settings
- `CORS_CONFIG` - CORS configuration
- `CSP_DIRECTIVES` - Content Security Policy directives
- `SECURITY_HEADERS` - Security header values
- `API_KEY_CONFIG` - API key settings
- `AUDIT_EVENTS` - Audit event type constants
- `THREAT_THRESHOLDS` - Threat detection thresholds

#### Roles and Permissions (`roles.ts`)

```typescript
import { USER_ROLES, ROLE_PERMISSIONS, ROLE_HIERARCHY } from '../constants/roles';

// Role assignment
user.role = USER_ROLES.ANALYST;

// Permission checks
if (ROLE_PERMISSIONS[user.role].includes('threat:delete')) {
  // Allow deletion
}

// Hierarchy checks
const adminLevel = ROLE_HIERARCHY[USER_ROLES.ADMIN];
const analystLevel = ROLE_HIERARCHY[USER_ROLES.ANALYST];
if (adminLevel > analystLevel) {
  // Admin has higher privileges
}
```

## Frontend Constants

Location: `frontend/src/constants/`

### Structure

```
frontend/src/constants/
├── index.ts          # Barrel export - import everything from here
├── api.ts            # API configuration, endpoints, HTTP constants
├── app.ts            # Application settings, storage keys, UI constants
├── routes.ts         # Frontend routes, navigation
└── messages.ts       # User-facing messages, labels
```

### Usage Examples

#### Importing Constants

```typescript
// Import all constants
import * from '../constants';

// Import specific groups
import { API_CONFIG, API_ENDPOINTS } from '../constants/api';
import { STORAGE_KEYS, PAGINATION, COLORS } from '../constants/app';
import { PUBLIC_ROUTES, PROTECTED_ROUTES } from '../constants/routes';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants/messages';
```

#### API Constants (`api.ts`)

```typescript
import { API_CONFIG, API_ENDPOINTS, HTTP_STATUS, HTTP_HEADERS, CONTENT_TYPE } from '../constants/api';

// API client configuration
const client = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
});

// Retry logic
const maxRetries = API_CONFIG.RETRY_ATTEMPTS;

// API calls
const threats = await axios.get(API_ENDPOINTS.THREATS.BASE);
const threat = await axios.get(API_ENDPOINTS.THREATS.BY_ID(threatId));
await axios.post(API_ENDPOINTS.THREATS.BASE, threatData);

// Status handling
if (response.status === HTTP_STATUS.OK) {
  // Handle success
}

// Headers
config.headers[HTTP_HEADERS.AUTHORIZATION] = `Bearer ${token}`;
config.headers[HTTP_HEADERS.CONTENT_TYPE] = CONTENT_TYPE.JSON;
```

**Available Constants:**
- `API_CONFIG` - Base URL, timeout, retry settings
- `API_ENDPOINTS` - All API endpoints for 15 modules
- `HTTP_STATUS` - All HTTP status codes
- `HTTP_HEADERS` - Header names
- `CONTENT_TYPE` - MIME types

#### Application Constants (`app.ts`)

```typescript
import { APP_CONFIG, STORAGE_KEYS, TIMEOUTS, PAGINATION, DATE_FORMATS, COLORS, SEVERITY_LEVELS, THEME_CONFIG } from '../constants/app';

// Application metadata
document.title = `${APP_CONFIG.NAME} - ${APP_CONFIG.TAGLINE}`;

// Local storage
localStorage.setItem(STORAGE_KEYS.TOKEN, token);
const user = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || '{}');
const theme = localStorage.getItem(STORAGE_KEYS.THEME);

// Timeouts and debouncing
const debounceDelay = TIMEOUTS.DEBOUNCE;
const toastDuration = TIMEOUTS.TOAST;

// Pagination
const defaultPageSize = PAGINATION.DEFAULT_PAGE_SIZE;
const pageSizeOptions = PAGINATION.PAGE_SIZE_OPTIONS;

// Date formatting
import { format } from 'date-fns';
const formattedDate = format(date, DATE_FORMATS.DISPLAY);
const timestamp = format(date, DATE_FORMATS.TIMESTAMP);

// Colors for severity
const color = COLORS.SEVERITY[threat.severity]; // 'critical' -> '#d32f2f'

// Theme
const darkMode = theme === THEME_CONFIG.DARK;
```

**Available Constants:**
- `APP_CONFIG` - Application name, version, tagline, description
- `STORAGE_KEYS` - LocalStorage key names
- `TIMEOUTS` - Debounce, toast, polling, session warning timeouts
- `PAGINATION` - Page sizes and options
- `DATE_FORMATS` - Date format strings
- `COLORS` - Severity colors, status colors, chart colors
- `SEVERITY_LEVELS` - Severity level definitions
- `STATUS_TYPES` - Status type definitions
- `THREAT_TYPES` - Threat type definitions
- `PRIORITY_LEVELS` - Priority level definitions
- `CHART_CONFIG` - Chart configuration defaults
- `TABLE_CONFIG` - Table configuration defaults
- `THEME_CONFIG` - Theme mode constants

#### Route Constants (`routes.ts`)

```typescript
import { PUBLIC_ROUTES, PROTECTED_ROUTES, NAVIGATION_ITEMS, BREADCRUMB_TITLES } from '../constants/routes';

// Route configuration
<Route path={PUBLIC_ROUTES.LOGIN} element={<Login />} />
<Route path={PUBLIC_ROUTES.REGISTER} element={<Register />} />

<PrivateRoute path={PROTECTED_ROUTES.DASHBOARD} element={<Dashboard />} />
<PrivateRoute path={PROTECTED_ROUTES.THREATS.BASE} element={<Threats />} />
<PrivateRoute path={PROTECTED_ROUTES.THREATS.DETAIL()} element={<ThreatDetail />} />

// Navigation
const navItems = NAVIGATION_ITEMS.map(item => ({
  label: item.label,
  path: item.path,
  icon: item.icon,
}));

// Breadcrumbs
const breadcrumb = BREADCRUMB_TITLES[location.pathname] || 'Page';
```

**Available Constants:**
- `PUBLIC_ROUTES` - Login, register, forgot password, etc.
- `PROTECTED_ROUTES` - All authenticated routes organized by feature
- `NAVIGATION_ITEMS` - Navigation menu configuration
- `BREADCRUMB_TITLES` - Page titles for breadcrumbs

#### Message Constants (`messages.ts`)

```typescript
import { ERROR_MESSAGES, SUCCESS_MESSAGES, WARNING_MESSAGES, INFO_MESSAGES, CONFIRMATION_MESSAGES, PLACEHOLDERS, BUTTON_LABELS, FORM_LABELS } from '../constants/messages';

// Error handling
toast.error(ERROR_MESSAGES.NETWORK_ERROR);
toast.error(ERROR_MESSAGES.UNAUTHORIZED);

// Success notifications
toast.success(SUCCESS_MESSAGES.LOGIN_SUCCESS);
toast.success(SUCCESS_MESSAGES.SAVE_SUCCESS);

// Warnings
toast.warning(WARNING_MESSAGES.UNSAVED_CHANGES);

// Confirmations
if (confirm(CONFIRMATION_MESSAGES.DELETE_ITEM)) {
  deleteItem();
}

// Form placeholders
<input placeholder={PLACEHOLDERS.SEARCH} />
<input placeholder={PLACEHOLDERS.EMAIL} />

// Button labels
<button>{BUTTON_LABELS.SAVE}</button>
<button>{BUTTON_LABELS.CANCEL}</button>

// Form labels
<label>{FORM_LABELS.EMAIL}</label>
<label>{FORM_LABELS.PASSWORD}</label>
```

**Available Constants:**
- `ERROR_MESSAGES` - All error messages
- `SUCCESS_MESSAGES` - Success notifications
- `WARNING_MESSAGES` - Warning messages
- `INFO_MESSAGES` - Informational messages
- `CONFIRMATION_MESSAGES` - Confirmation dialog messages
- `PLACEHOLDERS` - Input placeholders
- `BUTTON_LABELS` - Button text labels
- `FORM_LABELS` - Form field labels
- `VALIDATION_MESSAGES` - Form validation messages

## Migration Guide

### Migrating Existing Code

1. **Identify Hardcoded Values**
   - Look for magic numbers, strings, URLs
   - Search for repeated values
   - Check for environment variable access

2. **Find the Appropriate Constant**
   - Check the constants files for existing values
   - If not found, add to appropriate file

3. **Import and Replace**
   ```typescript
   // Before
   const port = 8080;
   app.listen(port);

   // After
   import { PORTS } from './constants/app';
   app.listen(PORTS.APP);
   ```

4. **Update Tests**
   - Import constants in test files
   - Use constants for assertions and mocks

### Adding New Constants

1. **Choose the Right File**
   - Application settings → `app.ts`
   - API/Routes → `api.ts` or `routes.ts`
   - Validation rules → `validation.ts`
   - Security settings → `security.ts`
   - User messages → `messages.ts`

2. **Use Proper TypeScript Patterns**
   ```typescript
   // Use 'as const' for literal types
   export const MY_CONSTANTS = {
     VALUE_ONE: 'value1',
     VALUE_TWO: 'value2',
   } as const;

   // For functions (dynamic values)
   export const API_ENDPOINTS = {
     BY_ID: (id: string) => `/resource/${id}`,
   } as const;
   ```

3. **Document with Comments**
   ```typescript
   /**
    * Authentication Configuration
    * Settings for JWT tokens and session management
    */
   export const AUTH_CONFIG = {
     TOKEN_EXPIRY: '24h',
     REFRESH_THRESHOLD: 60 * 60 * 1000, // 1 hour in ms
   } as const;
   ```

4. **Export from Index**
   - Add to barrel export in `index.ts` if needed

## Best Practices

### DO ✅

- **Use constants for all magic values**
- **Group related constants together**
- **Use TypeScript `as const` assertions**
- **Document complex constants with JSDoc comments**
- **Keep constants organized by domain/feature**
- **Use descriptive names (UPPER_SNAKE_CASE)**
- **Export through barrel files for cleaner imports**

### DON'T ❌

- **Don't hardcode values in components/services**
- **Don't duplicate constants across files**
- **Don't use `const enum` (not preserved in runtime)**
- **Don't mix configuration with business logic**
- **Don't forget to update constants when requirements change**

## Type Safety

All constants use TypeScript's `as const` assertion, which provides:

```typescript
export const STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  COMPLETED: 'completed',
} as const;

// Type is inferred as:
// {
//   readonly PENDING: "pending";
//   readonly ACTIVE: "active";
//   readonly COMPLETED: "completed";
// }

// Can create union type from values:
type StatusType = typeof STATUS[keyof typeof STATUS];
// StatusType = "pending" | "active" | "completed"
```

## Environment Variables

Constants that depend on environment variables use fallback values:

```typescript
// Backend
export const PORTS = {
  APP: parseInt(process.env.APP_PORT || '8080', 10),
} as const;

// Frontend
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || '/api/v1',
} as const;
```

## Testing with Constants

```typescript
import { HTTP_STATUS, ERROR_MESSAGES } from '../constants';

describe('API Error Handling', () => {
  it('should return 404 for missing resources', async () => {
    const response = await request(app).get('/api/v1/nonexistent');

    expect(response.status).toBe(HTTP_STATUS.NOT_FOUND);
    expect(response.body.error).toBe(ERROR_MESSAGES.RESOURCE_NOT_FOUND);
  });
});
```

## Maintenance Checklist

When updating constants:

- [ ] Update the constant value in the appropriate file
- [ ] Check for any dependent constants that need updating
- [ ] Update related documentation if needed
- [ ] Run TypeScript compiler to check for type errors
- [ ] Run tests to verify functionality
- [ ] Update environment variable documentation if applicable
- [ ] Commit with descriptive message explaining the change

## Quick Reference

### Backend Constants Cheat Sheet

| Category | File | Key Exports |
|----------|------|-------------|
| App Config | `app.ts` | `APP`, `PORTS`, `ENV`, `TIME`, `LIMITS` |
| Routes | `routes.ts` | `API_VERSION`, `MODULE_ROUTES` |
| HTTP | `http.ts` | `HTTP_STATUS`, `ERROR_MESSAGES`, `HTTP_HEADERS` |
| Database | `database.ts` | `COLLECTIONS`, `DB_TIMEOUTS`, `QUERY_LIMITS` |
| Validation | `validation.ts` | `PATTERNS`, `LENGTH_CONSTRAINTS`, `FILE_CONSTRAINTS` |
| Security | `security.ts` | `RATE_LIMITS`, `SESSION_CONFIG`, `AUDIT_EVENTS` |
| Roles | `roles.ts` | `USER_ROLES`, `ROLE_PERMISSIONS` |

### Frontend Constants Cheat Sheet

| Category | File | Key Exports |
|----------|------|-------------|
| API | `api.ts` | `API_CONFIG`, `API_ENDPOINTS`, `HTTP_STATUS` |
| App Config | `app.ts` | `STORAGE_KEYS`, `PAGINATION`, `COLORS`, `THEME_CONFIG` |
| Routes | `routes.ts` | `PUBLIC_ROUTES`, `PROTECTED_ROUTES`, `NAVIGATION_ITEMS` |
| Messages | `messages.ts` | `ERROR_MESSAGES`, `SUCCESS_MESSAGES`, `PLACEHOLDERS` |

## Support

For questions or issues with constants:
1. Check this guide for usage examples
2. Review the TypeScript definitions in constant files
3. Check related code for migration patterns
4. Refer to CLAUDE.md for project architecture context
