# Constants Centralization Summary

## Overview
All hardcoded constants, URLs, numbers, and static configuration values have been centralized into a dedicated constants system located in `backend/constants/`.

## Constants Structure

### File Organization

```
backend/constants/
├── index.ts          # Central export point
├── app.ts            # Application metadata and defaults
├── routes.ts         # API routes and endpoints
├── features.ts       # Platform features and descriptions
├── http.ts           # HTTP status codes, headers, messages
└── roles.ts          # User roles and permissions
```

### Constants Categories

#### 1. **Application Constants** (`app.ts`)
- **APP**: Name, version, title, description, contact, license
- **PORTS**: Default ports for all services (8080, 5432, 27017, etc.)
- **TIME**: Time constants in milliseconds (SECOND, MINUTE, HOUR, DAY, WEEK)
- **CACHE_DURATION**: Cache durations (HEALTH_CHECK, SHORT, MEDIUM, LONG, VERY_LONG)
- **RATE_LIMIT**: Rate limiting defaults (WINDOW_MS, MAX_REQUESTS_*)
- **PAGINATION**: Pagination defaults (DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT)
- **MODULES**: Module counts (PRIMARY_COUNT, SUB_FEATURES_COUNT)
- **JWT**: JWT defaults (DEFAULT_EXPIRATION, ISSUER, AUDIENCE)
- **BCRYPT**: Bcrypt defaults (DEFAULT_ROUNDS, MIN_ROUNDS, MAX_ROUNDS)
- **LOGGING**: Logging defaults (DEFAULT_LEVEL, DEFAULT_MAX_SIZE, DEFAULT_MAX_FILES)
- **METRICS**: Metrics constants (MAX_DURATION_RECORDS, PROMETHEUS_VERSION)
- **MONGODB**: MongoDB connection options
- **SWAGGER**: Swagger UI customization
- **STATUS**: Status values (OPERATIONAL, DEGRADED, HEALTHY, etc.)
- **ENVIRONMENT**: Environment values (DEVELOPMENT, PRODUCTION, TEST)

#### 2. **Route Constants** (`routes.ts`)
- **API_VERSION**: `/api/v1`
- **ROUTES**: Base routes (ROOT, HEALTH, API_ROOT, API_DOCS)
- **MODULE_ROUTES**: All 15 module route paths
- **ROUTE_PATTERNS**: Common patterns (BY_ID, SEARCH, EXPORT, STATS, etc.)
- **MODULE_NAMES**: All module names as constants

#### 3. **Feature Constants** (`features.ts`)
- **FEATURES**: Array of all 15 platform features
- **MODULE_DESCRIPTIONS**: Descriptions for each module
- **SWAGGER_TAGS**: Swagger documentation tags

#### 4. **HTTP Constants** (`http.ts`)
- **HTTP_STATUS**: All HTTP status codes (200, 404, 500, etc.)
- **HTTP_METHODS**: HTTP method names
- **HTTP_HEADERS**: Common header names
- **CONTENT_TYPE**: Content type values
- **ERROR_MESSAGES**: Standardized error messages
- **SUCCESS_MESSAGES**: Standardized success messages

#### 5. **Role Constants** (`roles.ts`)
- **ROLES**: User role definitions (ADMIN, ANALYST, VIEWER)
- **ROLE_HIERARCHY**: Role permission levels
- **ROLE_DESCRIPTIONS**: Role descriptions
- **ALL_ROLES**: Array of all roles
- **ROLE_GROUPS**: Common role combinations

## Updated Files

### Core Application Files
1. **backend/index.ts**
   - Replaced hardcoded port (8080) with `PORTS.APP`
   - Replaced rate limit values with `RATE_LIMIT.*`
   - Replaced routes with `ROUTES.*` and `MODULE_ROUTES.*`
   - Replaced app metadata with `APP.*`
   - Replaced status values with `STATUS.*`
   - Replaced feature list with `FEATURES`
   - Replaced Swagger config with `SWAGGER.*`
   - Replaced environment check with `ENVIRONMENT.*`

2. **backend/config/index.ts**
   - Replaced default ports with `PORTS.*`
   - Replaced MongoDB options with `MONGODB.*`
   - Replaced JWT defaults with `JWT.*`
   - Replaced Bcrypt settings with `BCRYPT.*`
   - Replaced logging defaults with `LOGGING.*`
   - Replaced environment values with `ENVIRONMENT.*`

3. **backend/config/swagger.ts**
   - Replaced app metadata with `APP.*`
   - Replaced tags with `SWAGGER_TAGS`

### Middleware Files
4. **backend/middleware/auth.ts**
   - Replaced JWT issuer/audience with `JWT.*`

5. **backend/middleware/healthCheck.ts**
   - Replaced app metadata with `APP.*`
   - Replaced status values with `STATUS.*`
   - Replaced cache duration with `CACHE_DURATION.HEALTH_CHECK`

6. **backend/middleware/metrics.ts**
   - Replaced max records with `METRICS.MAX_DURATION_RECORDS`
   - Replaced content type with `CONTENT_TYPE.PROMETHEUS`

## Benefits

### 1. **Maintainability**
- Single source of truth for all constants
- Easy to update values across the entire application
- Reduced risk of inconsistencies

### 2. **Type Safety**
- All constants are strongly typed with TypeScript
- `as const` assertions for literal types
- Autocomplete support in IDEs

### 3. **Readability**
- Descriptive constant names instead of magic numbers
- Clear organization by category
- Self-documenting code

### 4. **Testability**
- Easy to mock constants in tests
- Centralized configuration for different environments

### 5. **Scalability**
- Simple to add new constants
- Organized structure for growing codebase

## Usage Examples

### Importing Constants
```typescript
// Import specific constants
import { APP, PORTS, ROUTES } from './constants';

// Import from category
import { HTTP_STATUS, ERROR_MESSAGES } from './constants/http';

// Use in code
const port = PORTS.APP;
const apiVersion = ROUTES.API_ROOT;
const errorMsg = ERROR_MESSAGES.NOT_FOUND;
```

### Before vs After

**Before:**
```typescript
app.listen(8080);
app.use('/api/v1/threat-intelligence', router);
res.status(404).json({ error: 'Not Found' });
```

**After:**
```typescript
app.listen(PORTS.APP);
app.use(MODULE_ROUTES.THREAT_INTELLIGENCE, router);
res.status(HTTP_STATUS.NOT_FOUND).json({ error: ERROR_MESSAGES.NOT_FOUND });
```

## Future Improvements

1. **Environment-specific Constants**: Add support for different constants per environment
2. **Configuration Validation**: Add runtime validation for constants
3. **Documentation Generation**: Auto-generate API docs from constants
4. **Localization**: Add i18n support for messages
5. **Module-specific Constants**: Create constants files for each module

## Migration Status

✅ **Completed:**
- Created centralized constants structure
- Updated core application files (index.ts)
- Updated configuration files (config/*)
- Updated middleware files (auth, healthCheck, metrics)
- Updated Swagger configuration

⏳ **Remaining:**
- Module-specific files (15 modules)
- Test files
- Utility files
- Legacy JavaScript modules

## Notes

- All constants use `as const` for type narrowing
- Constants are exported as named exports for tree-shaking
- Legacy modules still contain some hardcoded values (to be migrated)
- TypeScript compilation succeeds with relaxed strict mode
