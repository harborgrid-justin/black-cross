# Enterprise Middleware Guide

Complete guide to using the enterprise-grade middleware in the Black-Cross platform.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Error Handling](#error-handling)
3. [Logging](#logging)
4. [Request Validation](#request-validation)
5. [Rate Limiting](#rate-limiting)
6. [Health Checks](#health-checks)
7. [Metrics](#metrics)
8. [Complete Example](#complete-example)

## Getting Started

### Basic Setup

Add middleware to your Express application in the correct order:

```javascript
const express = require('express');
const correlationId = require('./middleware/correlationId');
const requestLogger = require('./middleware/requestLogger');
const { metricsMiddleware } = require('./middleware/metrics');
const { rateLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

// 1. Correlation ID (first, so all logs have it)
app.use(correlationId);

// 2. Metrics (early, to track all requests)
app.use(metricsMiddleware);

// 3. Request logging
app.use(requestLogger);

// 4. Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 5. Rate limiting
app.use(rateLimiter());

// 6. Your routes
app.use('/api/v1', routes);

// 7. Not found handler (after all routes)
app.use(notFoundHandler);

// 8. Error handler (last)
app.use(errorHandler);
```

## Error Handling

### Using Error Classes

```javascript
const {
  ValidationError,
  NotFoundError,
  AuthenticationError,
  AppError,
  asyncHandler,
} = require('./middleware/errorHandler');

// In a controller
router.get('/users/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    throw new NotFoundError('User');
  }
  
  res.json(user);
}));

// Validation error with details
router.post('/users', asyncHandler(async (req, res) => {
  if (!req.body.email) {
    throw new ValidationError('Email is required', [
      { field: 'email', message: 'Email is required' }
    ]);
  }
  
  // Create user...
}));

// Custom error
router.post('/process', asyncHandler(async (req, res) => {
  const result = await someComplexOperation();
  
  if (!result.success) {
    throw new AppError(
      'Processing failed',
      500,
      false,
      { reason: result.error }
    );
  }
  
  res.json(result);
}));
```

### Error Response Format

All errors are returned in a consistent format:

```json
{
  "status": "error",
  "statusCode": 404,
  "message": "User not found",
  "correlationId": "abc-123-def-456",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "details": {...}  // Only in development or for operational errors
}
```

## Logging

### Module Logger

```javascript
const { createModuleLogger } = require('../utils/logger');
const logger = createModuleLogger('my-module');

// Basic logging
logger.info('Processing started');
logger.error('Error occurred', { error: err.message });
logger.warn('Warning message', { detail: 'extra info' });
logger.debug('Debug information');

// With context
logger.info('User action', {
  userId: user.id,
  action: 'login',
  ip: req.ip,
});
```

### Request Logger with Correlation ID

```javascript
const { createModuleLogger, addCorrelationId } = require('../utils/logger');

router.get('/data', (req, res) => {
  const logger = addCorrelationId(
    createModuleLogger('my-module'),
    req.correlationId
  );
  
  logger.info('Processing request');
  
  // All logs will include the correlation ID
  someFunction(logger);
  
  res.json({ data: 'result' });
});
```

### Log Levels

- `error`: Errors that need immediate attention
- `warn`: Warning conditions
- `info`: Informational messages (default)
- `debug`: Debug-level messages
- `verbose`: Very detailed logs

Set via environment: `LOG_LEVEL=debug`

## Request Validation

### Basic Validation

```javascript
const { validate, Joi } = require('./middleware/validator');

// Define schema
const createUserSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    name: Joi.string().min(2).max(100).required(),
    age: Joi.number().integer().min(18).optional(),
  }),
};

// Apply to route
router.post('/users', 
  validate(createUserSchema), 
  createUserController
);
```

### Validate Query Parameters

```javascript
const searchSchema = {
  query: Joi.object({
    q: Joi.string().min(1).max(500).required(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
  }),
};

router.get('/search', 
  validate(searchSchema), 
  searchController
);
```

### Validate Path Parameters

```javascript
const { commonSchemas } = require('./middleware/validator');

const getUserSchema = {
  params: Joi.object({
    id: commonSchemas.objectId.required(),
  }),
};

router.get('/users/:id', 
  validate(getUserSchema), 
  getUserController
);
```

### Using Common Schemas

```javascript
const { validate, commonSchemas } = require('./middleware/validator');

// Pagination
router.get('/users', 
  validate({ query: commonSchemas.pagination }),
  listUsersController
);

// Date range
const reportSchema = {
  query: commonSchemas.dateRange.keys({
    type: Joi.string().valid('summary', 'detailed').default('summary'),
  }),
};
```

## Rate Limiting

### Global Rate Limiting

```javascript
const { rateLimiter } = require('./middleware/rateLimiter');

// Apply to all routes
app.use(rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
}));
```

### User-Based Rate Limiting

```javascript
const { userRateLimiter } = require('./middleware/rateLimiter');

// Apply to authenticated routes
app.use('/api', 
  authMiddleware,
  userRateLimiter({ 
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60, 
  })
);
```

### Endpoint-Specific Rate Limiting

```javascript
const { endpointRateLimiter } = require('./middleware/rateLimiter');

// Strict limit for login endpoint
router.post('/auth/login',
  endpointRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5,
  }),
  loginController
);

// Loose limit for read operations
router.get('/public/data',
  endpointRateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 1000,
  }),
  publicDataController
);
```

### Rate Limit Response

When rate limit is exceeded, returns:

```json
{
  "status": "error",
  "statusCode": 429,
  "message": "Too many requests, please try again later",
  "correlationId": "...",
  "timestamp": "..."
}
```

Headers:
- `X-RateLimit-Limit`: Maximum requests
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Reset time
- `Retry-After`: Seconds to wait

## Health Checks

### Setup Health Endpoints

```javascript
const {
  basicHealthCheck,
  detailedHealthCheck,
  readinessProbe,
  livenessProbe,
} = require('./middleware/healthCheck');

// Basic health (fast)
app.get('/health', basicHealthCheck);

// Detailed health (includes dependencies)
app.get('/health/detailed', detailedHealthCheck);

// Kubernetes probes
app.get('/health/ready', readinessProbe);
app.get('/health/live', livenessProbe);
```

### Kubernetes Configuration

```yaml
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: black-cross
    livenessProbe:
      httpGet:
        path: /health/live
        port: 8080
      initialDelaySeconds: 10
      periodSeconds: 30
    readinessProbe:
      httpGet:
        path: /health/ready
        port: 8080
      initialDelaySeconds: 5
      periodSeconds: 10
```

## Metrics

### Setup Metrics Endpoints

```javascript
const { 
  metricsMiddleware, 
  getMetricsPrometheus, 
  getMetricsJson 
} = require('./middleware/metrics');

// Apply middleware to track requests
app.use(metricsMiddleware);

// Prometheus format
app.get('/metrics', getMetricsPrometheus);

// JSON format (for debugging)
app.get('/metrics/json', getMetricsJson);
```

### Prometheus Configuration

```yaml
scrape_configs:
  - job_name: 'black-cross'
    static_configs:
      - targets: ['localhost:8080']
    metrics_path: '/metrics'
    scrape_interval: 15s
```

### Available Metrics

- `http_requests_total`: Total HTTP requests by method, path, status
- `http_requests_in_progress`: Current active requests
- `http_request_duration_seconds`: Request duration histogram
- `system_memory_bytes`: Memory usage
- `system_uptime_seconds`: Process uptime
- `nodejs_version`: Node.js version info

## Complete Example

### Full Application Setup

```javascript
const express = require('express');
const config = require('./config');
const { logger, createModuleLogger } = require('./utils/logger');
const correlationId = require('./middleware/correlationId');
const requestLogger = require('./middleware/requestLogger');
const { metricsMiddleware, getMetricsPrometheus } = require('./middleware/metrics');
const { rateLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFoundHandler, asyncHandler } = require('./middleware/errorHandler');
const { validate, Joi } = require('./middleware/validator');
const {
  basicHealthCheck,
  detailedHealthCheck,
  readinessProbe,
  livenessProbe,
} = require('./middleware/healthCheck');

const app = express();
const appLogger = createModuleLogger('app');

// Middleware
app.use(correlationId);
app.use(metricsMiddleware);
app.use(requestLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rateLimiter());

// Health checks
app.get('/health', basicHealthCheck);
app.get('/health/detailed', detailedHealthCheck);
app.get('/health/ready', readinessProbe);
app.get('/health/live', livenessProbe);
app.get('/metrics', getMetricsPrometheus);

// API routes
const apiRouter = express.Router();

// Example route with validation
const createItemSchema = {
  body: Joi.object({
    name: Joi.string().min(1).max(100).required(),
    description: Joi.string().max(500).optional(),
    tags: Joi.array().items(Joi.string()).optional(),
  }),
};

apiRouter.post('/items', 
  validate(createItemSchema),
  asyncHandler(async (req, res) => {
    const logger = createModuleLogger('items');
    logger.info('Creating item', { 
      name: req.body.name,
      correlationId: req.correlationId,
    });
    
    // Your business logic here
    const item = { id: '123', ...req.body };
    
    res.status(201).json(item);
  })
);

app.use('/api/v1', apiRouter);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const port = config.app.port;
app.listen(port, () => {
  appLogger.info(`Server started on port ${port}`);
});

module.exports = app;
```

## Best Practices

### 1. Error Handling

✅ DO:
- Always use `asyncHandler` for async routes
- Use specific error classes
- Include correlation ID in logs
- Return consistent error format

❌ DON'T:
- Catch errors without rethrowing
- Send different error formats
- Expose sensitive data in errors
- Forget to log errors

### 2. Logging

✅ DO:
- Use structured logging (objects, not strings)
- Include context (userId, correlationId)
- Use appropriate log levels
- Log business events

❌ DON'T:
- Log sensitive data (passwords, tokens)
- Over-log (log storms)
- Use console.log directly
- Log without context

### 3. Validation

✅ DO:
- Validate all inputs
- Use schemas for consistency
- Sanitize input data
- Return detailed validation errors

❌ DON'T:
- Trust user input
- Validate in controllers
- Allow unexpected fields
- Return generic errors

### 4. Rate Limiting

✅ DO:
- Apply to all public endpoints
- Use stricter limits for auth endpoints
- Configure based on endpoint cost
- Monitor rate limit hits

❌ DON'T:
- Apply same limit to all endpoints
- Block users permanently
- Forget to add headers
- Use in-memory store in production (use Redis)

## Troubleshooting

### Issue: Logs not appearing

**Solution**: Check `LOG_LEVEL` environment variable. Set to `debug` for development:

```bash
LOG_LEVEL=debug npm run dev
```

### Issue: Rate limit too strict

**Solution**: Adjust limits or use user-based limiting:

```javascript
app.use(userRateLimiter({ maxRequests: 1000 }));
```

### Issue: Health check failing

**Solution**: Check database connection. The readiness probe requires database connectivity.

### Issue: Validation errors unclear

**Solution**: Check error details in response. In development mode, full validation details are included.

## Next Steps

1. Add custom business metrics
2. Integrate with monitoring (Grafana, Datadog)
3. Add distributed tracing (OpenTelemetry)
4. Implement circuit breakers
5. Add request replay for debugging

For more information, see [ENTERPRISE_CAPABILITIES.md](../ENTERPRISE_CAPABILITIES.md).
