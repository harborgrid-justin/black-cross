# Backend Error Handling and Logging Review Report

**Date:** 2025-10-24
**Scope:** `/home/user/black-cross/backend`
**Reviewer:** Claude Code Agent

---

## Executive Summary

The Black-Cross backend has a **solid foundation** for error handling with custom error classes, centralized error middleware, and structured logging. However, there are **critical gaps** in consistency, process-level error handling, and logging practices that need immediate attention for production readiness.

**Overall Rating:** 6.5/10 - Good foundation, requires standardization and critical fixes

---

## Critical Findings (Priority: HIGH)

### 1. Missing Process-Level Error Handlers

**File:** `/home/user/black-cross/backend/index.ts`
**Lines:** N/A (Missing entirely)
**Severity:** CRITICAL

**Issue:**
No handlers for unhandled promise rejections or uncaught exceptions at the process level. This can cause the application to crash unexpectedly in production.

**Current State:**
```typescript
// No process error handlers found
```

**Recommended Fix:**
```typescript
// Add to /home/user/black-cross/backend/index.ts (after imports, before app setup)

import { logger } from './utils/logger';

/**
 * Handle unhandled promise rejections
 * Log error and gracefully shutdown
 */
process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
  const errorMessage = reason instanceof Error ? reason.message : String(reason);
  const errorStack = reason instanceof Error ? reason.stack : undefined;

  logger.error('Unhandled Promise Rejection', {
    reason: errorMessage,
    stack: errorStack,
    promise: String(promise),
  });

  // Give time to log then exit
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

/**
 * Handle uncaught exceptions
 * Log error and gracefully shutdown
 */
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception', {
    message: error.message,
    stack: error.stack,
    name: error.name,
  });

  // Give time to log then exit
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

/**
 * Handle SIGTERM signal (graceful shutdown)
 */
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');

  // Close server gracefully
  server.close(async () => {
    logger.info('HTTP server closed');

    // Close database connections
    try {
      const dbManager = await import('./config/database');
      await dbManager.default.closeAll();
      logger.info('Database connections closed');
    } catch (error) {
      logger.error('Error closing database connections', { error });
    }

    process.exit(0);
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    logger.error('Forced shutdown due to timeout');
    process.exit(1);
  }, 30000);
});

/**
 * Handle SIGINT signal (Ctrl+C)
 */
process.on('SIGINT', async () => {
  logger.info('SIGINT signal received: closing HTTP server');
  process.emit('SIGTERM' as any); // Reuse SIGTERM handler
});
```

**Best Practice:**
- Always handle unhandled promise rejections to prevent silent failures
- Log errors before exiting for debugging
- Implement graceful shutdown for SIGTERM/SIGINT
- Close database connections and other resources before exit

---

### 2. Main Error Handler Not Used

**File:** `/home/user/black-cross/backend/index.ts`
**Lines:** 158-164, 167-172
**Severity:** HIGH

**Issue:**
The main application uses inline error handling instead of the centralized `errorHandler` middleware, leading to inconsistent error responses and missing features like correlation IDs.

**Current Code:**
```typescript
// Error handling middleware
app.use((err: Error, req: Request, res: Response, _next: NextFunction): void => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === ENVIRONMENT.DEVELOPMENT ? err.message : undefined,
  });
});

// 404 handler
app.use((req: Request, res: Response): void => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found',
  });
});
```

**Problems:**
1. Uses `console.error` instead of structured logger
2. Doesn't use custom error classes
3. No correlation ID in error response
4. No error details/timestamp
5. Bypasses the well-designed `errorHandler` middleware

**Recommended Fix:**
```typescript
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// ... (after all route definitions)

// 404 handler for unmatched routes
app.use(notFoundHandler);

// Centralized error handler (must be last)
app.use(errorHandler);
```

**Benefits:**
- Consistent error response format across all endpoints
- Automatic correlation ID tracking
- Proper error logging with context
- Support for custom error classes
- Stack traces controlled by environment

---

### 3. Excessive Console Logging

**Files:** Throughout backend (228 occurrences)
**Severity:** HIGH

**Issue:**
Extensive use of `console.log`, `console.error`, and `console.warn` instead of the structured logger, making logs hard to search, filter, and monitor in production.

**Examples:**

**File:** `/home/user/black-cross/backend/config/database.ts`
**Lines:** 30, 41-42, 45, 49, 54, 62, 80, 112, 126, 131-132, 148, etc.

**Current Code:**
```typescript
console.log('🔌 Connecting to MongoDB...');
console.log('✅ MongoDB connected successfully');
console.error('❌ MongoDB connection error:', err.message);
console.warn('⚠️  MongoDB disconnected');
console.log('🔄 MongoDB reconnected');
```

**Recommended Fix:**
```typescript
import { logger } from '../utils/logger';

logger.info('Connecting to MongoDB');
logger.info('MongoDB connected successfully');
logger.error('MongoDB connection error', { error: err.message, stack: err.stack });
logger.warn('MongoDB disconnected');
logger.info('MongoDB reconnected');
```

**File:** `/home/user/black-cross/backend/config/sequelize.ts`
**Lines:** 24, 60, 76, 90, 94

**Current Code:**
```typescript
logging: config.env === 'development' ? console.log : false,
console.log('✅ PostgreSQL connection established successfully');
console.error('❌ Unable to connect to PostgreSQL:', error);
```

**Recommended Fix:**
```typescript
import { logger } from '../utils/logger';

logging: config.env === 'development' ? (msg: string) => logger.debug(msg) : false,
logger.info('PostgreSQL connection established successfully');
logger.error('Unable to connect to PostgreSQL', {
  error: error instanceof Error ? error.message : String(error),
  stack: error instanceof Error ? error.stack : undefined
});
```

**File:** `/home/user/black-cross/backend/modules/auth/index.ts`
**Lines:** 119

**Current Code:**
```typescript
console.error('Login error:', error);
```

**Recommended Fix:**
```typescript
import { logger } from '../../utils/logger';

logger.error('Login error', {
  error: error instanceof Error ? error.message : String(error),
  stack: error instanceof Error ? error.stack : undefined,
  correlationId: req.correlationId
});
```

**File:** `/home/user/black-cross/backend/modules/ai/llm-client.ts`
**Lines:** 47, 51

**Current Code:**
```typescript
console.log(`AI request completed in ${duration}ms`);
console.error('AI request failed:', error.message);
```

**Recommended Fix:**
```typescript
import { logger } from '../../utils/logger';

logger.info('AI request completed', { duration, provider: this.config.provider });
logger.error('AI request failed', {
  error: error.message,
  stack: error.stack,
  provider: this.config.provider,
  model: this.config.model
});
```

**Best Practice:**
- Use structured logging with context objects
- Include correlation IDs for request tracing
- Add relevant metadata (user ID, resource ID, etc.)
- Use appropriate log levels (debug, info, warn, error)
- Never use console.log in production code

---

## High Priority Findings

### 4. Inconsistent Error Response Formats

**Files:** Multiple controllers across modules
**Severity:** HIGH

**Issue:**
Different modules return errors in different formats, making it difficult for frontend to handle errors consistently.

**Examples:**

**Format 1 - Example TypeScript Controller:**
```typescript
// /home/user/black-cross/backend/modules/example-typescript/controller.ts
const response: ExampleResponse<never> = {
  success: false,
  error: 'Not found',
  message: `Example with ID ${id} does not exist`,
};
res.status(404).json(response);
```

**Format 2 - AI Controller:**
```typescript
// /home/user/black-cross/backend/modules/ai/controller.ts
res.status(400).json({
  success: false,
  error: 'Content is required'
});
```

**Format 3 - Vulnerability Controller:**
```typescript
// /home/user/black-cross/backend/modules/vulnerability-management/controllers/vulnerabilityController.ts
res.status(400).json({ error: error.message });
```

**Format 4 - Automation Controller:**
```typescript
// /home/user/black-cross/backend/modules/automation/controllers/playbookController.ts
res.status(400).json({
  success: false,
  error: error.message,
});
```

**Recommended Standard Format:**
```typescript
interface StandardErrorResponse {
  status: 'error';
  statusCode: number;
  message: string;
  correlationId?: string;
  timestamp: string;
  details?: Array<{
    field?: string;
    message: string;
    type?: string;
  }>;
  stack?: string; // Only in development
}
```

**Recommended Fix - Update All Controllers:**
```typescript
// Instead of handling errors manually, use asyncHandler and throw custom errors
import { asyncHandler, NotFoundError, ValidationError } from '../../middleware/errorHandler';

export const getById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const id: string = req.params.id ?? '';
  const data = await service.getById(id);

  if (data === null) {
    throw new NotFoundError('Example'); // Handled by error middleware
  }

  res.json({
    success: true,
    data,
  });
});
```

**Benefits:**
- Automatic error handling and formatting
- Consistent response structure
- Proper logging with correlation IDs
- Error details in development only
- No manual try-catch needed

---

### 5. Missing Try-Catch in Async Functions

**Files:** Multiple service and controller files
**Severity:** MEDIUM-HIGH

**Issue:**
Some async functions don't wrap their code in try-catch blocks, relying on external error handling which can miss context.

**Example 1 - Service Functions:**

**File:** `/home/user/black-cross/backend/modules/example-typescript/service.ts`
**Lines:** 71-83, 91-104, etc.

**Current Code:**
```typescript
public getById(id: string): Promise<ExampleData | null> {
  // Validate input
  if (!id || id.trim().length === 0) {
    throw new Error('ID must not be empty');
  }

  const found: ExampleData | undefined = this.mockDataStore.find(
    (item): boolean => item.id === id,
  );

  return Promise.resolve(found ?? null);
}
```

**Issue:** This is actually acceptable for service layer as errors should propagate. However, ensure controllers catch them.

**Example 2 - Module Route Handlers:**

Many route handlers in older JavaScript modules don't use try-catch or asyncHandler.

**Recommended Pattern for All Controllers:**
```typescript
import { asyncHandler, NotFoundError, ValidationError } from '../../middleware/errorHandler';

// Option 1: Use asyncHandler wrapper (RECOMMENDED)
export const getById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const data = await service.getById(req.params.id);

  if (!data) {
    throw new NotFoundError('Resource');
  }

  res.json({ success: true, data });
});

// Option 2: Manual try-catch with next() (if not using asyncHandler)
export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await service.getById(req.params.id);

    if (!data) {
      throw new NotFoundError('Resource');
    }

    res.json({ success: true, data });
  } catch (error) {
    next(error); // Pass to error middleware
  }
}
```

**Best Practice:**
- All async route handlers must use `asyncHandler` wrapper or manual try-catch
- Service layer can throw errors (they propagate to controller)
- Always pass errors to `next(error)` in Express handlers
- Use custom error classes for specific error types

---

### 6. External Service Error Handling

**File:** `/home/user/black-cross/backend/modules/ai/llm-client.ts`
**Lines:** 50-53
**Severity:** MEDIUM

**Issue:**
External API errors are wrapped in generic error messages, losing important context like status codes, rate limits, and provider-specific errors.

**Current Code:**
```typescript
async complete(request: LLMRequest): Promise<LLMResponse> {
  const startTime = Date.now();

  try {
    let response: LLMResponse;

    switch (this.config.provider) {
      case 'openai':
        response = await this.callOpenAI(request);
        break;
      // ...
    }

    const duration = Date.now() - startTime;
    console.log(`AI request completed in ${duration}ms`);

    return response;
  } catch (error: any) {
    console.error('AI request failed:', error.message);
    throw new Error(`AI request failed: ${error.message}`);
  }
}
```

**Problems:**
1. Loses HTTP status code information
2. No retry logic for transient failures
3. Generic error message
4. Uses console.log/error

**Recommended Fix:**
```typescript
import { ExternalServiceError } from '../../middleware/errorHandler';
import { logger } from '../../utils/logger';

async complete(request: LLMRequest): Promise<LLMResponse> {
  const startTime = Date.now();

  try {
    let response: LLMResponse;

    switch (this.config.provider) {
      case 'openai':
        response = await this.callOpenAI(request);
        break;
      case 'anthropic':
        response = await this.callAnthropic(request);
        break;
      case 'azure_openai':
        response = await this.callAzureOpenAI(request);
        break;
      default:
        throw new ExternalServiceError(
          'AI Provider',
          `Unsupported provider: ${this.config.provider}`
        );
    }

    const duration = Date.now() - startTime;
    logger.info('AI request completed', {
      provider: this.config.provider,
      model: this.config.model,
      duration,
      promptTokens: response.usage.promptTokens,
      completionTokens: response.usage.completionTokens,
    });

    return response;
  } catch (error: unknown) {
    const duration = Date.now() - startTime;

    // Handle Axios errors with more context
    if (this.isAxiosError(error)) {
      const statusCode = error.response?.status;
      const errorData = error.response?.data;

      logger.error('AI request failed', {
        provider: this.config.provider,
        model: this.config.model,
        duration,
        statusCode,
        errorCode: errorData?.error?.code,
        errorType: errorData?.error?.type,
        errorMessage: errorData?.error?.message || error.message,
      });

      // Provide user-friendly messages based on error type
      let userMessage = 'AI service request failed';
      const details: any[] = [];

      if (statusCode === 401) {
        userMessage = 'AI service authentication failed. Check API key configuration.';
        details.push({ message: 'Invalid or missing API key', type: 'auth_error' });
      } else if (statusCode === 429) {
        userMessage = 'AI service rate limit exceeded. Please try again later.';
        details.push({
          message: 'Rate limit exceeded',
          type: 'rate_limit_error',
          retryAfter: error.response?.headers['retry-after']
        });
      } else if (statusCode === 503) {
        userMessage = 'AI service temporarily unavailable. Please try again later.';
        details.push({ message: 'Service unavailable', type: 'service_unavailable' });
      } else if (statusCode && statusCode >= 500) {
        userMessage = 'AI service encountered an error. Please try again.';
        details.push({ message: 'Provider server error', type: 'server_error' });
      } else if (errorData?.error?.message) {
        userMessage = errorData.error.message;
        details.push({ message: errorData.error.message, type: errorData.error.type });
      }

      throw new ExternalServiceError(
        this.config.provider,
        userMessage,
        details.length > 0 ? details : null
      );
    }

    // Handle network/timeout errors
    if (error instanceof Error) {
      logger.error('AI request failed with network error', {
        provider: this.config.provider,
        model: this.config.model,
        duration,
        error: error.message,
        code: (error as any).code,
      });

      if ((error as any).code === 'ECONNABORTED') {
        throw new ExternalServiceError(
          this.config.provider,
          `Request timeout after ${this.config.timeout}ms`,
          [{ message: 'Connection timeout', type: 'timeout_error' }]
        );
      }

      throw new ExternalServiceError(
        this.config.provider,
        'Network error connecting to AI service',
        [{ message: error.message, type: 'network_error' }]
      );
    }

    // Unknown error
    logger.error('AI request failed with unknown error', {
      provider: this.config.provider,
      model: this.config.model,
      duration,
      error: String(error),
    });

    throw new ExternalServiceError(
      this.config.provider,
      'Unexpected error occurred',
      null
    );
  }
}

// Type guard for Axios errors
private isAxiosError(error: unknown): error is import('axios').AxiosError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error &&
    (error as any).isAxiosError === true
  );
}
```

**Add Retry Logic (Optional but Recommended):**
```typescript
import { ExternalServiceError } from '../../middleware/errorHandler';
import { logger } from '../../utils/logger';

/**
 * Retry configuration
 */
private readonly retryConfig = {
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
};

/**
 * Execute request with retry logic
 */
private async executeWithRetry<T>(
  fn: () => Promise<T>,
  operation: string,
  attempt: number = 1
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    // Check if error is retryable
    const isRetryable = this.isRetryableError(error);
    const shouldRetry = isRetryable && attempt < this.retryConfig.maxRetries;

    if (shouldRetry) {
      const delay = this.retryConfig.retryDelay * Math.pow(2, attempt - 1); // Exponential backoff

      logger.warn('Retrying AI request', {
        provider: this.config.provider,
        operation,
        attempt,
        nextRetryIn: delay,
      });

      await this.sleep(delay);
      return this.executeWithRetry(fn, operation, attempt + 1);
    }

    throw error;
  }
}

/**
 * Check if error is retryable
 */
private isRetryableError(error: unknown): boolean {
  if (this.isAxiosError(error)) {
    const statusCode = error.response?.status;
    return statusCode ? this.retryConfig.retryableStatusCodes.includes(statusCode) : false;
  }

  // Network errors are retryable
  if (error instanceof Error) {
    const code = (error as any).code;
    return ['ECONNRESET', 'ETIMEDOUT', 'ECONNABORTED'].includes(code);
  }

  return false;
}

/**
 * Sleep helper for retry delays
 */
private sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Update complete method to use retry logic
 */
async complete(request: LLMRequest): Promise<LLMResponse> {
  return this.executeWithRetry(
    () => this._complete(request),
    'complete'
  );
}

/**
 * Renamed original complete method
 */
private async _complete(request: LLMRequest): Promise<LLMResponse> {
  // ... (existing complete logic)
}
```

**Best Practice:**
- Preserve original error context (status codes, error types)
- Provide user-friendly error messages
- Log detailed error information for debugging
- Implement retry logic for transient failures
- Use exponential backoff for retries
- Distinguish between client errors (4xx) and server errors (5xx)

---

### 7. Database Connection Error Handling

**File:** `/home/user/black-cross/backend/config/database.ts`
**Lines:** 24-68, 106-136
**Severity:** MEDIUM

**Issue:**
While database connection errors are logged, there's no retry logic or health check monitoring. The application fails immediately on connection errors.

**Current Code:**
```typescript
async connectMongoDB(): Promise<Connection | null> {
  if (this.isMongoConnected) {
    return this.mongoConnection;
  }

  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(config.database.mongodb.uri, {
      maxPoolSize: config.database.mongodb.options.maxPoolSize,
      minPoolSize: config.database.mongodb.options.minPoolSize,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    this.mongoConnection = mongoose.connection;
    this.isMongoConnected = true;
    console.log('✅ MongoDB connected successfully');

    // Handle connection events
    mongoose.connection.on('error', (err: Error) => {
      console.error('❌ MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
      this.isMongoConnected = false;
      this.mongoConnection = null;
    });

    return this.mongoConnection;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.warn('⚠️  MongoDB connection failed (optional service):', errorMessage);
    console.log('ℹ️  Some features may be limited without MongoDB.');
    this.isMongoConnected = false;
    this.mongoConnection = null;
    return null;
  }
}
```

**Recommended Improvements:**
```typescript
import { logger } from '../utils/logger';
import { DatabaseError } from '../middleware/errorHandler';

class DatabaseManager {
  private mongoConnection: Connection | null = null;
  private isMongoConnected = false;
  private sequelizeInstance: Sequelize | null = null;
  private isSequelizeConnected = false;

  // Retry configuration
  private readonly retryConfig = {
    maxRetries: 5,
    retryDelay: 2000, // 2 seconds
    backoffMultiplier: 2,
  };

  // Connection attempt tracking
  private mongoRetries = 0;
  private sequelizeRetries = 0;

  /**
   * Initialize MongoDB connection with retry logic
   */
  async connectMongoDB(): Promise<Connection | null> {
    if (this.isMongoConnected) {
      return this.mongoConnection;
    }

    try {
      logger.info('Connecting to MongoDB', {
        attempt: this.mongoRetries + 1,
        maxRetries: this.retryConfig.maxRetries,
      });

      await mongoose.connect(config.database.mongodb.uri, {
        maxPoolSize: config.database.mongodb.options.maxPoolSize,
        minPoolSize: config.database.mongodb.options.minPoolSize,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      this.mongoConnection = mongoose.connection;
      this.isMongoConnected = true;
      this.mongoRetries = 0; // Reset retry counter on success

      logger.info('MongoDB connected successfully', {
        host: mongoose.connection.host,
        name: mongoose.connection.name,
      });

      // Handle connection events
      mongoose.connection.on('error', (err: Error) => {
        logger.error('MongoDB connection error', {
          error: err.message,
          stack: err.stack,
        });

        // Don't mark as disconnected on transient errors
        if (this.isMongoConnected) {
          logger.warn('MongoDB connection error but still connected');
        }
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected', {
          wasConnected: this.isMongoConnected,
        });

        this.isMongoConnected = false;
        this.mongoConnection = null;

        // Attempt to reconnect
        logger.info('Attempting to reconnect to MongoDB');
        setTimeout(() => {
          this.connectMongoDB().catch(err => {
            logger.error('MongoDB reconnection failed', { error: err.message });
          });
        }, 5000);
      });

      mongoose.connection.on('reconnected', () => {
        logger.info('MongoDB reconnected');
        this.isMongoConnected = true;
      });

      mongoose.connection.on('close', () => {
        logger.info('MongoDB connection closed');
      });

      return this.mongoConnection;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;

      logger.error('MongoDB connection failed', {
        error: errorMessage,
        stack: errorStack,
        attempt: this.mongoRetries + 1,
        maxRetries: this.retryConfig.maxRetries,
      });

      // Retry logic with exponential backoff
      if (this.mongoRetries < this.retryConfig.maxRetries) {
        this.mongoRetries++;
        const delay = this.retryConfig.retryDelay * Math.pow(
          this.retryConfig.backoffMultiplier,
          this.mongoRetries - 1
        );

        logger.info('Retrying MongoDB connection', {
          attempt: this.mongoRetries,
          delayMs: delay,
        });

        await this.sleep(delay);
        return this.connectMongoDB();
      }

      // Max retries exceeded
      logger.warn('MongoDB connection failed after max retries (optional service)', {
        maxRetries: this.retryConfig.maxRetries,
        error: errorMessage,
      });

      logger.info('Some features may be limited without MongoDB. Application will continue.');

      this.isMongoConnected = false;
      this.mongoConnection = null;
      this.mongoRetries = 0; // Reset for future attempts

      // Don't throw - MongoDB is optional
      return null;
    }
  }

  /**
   * Initialize Sequelize (PostgreSQL) with retry logic
   */
  async connectSequelize(): Promise<Sequelize | null> {
    if (this.isSequelizeConnected && this.sequelizeInstance) {
      return this.sequelizeInstance;
    }

    try {
      logger.info('Connecting to PostgreSQL via Sequelize', {
        attempt: this.sequelizeRetries + 1,
        maxRetries: this.retryConfig.maxRetries,
      });

      this.sequelizeInstance = initializeSequelize();

      // Test connection
      await this.sequelizeInstance.authenticate();

      logger.info('PostgreSQL connection established successfully', {
        dialect: this.sequelizeInstance.getDialect(),
        database: this.sequelizeInstance.getDatabaseName(),
      });

      // Sync database models (non-destructive)
      await syncDatabase(false);

      this.isSequelizeConnected = true;
      this.sequelizeRetries = 0; // Reset retry counter

      return this.sequelizeInstance;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;

      logger.error('PostgreSQL connection failed', {
        error: errorMessage,
        stack: errorStack,
        attempt: this.sequelizeRetries + 1,
        maxRetries: this.retryConfig.maxRetries,
      });

      // Retry logic with exponential backoff
      if (this.sequelizeRetries < this.retryConfig.maxRetries) {
        this.sequelizeRetries++;
        const delay = this.retryConfig.retryDelay * Math.pow(
          this.retryConfig.backoffMultiplier,
          this.sequelizeRetries - 1
        );

        logger.info('Retrying PostgreSQL connection', {
          attempt: this.sequelizeRetries,
          delayMs: delay,
        });

        await this.sleep(delay);
        return this.connectSequelize();
      }

      // Max retries exceeded - PostgreSQL is required
      logger.error('PostgreSQL connection failed after max retries (REQUIRED service)', {
        maxRetries: this.retryConfig.maxRetries,
        error: errorMessage,
      });

      logger.error('Please ensure PostgreSQL is running and DATABASE_URL is configured correctly');

      this.isSequelizeConnected = false;
      this.sequelizeInstance = null;
      this.sequelizeRetries = 0;

      // Throw error - PostgreSQL is required for core functionality
      throw new DatabaseError(
        'Failed to connect to PostgreSQL after multiple retries',
        [{
          message: errorMessage,
          type: 'connection_error',
          attempts: this.retryConfig.maxRetries
        }]
      );
    }
  }

  /**
   * Health check for all database connections
   */
  async healthCheck(): Promise<{
    mongodb: { connected: boolean; error?: string };
    postgresql: { connected: boolean; error?: string };
    overall: 'healthy' | 'degraded' | 'unhealthy';
  }> {
    const result = {
      mongodb: { connected: false, error: undefined as string | undefined },
      postgresql: { connected: false, error: undefined as string | undefined },
      overall: 'unhealthy' as 'healthy' | 'degraded' | 'unhealthy',
    };

    // Check MongoDB
    try {
      if (this.isMongoDBConnected()) {
        await mongoose.connection.db.admin().ping();
        result.mongodb.connected = true;
      } else {
        result.mongodb.error = 'Not connected';
      }
    } catch (error) {
      result.mongodb.error = error instanceof Error ? error.message : 'Unknown error';
    }

    // Check PostgreSQL
    try {
      if (this.checkSequelizeConnection()) {
        await this.sequelizeInstance!.authenticate();
        result.postgresql.connected = true;
      } else {
        result.postgresql.error = 'Not connected';
      }
    } catch (error) {
      result.postgresql.error = error instanceof Error ? error.message : 'Unknown error';
    }

    // Determine overall health
    if (result.postgresql.connected && result.mongodb.connected) {
      result.overall = 'healthy';
    } else if (result.postgresql.connected) {
      result.overall = 'degraded'; // Can operate without MongoDB
    } else {
      result.overall = 'unhealthy'; // PostgreSQL is required
    }

    logger.debug('Database health check completed', result);

    return result;
  }

  /**
   * Sleep helper for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ... (rest of the class methods remain the same)
}
```

**Update Health Check Endpoint:**
```typescript
// In /home/user/black-cross/backend/index.ts

import dbManager from './config/database';

app.get('/health', async (req: Request, res: Response): Promise<void> => {
  const healthStatus = await dbManager.healthCheck();

  const statusCode =
    healthStatus.overall === 'healthy' ? 200 :
    healthStatus.overall === 'degraded' ? 200 : // Still return 200 but indicate degraded
    503; // Unhealthy

  res.status(statusCode).json({
    status: healthStatus.overall,
    platform: APP.NAME,
    version: APP.VERSION,
    timestamp: new Date().toISOString(),
    databases: {
      mongodb: healthStatus.mongodb,
      postgresql: healthStatus.postgresql,
    },
    modules: {
      // ... existing module status
    },
  });
});
```

**Best Practice:**
- Implement retry logic with exponential backoff for transient connection failures
- Add health check endpoints that test actual database connectivity
- Monitor connection events and attempt reconnection
- Log connection attempts with context for debugging
- Distinguish between required (PostgreSQL) and optional (MongoDB) services
- Reset retry counters on successful connection

---

## Medium Priority Findings

### 8. Inconsistent Status Code Usage

**Files:** Multiple controllers
**Severity:** MEDIUM

**Issue:**
Different error types return inconsistent HTTP status codes across different controllers.

**Examples:**

**Not Found Errors:**
- Example TS Controller: 404 (correct)
- Automation Controller: 404 (correct)
- Some services: 400 (incorrect)

**Validation Errors:**
- AI Controller: 400 (correct)
- Example Controller: 400 for creation, but generic 500 for others
- Automation: Always 400 regardless of error type

**Recommended Status Code Standards:**
```typescript
// Use these custom error classes consistently:

// 400 - Bad Request (client input error)
throw new ValidationError('Invalid input', [
  { field: 'email', message: 'Invalid email format' }
]);

// 401 - Unauthorized (authentication required)
throw new AuthenticationError('Invalid credentials');

// 403 - Forbidden (insufficient permissions)
throw new AuthorizationError('Admin access required');

// 404 - Not Found
throw new NotFoundError('User');

// 409 - Conflict (duplicate resource)
throw new ConflictError('User with this email already exists');

// 429 - Too Many Requests
throw new RateLimitError('API rate limit exceeded');

// 500 - Internal Server Error (database failure)
throw new DatabaseError('Failed to query database', details);

// 502 - Bad Gateway (external service failure)
throw new ExternalServiceError('OpenAI', 'API request failed', details);
```

**Fix:** Update all controllers to use custom error classes instead of manual status codes.

---

### 9. Missing Error Context in Logs

**Files:** Multiple controllers and services
**Severity:** MEDIUM

**Issue:**
Error logs often lack important context like user ID, resource ID, correlation ID, making debugging difficult.

**Current Code Examples:**
```typescript
// /home/user/black-cross/backend/modules/automation/controllers/playbookController.ts
logger.error('Error in getLibrary controller', { error: error.message });
logger.error('Error in createPlaybook controller', { error: error.message });
```

**Recommended Fix:**
```typescript
// Add context to all error logs
logger.error('Error in getLibrary controller', {
  error: error.message,
  stack: error.stack,
  userId: req.user?.id,
  correlationId: req.correlationId,
  query: req.query, // Sanitize if contains sensitive data
  path: req.path,
  method: req.method,
});

logger.error('Error creating playbook', {
  error: error.message,
  stack: error.stack,
  userId: req.user?.id,
  correlationId: req.correlationId,
  playbookName: req.body.name, // Don't log entire body
  category: req.body.category,
});
```

**Best Practice:**
- Always include correlation ID
- Add user ID when available
- Include resource identifiers
- Add request method and path
- Include relevant query/body parameters (sanitized)
- Always log stack traces for errors

---

### 10. Error Propagation in Service Layer

**Files:** Various service files
**Severity:** MEDIUM

**Issue:**
Some service methods throw generic `Error` objects instead of custom error classes, losing type information.

**Current Code:**
```typescript
// /home/user/black-cross/backend/modules/automation/services/playbookService.ts
if (!playbook) {
  throw new Error('Playbook not found');
}

if (playbook.is_prebuilt) {
  throw new Error('Cannot update pre-built playbooks. Clone it instead.');
}

throw new Error('Invalid playbook JSON');
throw new Error('Playbook with same name already exists');
```

**Recommended Fix:**
```typescript
import {
  NotFoundError,
  ValidationError,
  ConflictError
} from '../../middleware/errorHandler';

if (!playbook) {
  throw new NotFoundError('Playbook');
}

if (playbook.is_prebuilt) {
  throw new ValidationError('Cannot update pre-built playbooks. Clone it instead.', [
    { field: 'is_prebuilt', message: 'Pre-built playbooks are read-only' }
  ]);
}

if (!playbookJson.name || !playbookJson.actions) {
  throw new ValidationError('Invalid playbook JSON', [
    { field: 'name', message: 'Name is required' },
    { field: 'actions', message: 'Actions array is required' },
  ]);
}

if (!options.overwrite) {
  const existing = await Playbook.findOne({ name: playbookJson.name });
  if (existing) {
    throw new ConflictError(`Playbook with name '${playbookJson.name}' already exists`);
  }
}
```

**Benefits:**
- Type-safe error handling
- Consistent HTTP status codes
- Better error details
- Easier to test

---

## Low Priority Findings

### 11. Missing Error Codes

**Severity:** LOW

**Issue:**
Errors don't have machine-readable error codes, making it difficult for clients to handle specific error types programmatically.

**Recommended Enhancement:**
```typescript
// Extend custom error classes with error codes
class ValidationError extends AppError {
  public code: string;

  constructor(message: string, details: ErrorDetails[] | null = null, code: string = 'VALIDATION_ERROR') {
    super(message, 400, true, details);
    this.name = 'ValidationError';
    this.code = code;
  }
}

// Usage with specific codes:
throw new ValidationError('Invalid email', [
  { field: 'email', message: 'Must be valid email format' }
], 'INVALID_EMAIL_FORMAT');

throw new ValidationError('Required field missing', [
  { field: 'password', message: 'Password is required' }
], 'MISSING_REQUIRED_FIELD');

// Error response includes code:
{
  "status": "error",
  "statusCode": 400,
  "code": "INVALID_EMAIL_FORMAT",
  "message": "Invalid email",
  "details": [...]
}
```

---

### 12. No Circuit Breaker Pattern

**File:** `/home/user/black-cross/backend/modules/ai/llm-client.ts`
**Severity:** LOW

**Issue:**
External API calls don't implement circuit breaker pattern to prevent cascading failures.

**Recommended Enhancement:**
```typescript
import { CircuitBreaker } from 'opossum';

class LLMClient {
  private circuitBreaker: CircuitBreaker;

  constructor(config: LLMConfig) {
    // ... existing initialization

    // Circuit breaker configuration
    this.circuitBreaker = new CircuitBreaker(
      this._callAPI.bind(this),
      {
        timeout: config.timeout, // If request takes longer, trigger failure
        errorThresholdPercentage: 50, // Open circuit if 50% of requests fail
        resetTimeout: 30000, // Try again after 30 seconds
        rollingCountTimeout: 10000, // Count failures over 10 second window
        rollingCountBuckets: 10,
      }
    );

    // Circuit breaker events
    this.circuitBreaker.on('open', () => {
      logger.warn('AI service circuit breaker opened', {
        provider: this.config.provider,
      });
    });

    this.circuitBreaker.on('halfOpen', () => {
      logger.info('AI service circuit breaker half-open (testing)', {
        provider: this.config.provider,
      });
    });

    this.circuitBreaker.on('close', () => {
      logger.info('AI service circuit breaker closed (recovered)', {
        provider: this.config.provider,
      });
    });
  }

  async complete(request: LLMRequest): Promise<LLMResponse> {
    try {
      return await this.circuitBreaker.fire(request);
    } catch (error) {
      if (error.message === 'Breaker is open') {
        throw new ExternalServiceError(
          this.config.provider,
          'AI service temporarily unavailable due to repeated failures',
          [{ message: 'Circuit breaker open', type: 'circuit_breaker_open' }]
        );
      }
      throw error;
    }
  }

  private async _callAPI(request: LLMRequest): Promise<LLMResponse> {
    // ... existing complete logic
  }
}
```

**Note:** Requires `npm install opossum` and proper configuration.

---

### 13. Missing Request Timeout Handling

**Files:** Various modules making external calls
**Severity:** LOW

**Issue:**
Some external HTTP requests don't have explicit timeouts, which can cause hanging requests.

**Current Code:**
```typescript
// No timeout configuration in some places
const response = await axios.post(url, data);
```

**Recommended Fix:**
```typescript
const response = await axios.post(url, data, {
  timeout: 10000, // 10 seconds
  signal: AbortSignal.timeout(10000), // Node.js 18+
});

// Or use axios instance with default timeout
const axiosInstance = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

---

## Recommendations Summary

### Immediate Actions (Critical Priority)

1. **Add process-level error handlers** in `/home/user/black-cross/backend/index.ts`
2. **Replace inline error handler** with centralized `errorHandler` middleware
3. **Replace all console.log/error** with structured logger (228 occurrences)

### High Priority Actions

4. **Standardize error response format** across all controllers
5. **Use asyncHandler wrapper** or ensure all async routes have try-catch
6. **Improve external service error handling** with detailed context
7. **Add database retry logic** and health checks

### Medium Priority Actions

8. **Standardize HTTP status codes** using custom error classes
9. **Add context to error logs** (correlation ID, user ID, resource ID)
10. **Use custom error classes** in service layer instead of generic Error

### Low Priority Enhancements

11. **Add machine-readable error codes** to error responses
12. **Implement circuit breaker pattern** for external services
13. **Add explicit timeouts** to all external HTTP requests

---

## Implementation Priority Matrix

| Priority | Impact | Effort | Implementation Order |
|----------|--------|--------|---------------------|
| Process error handlers | HIGH | LOW | 1 |
| Use centralized error handler | HIGH | LOW | 2 |
| Replace console logging | HIGH | MEDIUM | 3 |
| Standardize error responses | HIGH | MEDIUM | 4 |
| External API error handling | HIGH | MEDIUM | 5 |
| Database retry logic | MEDIUM | MEDIUM | 6 |
| Standardize status codes | MEDIUM | MEDIUM | 7 |
| Add error context | MEDIUM | LOW | 8 |
| Custom errors in services | MEDIUM | LOW | 9 |
| Error codes | LOW | LOW | 10 |
| Circuit breaker | LOW | HIGH | 11 |
| Request timeouts | LOW | LOW | 12 |

---

## Testing Recommendations

### Error Handling Tests

Create comprehensive tests for error scenarios:

```typescript
// /home/user/black-cross/backend/__tests__/error-handling.test.ts

describe('Error Handling', () => {
  describe('Process-level handlers', () => {
    it('should handle unhandled promise rejections', async () => {
      // Test implementation
    });

    it('should handle uncaught exceptions', () => {
      // Test implementation
    });

    it('should handle SIGTERM gracefully', () => {
      // Test implementation
    });
  });

  describe('Controller error handling', () => {
    it('should return 404 for non-existent resources', async () => {
      // Test implementation
    });

    it('should return 400 for validation errors', async () => {
      // Test implementation
    });

    it('should include correlation ID in error response', async () => {
      // Test implementation
    });
  });

  describe('External service errors', () => {
    it('should handle API authentication errors', async () => {
      // Test implementation
    });

    it('should handle API rate limit errors', async () => {
      // Test implementation
    });

    it('should retry on transient failures', async () => {
      // Test implementation
    });
  });

  describe('Database errors', () => {
    it('should retry on connection failures', async () => {
      // Test implementation
    });

    it('should handle query timeouts', async () => {
      // Test implementation
    });
  });
});
```

---

## Monitoring and Alerting

### Recommended Monitoring Setup

1. **Error Rate Monitoring:**
   - Track 4xx vs 5xx error rates
   - Alert on sudden spikes in error rates
   - Monitor error types and frequency

2. **External Service Health:**
   - Track AI service availability
   - Monitor response times
   - Alert on circuit breaker opens

3. **Database Connection Health:**
   - Monitor connection pool usage
   - Track connection failures
   - Alert on connection retry failures

4. **Log Aggregation:**
   - Centralize logs (ELK, Splunk, Datadog, etc.)
   - Create dashboards for error patterns
   - Set up alerts for critical errors

### Example: Integration with Sentry

```typescript
// /home/user/black-cross/backend/config/sentry.ts
import * as Sentry from '@sentry/node';
import config from './index';

if (config.env === 'production' && process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: config.env,
    tracesSampleRate: 0.1,
    beforeSend(event, hint) {
      // Filter out sensitive information
      if (event.request?.headers) {
        delete event.request.headers.authorization;
        delete event.request.headers.cookie;
      }
      return event;
    },
  });
}

export default Sentry;
```

```typescript
// Update error handler to report to Sentry
import Sentry from '../config/sentry';

function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  // ... existing error handling

  // Report to Sentry in production
  if (statusCode >= 500 && config.env === 'production') {
    Sentry.captureException(err, {
      tags: {
        path: req.path,
        method: req.method,
      },
      user: req.user ? { id: req.user.id, email: req.user.email } : undefined,
      extra: {
        correlationId: req.correlationId,
        query: req.query,
        body: req.body, // Sanitize if needed
      },
    });
  }

  // ... existing response logic
}
```

---

## Conclusion

The Black-Cross backend has a **strong foundation** with well-designed custom error classes and centralized error handling middleware. However, several critical gaps must be addressed before production deployment:

### Critical Issues:
- No process-level error handlers (MUST FIX)
- Main app not using centralized error handler (MUST FIX)
- Extensive console logging instead of structured logger (MUST FIX)

### High Priority:
- Inconsistent error response formats
- Missing external service error context
- No database connection retry logic

### Recommendations:
1. Follow the implementation priority matrix above
2. Start with critical fixes (1-3 days of work)
3. Gradually implement high-priority items
4. Add comprehensive error handling tests
5. Set up monitoring and alerting

**Estimated effort for critical fixes:** 2-3 developer days
**Estimated effort for all high-priority items:** 5-7 developer days
**Total estimated effort for complete error handling improvements:** 10-15 developer days

This investment will significantly improve production reliability, debuggability, and user experience.

---

## Additional Resources

- [Express Error Handling](https://expressjs.com/en/guide/error-handling.html)
- [Node.js Error Handling Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [TypeScript Error Handling Patterns](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-4.html)
- [Circuit Breaker Pattern](https://martinfowler.com/bliki/CircuitBreaker.html)
- [Structured Logging with Winston](https://github.com/winstonjs/winston)

---

**Report Generated:** 2025-10-24
**Backend Version:** 1.0.0
**Node.js Version:** 18+
**TypeScript Version:** 5.0+
