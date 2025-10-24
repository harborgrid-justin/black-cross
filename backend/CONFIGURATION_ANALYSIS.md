# Backend Configuration and Environment Management Analysis

**Analysis Date:** 2025-10-24
**Project:** Black-Cross Platform Backend
**Scope:** Configuration management, environment variables, secrets handling, and service discovery

---

## Executive Summary

The backend has a **well-structured centralized configuration system** (`/home/user/black-cross/backend/config/index.ts`) with Joi validation and TypeScript type safety. However, **critical security issues** and **inconsistent adoption** across modules undermine these benefits.

### Critical Findings
- 🔴 **HIGH RISK**: Production database credentials exposed in `.env.example`
- 🔴 **HIGH RISK**: Multiple modules bypass centralized config and access `process.env` directly
- 🟡 **MEDIUM RISK**: Insecure default values for JWT secrets
- 🟡 **MEDIUM RISK**: Third-party API keys not integrated into centralized config validation
- 🟢 **LOW RISK**: Missing environment-specific configurations (dev/staging/prod)

---

## 1. Environment Variable Management

### 1.1 Current State

**Strengths:**
- ✅ Centralized configuration at `/home/user/black-cross/backend/config/index.ts`
- ✅ Joi schema validation for all config values
- ✅ TypeScript interfaces for type safety
- ✅ Default values and fallbacks defined
- ✅ Uses `dotenv/config` for environment loading

**Critical Issues:**

#### Issue 1.1: Production Credentials in `.env.example`
**File:** `/home/user/black-cross/backend/.env.example`

```env
# SECURITY ISSUE: Production credentials exposed
DATABASE_URL="postgresql://neondb_owner:npg_h6g8MDNpsIvO@ep-young-dust-adfkq3rh-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

POSTGRES_HOST=ep-young-dust-adfkq3rh-pooler.c-2.us-east-1.aws.neon.tech
POSTGRES_USER=neondb_owner
POSTGRES_PASSWORD=npg_h6g8MDNpsIvO
```

**Security Concern:** Real production database credentials are committed to version control. This is a **critical security vulnerability**.

**Recommended Fix:**
```env
# Database - PostgreSQL (Sequelize ORM)
# Use your own database credentials below
DATABASE_URL="postgresql://username:password@localhost:5432/blackcross?sslmode=require"

# Or configure individual components
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=blackcross
POSTGRES_USER=blackcross
POSTGRES_PASSWORD=change_me_in_production
```

#### Issue 1.2: Direct `process.env` Access Bypassing Centralized Config

**Affected Files:**
- `/home/user/black-cross/backend/modules/auth/index.ts` (lines 88, 149)
- `/home/user/black-cross/backend/modules/ai/llm-client.ts` (lines 170-187)
- `/home/user/black-cross/backend/utils/cache/redis-client.ts` (line 23)
- `/home/user/black-cross/backend/utils/logger.ts` (lines 56-62, 86)
- `/home/user/black-cross/backend/middleware/rateLimiter.ts` (lines 39-40)
- `/home/user/black-cross/backend/index.ts` (lines 46, 162, 191)
- All module-specific `config/database.ts` files

**Example - Auth Module Issue:**
```typescript
// ❌ BAD: Direct access with insecure fallback
const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret_change_in_production';
const token = jwt.sign({ ... }, jwtSecret, { expiresIn: '24h' });
```

**Security Concern:**
1. Bypasses centralized validation
2. Insecure default allows system to run without proper secrets
3. Hardcoded expiration instead of using config
4. No minimum length validation

**Recommended Fix:**
```typescript
// ✅ GOOD: Use centralized config
import config from '../../config';
import { JWT } from '../../constants';

// Config will fail on startup if JWT_SECRET is invalid
const token = jwt.sign(
  { id: user.id, email: user.email, role: user.role },
  config.security.jwt.secret,
  {
    expiresIn: config.security.jwt.expiration,
    issuer: JWT.ISSUER,
    audience: JWT.AUDIENCE,
  }
);
```

**Note:** The middleware at `/home/user/black-cross/backend/middleware/auth.ts` correctly uses centralized config (lines 41, 82, 179-184).

---

## 2. Configuration File Organization

### 2.1 Current Structure

```
backend/
├── config/
│   ├── index.ts           # ✅ Main config with Joi validation
│   ├── database.ts        # ✅ Centralized DB manager
│   ├── sequelize.ts       # ✅ Sequelize configuration
│   └── swagger.ts         # ✅ API documentation config
├── constants/
│   ├── index.ts
│   ├── app.ts             # ✅ App-wide constants
│   ├── security.ts        # ✅ Security constants
│   ├── database.ts
│   └── ... (8 more files)
├── modules/
│   └── */config/database.ts  # ❌ Module-specific configs (inconsistent)
└── .env.example           # ⚠️ Contains production secrets
```

### 2.2 Issues with Module-Level Configs

Each module has its own `config/database.ts` that directly accesses `process.env`:

**Example:** `/home/user/black-cross/backend/modules/threat-intelligence/config/database.ts`
```typescript
// ❌ BAD: Duplicates configuration logic
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/blackcross';
await mongoose.connect(mongoUri);
```

**Problems:**
1. **Code Duplication**: 15+ identical database config files
2. **Inconsistent Defaults**: Some use different fallback values
3. **No Validation**: Bypasses Joi schema validation
4. **Hard to Maintain**: Changes require updating 15+ files

**Recommended Architecture:**
```typescript
// ✅ GOOD: Use centralized database manager
import dbManager from '../../config/database';

// Connection is managed centrally
const connection = dbManager.getMongoConnection();
if (!connection) {
  console.warn('MongoDB not available for this module');
}
```

---

## 3. Secrets Management

### 3.1 Current State

**Issues Identified:**

| Secret Type | Location | Issue |
|-------------|----------|-------|
| JWT Secret | `.env.example` | ❌ Insecure default `your_jwt_secret_change_in_production` |
| Encryption Key | `.env.example` | ❌ Placeholder `your_encryption_key_32_characters_long` |
| Database Password | `.env.example` | 🔴 **CRITICAL: Real production password** |
| API Keys (4) | `.env.example` | ⚠️ Not validated, no integration guide |
| SMTP Password | `.env.example` | ⚠️ Placeholder only |

### 3.2 Validation Status

**Good - Config Validates:**
```typescript
// From config/index.ts
security: Joi.object({
  jwt: Joi.object({
    secret: Joi.string().min(32).required(),  // ✅ Enforces minimum length
    expiration: Joi.string().default(JWT.DEFAULT_EXPIRATION),
  }).required(),
  encryption: Joi.object({
    key: Joi.string().length(32).required(),  // ✅ Enforces exact length
  }).required(),
})
```

**Bad - Not Validated:**
- Third-party API keys (VirusTotal, Shodan, AlienVault, AbuseIPDB)
- SMTP configuration
- AI/LLM API keys

### 3.3 Recommendations

#### Immediate Actions:

1. **Remove Production Credentials from Git**
```bash
# Create a clean .env.example
cp .env.example .env.example.backup
# Edit to remove all real credentials
# Add to .gitignore history
echo ".env" >> .gitignore
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch backend/.env" \
  --prune-empty --tag-name-filter cat -- --all
```

2. **Implement Secrets Validation**
```typescript
// Add to config/index.ts schema
apiKeys: Joi.object({
  virusTotal: Joi.string().min(32).optional(),
  alienVault: Joi.string().min(32).optional(),
  shodan: Joi.string().min(32).optional(),
  abuseIpDb: Joi.string().min(32).optional(),
}).optional(),

smtp: Joi.object({
  host: Joi.string().hostname().required(),
  port: Joi.number().port().default(587),
  user: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  from: Joi.string().email().required(),
}).optional(),
```

3. **Use Environment-Specific Secrets Management**
```typescript
// Recommended: Integrate with secrets manager
import { SecretsManager } from '@aws-sdk/client-secrets-manager';
// Or use: Azure Key Vault, HashiCorp Vault, etc.

async function loadSecrets() {
  if (process.env.NODE_ENV === 'production') {
    const secrets = await secretsManager.getSecretValue({
      SecretId: 'black-cross/production'
    });
    return JSON.parse(secrets.SecretString);
  }
  // Development: use .env
  return process.env;
}
```

---

## 4. Environment-Specific Configurations

### 4.1 Current State

**Missing:** No separate configuration files for different environments.

Currently, environment differentiation is handled only through:
```typescript
app.env: Joi.string().valid('development', 'production', 'test').default('development')
```

### 4.2 Issues

1. **No environment-specific overrides**
2. **Same configuration schema for all environments**
3. **No staging environment support**
4. **Developers must manually maintain `.env` for different environments**

### 4.3 Recommended Structure

```
backend/config/
├── index.ts              # Main config loader
├── base.ts               # Base configuration (shared)
├── development.ts        # Development overrides
├── staging.ts            # Staging overrides
├── production.ts         # Production overrides
├── test.ts               # Test configuration
└── schema.ts             # Joi validation schemas
```

**Example Implementation:**
```typescript
// config/index.ts
import baseConfig from './base';
import developmentConfig from './development';
import productionConfig from './production';

const env = process.env.NODE_ENV || 'development';

const envConfigs = {
  development: developmentConfig,
  production: productionConfig,
  test: testConfig,
};

// Deep merge base config with environment-specific config
const config = deepMerge(baseConfig, envConfigs[env]);

// Validate merged config
const { error, value } = configSchema.validate(config);
if (error) {
  console.error('Configuration validation failed:', error.details);
  process.exit(1);
}

export default value;
```

**Example - Development Config:**
```typescript
// config/development.ts
export default {
  logging: {
    level: 'debug',
    file: false,
  },
  security: {
    cors: {
      origin: ['http://localhost:3000', 'http://localhost:5173'],
    },
  },
  features: {
    darkWebMonitoring: true,
    malwareSandbox: true,
  },
};
```

---

## 5. Default Values and Fallbacks

### 5.1 Current Implementation

**Strengths:**
```typescript
// Good fallback pattern in centralized config
app: Joi.object({
  port: Joi.number().integer().min(1).max(65535).default(PORTS.APP),
  host: Joi.string().default('0.0.0.0'),
})
```

**Issues:**
```typescript
// ❌ BAD: Insecure fallbacks in modules
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/blackcross';

// ❌ BAD: Allows system to run with insecure defaults
const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret_change_in_production';
```

### 5.2 Recommendations

**Security-Critical Values:**
```typescript
// ✅ GOOD: No fallback for secrets
security: Joi.object({
  jwt: Joi.object({
    secret: Joi.string().min(32).required(), // No .default()
  }).required(),
})

// Application fails on startup if JWT_SECRET not provided
```

**Non-Security Values:**
```typescript
// ✅ GOOD: Safe fallbacks for operational config
logging: Joi.object({
  level: Joi.string().valid('error', 'warn', 'info', 'debug').default('info'),
  maxFiles: Joi.number().integer().default(5),
})
```

---

## 6. Configuration Schema Validation

### 6.1 Current Implementation

**Excellent implementation in centralized config:**
```typescript
// config/index.ts uses Joi for comprehensive validation
const { error, value: config } = configSchema.validate(rawConfig, {
  abortEarly: false,
  stripUnknown: true,
});

if (error) {
  console.error('Configuration validation failed:');
  error.details.forEach((detail) => {
    console.error(`  - ${detail.path.join('.')}: ${detail.message}`);
  });
  process.exit(1);
}
```

**Benefits:**
- ✅ Type safety with TypeScript interfaces
- ✅ Runtime validation with Joi
- ✅ Detailed error messages
- ✅ Fails fast on invalid configuration

### 6.2 Missing Validations

1. **Third-Party API Keys**
```typescript
// Add to schema:
externalApis: Joi.object({
  virusTotal: Joi.object({
    apiKey: Joi.string().pattern(/^[a-f0-9]{64}$/).optional(),
    rateLimit: Joi.number().default(4), // requests per minute
  }),
  shodan: Joi.object({
    apiKey: Joi.string().min(32).optional(),
  }),
  alienVault: Joi.object({
    apiKey: Joi.string().min(40).optional(),
  }),
  abuseIpDb: Joi.object({
    apiKey: Joi.string().min(80).optional(),
  }),
}).optional(),
```

2. **Email Configuration**
```typescript
email: Joi.object({
  smtp: Joi.object({
    host: Joi.string().hostname().required(),
    port: Joi.number().port().default(587),
    secure: Joi.boolean().default(false),
    auth: Joi.object({
      user: Joi.string().email().required(),
      pass: Joi.string().min(8).required(),
    }).required(),
    from: Joi.string().email().required(),
  }).required(),
}).optional(),
```

3. **AI/LLM Configuration**
```typescript
ai: Joi.object({
  provider: Joi.string().valid('openai', 'anthropic', 'azure_openai').default('openai'),
  apiKey: Joi.string().min(20).required(),
  model: Joi.string().default('gpt-4'),
  endpoint: Joi.string().uri().optional(),
  maxTokens: Joi.number().integer().min(100).max(32000).default(2000),
  temperature: Joi.number().min(0).max(2).default(0.7),
  timeout: Joi.number().integer().min(5000).max(120000).default(30000),
}).optional(),
```

---

## 7. Feature Flags Implementation

### 7.1 Current Implementation

**Partial implementation exists:**
```typescript
// config/index.ts
features: Joi.object({
  darkWebMonitoring: Joi.boolean().default(true),
  malwareSandbox: Joi.boolean().default(true),
  automatedResponse: Joi.boolean().default(true),
  threatHunting: Joi.boolean().default(true),
  complianceManagement: Joi.boolean().default(true),
}).default(),
```

**Environment Variables:**
```typescript
features: {
  darkWebMonitoring: process.env.FEATURE_DARK_WEB_MONITORING !== 'false',
  malwareSandbox: process.env.FEATURE_MALWARE_SANDBOX !== 'false',
  // ...
}
```

### 7.2 Issues

1. **Not documented** in `.env.example`
2. **Not used** in application code (no feature flag checks found)
3. **Limited scope** - only 5 features defined
4. **No runtime toggling** - requires restart

### 7.3 Recommended Enhancement

**Add to `.env.example`:**
```env
# Feature Flags (set to 'false' to disable)
FEATURE_DARK_WEB_MONITORING=true
FEATURE_MALWARE_SANDBOX=true
FEATURE_AUTOMATED_RESPONSE=true
FEATURE_THREAT_HUNTING=true
FEATURE_COMPLIANCE_MANAGEMENT=true

# Additional feature flags
FEATURE_AI_ASSISTANT=false
FEATURE_ADVANCED_ANALYTICS=true
FEATURE_EXTERNAL_INTEGRATIONS=true
```

**Usage in Application:**
```typescript
// middleware/featureFlag.ts
import config from '../config';

export function requireFeature(featureName: keyof typeof config.features) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!config.features[featureName]) {
      return res.status(503).json({
        success: false,
        error: 'Feature not enabled',
        feature: featureName,
      });
    }
    next();
  };
}

// Usage in routes:
router.post('/dark-web/scan',
  authenticate,
  requireFeature('darkWebMonitoring'),
  darkWebController.scan
);
```

**Advanced: Dynamic Feature Flags**
```typescript
// services/featureFlags.ts
import { redisClient } from '../utils/cache/redis-client';

class FeatureFlagService {
  private cache: Map<string, boolean> = new Map();

  async isEnabled(feature: string, userId?: string): Promise<boolean> {
    // Check user-specific override
    if (userId) {
      const userOverride = await redisClient.get(`feature:${feature}:user:${userId}`);
      if (userOverride !== null) {
        return userOverride === 'true';
      }
    }

    // Check Redis for runtime toggle
    const redisValue = await redisClient.get(`feature:${feature}`);
    if (redisValue !== null) {
      return redisValue === 'true';
    }

    // Fall back to config
    return config.features[feature] ?? false;
  }

  async enable(feature: string, userId?: string): Promise<void> {
    const key = userId ? `feature:${feature}:user:${userId}` : `feature:${feature}`;
    await redisClient.set(key, 'true', { EX: 86400 }); // 24h expiry
  }

  async disable(feature: string, userId?: string): Promise<void> {
    const key = userId ? `feature:${feature}:user:${userId}` : `feature:${feature}`;
    await redisClient.set(key, 'false', { EX: 86400 });
  }
}

export const featureFlags = new FeatureFlagService();
```

---

## 8. Service Discovery and URLs

### 8.1 Current Implementation

**Well-structured constants:**
```typescript
// constants/app.ts
export const PORTS = {
  APP: 8080,
  METRICS: 9090,
  MONGODB: 27017,
  POSTGRESQL: 5432,
  REDIS: 6379,
  ELASTICSEARCH: 9200,
  RABBITMQ: 5672,
  RABBITMQ_MANAGEMENT: 15672,
} as const;
```

**Database URLs in config:**
```typescript
database: {
  mongodb: { uri: process.env.MONGODB_URI },
  postgresql: { url: process.env.DATABASE_URL },
  redis: { url: process.env.REDIS_URL },
  elasticsearch: { url: process.env.ELASTICSEARCH_URL },
}
```

### 8.2 Issues

1. **No service health check URLs** defined
2. **No timeout configurations** centralized
3. **Connection retry logic** scattered across modules
4. **No circuit breaker** pattern for external services

### 8.3 Recommended Enhancements

```typescript
// config/services.ts
export interface ServiceConfig {
  url: string;
  timeout: number;
  retries: number;
  healthCheckPath?: string;
  circuitBreaker?: {
    threshold: number;
    timeout: number;
    resetTimeout: number;
  };
}

const servicesConfig = {
  database: Joi.object({
    postgresql: Joi.object({
      url: Joi.string().uri().required(),
      pool: Joi.object({
        min: Joi.number().integer().default(2),
        max: Joi.number().integer().default(10),
        acquireTimeout: Joi.number().default(30000),
        idleTimeout: Joi.number().default(10000),
      }),
      retries: Joi.number().integer().default(3),
      retryDelay: Joi.number().default(1000),
    }).required(),

    mongodb: Joi.object({
      uri: Joi.string().uri().required(),
      options: Joi.object({
        maxPoolSize: Joi.number().integer().default(10),
        minPoolSize: Joi.number().integer().default(2),
        serverSelectionTimeoutMS: Joi.number().default(5000),
        socketTimeoutMS: Joi.number().default(45000),
        retryWrites: Joi.boolean().default(true),
        retryReads: Joi.boolean().default(true),
      }),
    }).optional(), // MongoDB is optional

    redis: Joi.object({
      url: Joi.string().uri().required(),
      options: Joi.object({
        maxRetriesPerRequest: Joi.number().default(3),
        connectTimeout: Joi.number().default(10000),
        commandTimeout: Joi.number().default(5000),
      }),
    }).optional(),

    elasticsearch: Joi.object({
      url: Joi.string().uri().required(),
      auth: Joi.object({
        username: Joi.string().optional(),
        password: Joi.string().optional(),
      }),
      maxRetries: Joi.number().default(3),
      requestTimeout: Joi.number().default(30000),
    }).optional(),
  }).required(),

  externalApis: Joi.object({
    virusTotal: Joi.object({
      baseUrl: Joi.string().uri().default('https://www.virustotal.com/api/v3'),
      apiKey: Joi.string().optional(),
      timeout: Joi.number().default(30000),
      rateLimit: Joi.number().default(4), // requests per minute
    }).optional(),

    shodan: Joi.object({
      baseUrl: Joi.string().uri().default('https://api.shodan.io'),
      apiKey: Joi.string().optional(),
      timeout: Joi.number().default(30000),
    }).optional(),
  }).optional(),
};
```

---

## 9. Third-Party API Configuration

### 9.1 Current State

**Defined in `.env.example` but not integrated:**
```env
# Threat Intelligence API Keys
VIRUSTOTAL_API_KEY=your_virustotal_api_key
ALIENVAULT_API_KEY=your_alienvault_api_key
SHODAN_API_KEY=your_shodan_api_key
ABUSEIPDB_API_KEY=your_abuseipdb_api_key
```

**Issues:**
1. ❌ Not part of centralized config
2. ❌ No validation
3. ❌ No usage documentation
4. ❌ No rate limit configuration
5. ❌ No timeout settings
6. ❌ No retry logic

### 9.2 Recommended Integration

```typescript
// config/externalApis.ts
export interface ExternalApiConfig {
  enabled: boolean;
  baseUrl: string;
  apiKey?: string;
  timeout: number;
  retries: number;
  rateLimit?: {
    requests: number;
    window: number; // milliseconds
  };
}

export const externalApisSchema = Joi.object({
  virusTotal: Joi.object({
    enabled: Joi.boolean().default(false),
    baseUrl: Joi.string().uri().default('https://www.virustotal.com/api/v3'),
    apiKey: Joi.string().min(64).optional(),
    timeout: Joi.number().default(30000),
    retries: Joi.number().default(3),
    rateLimit: Joi.object({
      requests: Joi.number().default(4),
      window: Joi.number().default(60000), // per minute
    }),
  }).custom((value, helpers) => {
    if (value.enabled && !value.apiKey) {
      return helpers.error('apiKey is required when enabled=true');
    }
    return value;
  }),

  shodan: Joi.object({
    enabled: Joi.boolean().default(false),
    baseUrl: Joi.string().uri().default('https://api.shodan.io'),
    apiKey: Joi.string().min(32).optional(),
    timeout: Joi.number().default(30000),
    retries: Joi.number().default(3),
  }),

  alienVault: Joi.object({
    enabled: Joi.boolean().default(false),
    baseUrl: Joi.string().uri().default('https://otx.alienvault.com/api/v1'),
    apiKey: Joi.string().min(40).optional(),
    timeout: Joi.number().default(30000),
    retries: Joi.number().default(3),
  }),

  abuseIpDb: Joi.object({
    enabled: Joi.boolean().default(false),
    baseUrl: Joi.string().uri().default('https://api.abuseipdb.com/api/v2'),
    apiKey: Joi.string().min(80).optional(),
    timeout: Joi.number().default(30000),
    retries: Joi.number().default(3),
    rateLimit: Joi.object({
      requests: Joi.number().default(1000),
      window: Joi.number().default(86400000), // per day
    }),
  }),
});

// Usage service
class ExternalApiService {
  constructor(private config: ExternalApiConfig) {}

  async call<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          ...options?.headers,
          'x-apikey': this.config.apiKey,
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      return await response.json();
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
```

---

## 10. Configuration Documentation

### 10.1 Current State

**Documentation Status:**
- ❌ No dedicated configuration guide
- ⚠️ `.env.example` has minimal comments
- ❌ No explanation of required vs optional variables
- ❌ No examples for different environments
- ⚠️ Backend README mentions config but lacks details

### 10.2 Recommended Documentation

#### Create `backend/docs/CONFIGURATION.md`:

```markdown
# Configuration Guide

## Overview

Black-Cross uses a centralized configuration system with environment variables,
Joi schema validation, and TypeScript type safety.

## Quick Start

1. Copy environment template:
   ```bash
   cp .env.example .env
   ```

2. Set required variables (see Required Configuration below)

3. Validate configuration:
   ```bash
   npm run config:validate
   ```

## Required Configuration

### Database (Required)
```env
# PostgreSQL - Primary Database
DATABASE_URL="postgresql://user:pass@localhost:5432/dbname"
# Or use individual components:
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=blackcross
POSTGRES_USER=blackcross
POSTGRES_PASSWORD=<strong-password>
```

### Security (Required)
```env
# JWT Secret - MUST be at least 32 characters
JWT_SECRET=<generate-with-openssl-rand-base64-32>

# Encryption Key - MUST be exactly 32 characters
ENCRYPTION_KEY=<generate-with-openssl-rand-hex-32>

# Session Secret
SESSION_SECRET=<generate-with-openssl-rand-base64-32>
```

**Generate secure secrets:**
```bash
# JWT Secret
openssl rand -base64 32

# Encryption Key
openssl rand -hex 32

# Session Secret
openssl rand -base64 32
```

## Optional Configuration

### MongoDB (Optional)
```env
MONGODB_URI=mongodb://localhost:27017/blackcross
```

### Redis (Optional - Recommended for Production)
```env
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=<optional-password>
```

### Email/SMTP (Optional)
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=<app-specific-password>
SMTP_FROM=noreply@black-cross.io
```

### Third-Party APIs (Optional)
```env
# VirusTotal
VIRUSTOTAL_API_KEY=<your-api-key>

# Shodan
SHODAN_API_KEY=<your-api-key>

# AlienVault OTX
ALIENVAULT_API_KEY=<your-api-key>

# AbuseIPDB
ABUSEIPDB_API_KEY=<your-api-key>
```

## Environment-Specific Configuration

### Development
```env
NODE_ENV=development
LOG_LEVEL=debug
CORS_ORIGIN=http://localhost:3000
```

### Production
```env
NODE_ENV=production
LOG_LEVEL=info
LOG_FILE=true
CORS_ORIGIN=https://yourdomain.com
```

### Testing
```env
NODE_ENV=test
DATABASE_URL=postgresql://user:pass@localhost:5432/blackcross_test
```

## Feature Flags

Control which features are enabled:
```env
FEATURE_DARK_WEB_MONITORING=true
FEATURE_MALWARE_SANDBOX=true
FEATURE_AUTOMATED_RESPONSE=true
FEATURE_THREAT_HUNTING=true
FEATURE_COMPLIANCE_MANAGEMENT=true
```

## Validation

Configuration is validated on application startup. Invalid configuration will:
1. Print detailed error messages
2. Exit with code 1

Common validation errors:
- JWT_SECRET too short (minimum 32 characters)
- ENCRYPTION_KEY wrong length (must be exactly 32 characters)
- Invalid DATABASE_URL format
- Missing required fields

## Best Practices

1. **Never commit `.env` files** to version control
2. **Use different `.env` files** for each environment
3. **Rotate secrets regularly** (every 90 days recommended)
4. **Use secrets management** in production (AWS Secrets Manager, Azure Key Vault, etc.)
5. **Validate configuration** before deployment
6. **Monitor for configuration errors** in logs

## Troubleshooting

### Application won't start
- Check configuration validation errors in console
- Ensure all required variables are set
- Verify database connectivity

### "JWT_SECRET validation failed"
- Ensure JWT_SECRET is at least 32 characters
- Remove any quotes or spaces

### "ENCRYPTION_KEY must be 32 characters"
- Generate new key: `openssl rand -hex 32`
- Ensure exactly 32 characters (64 hex digits = 32 bytes)
```

---

## Summary of Recommendations

### 🔴 Critical (Immediate Action Required)

1. **Remove production credentials from `.env.example`**
   - Replace with placeholder values
   - Rotate exposed credentials immediately

2. **Fix auth module to use centralized config**
   - File: `/home/user/black-cross/backend/modules/auth/index.ts`
   - Remove direct `process.env` access
   - Use `config.security.jwt.secret`

3. **Eliminate insecure defaults**
   - Remove fallback for JWT_SECRET
   - Remove fallback for ENCRYPTION_KEY
   - Force validation on startup

### 🟡 High Priority (Within Sprint)

4. **Consolidate database configurations**
   - Remove module-specific `config/database.ts` files
   - Use centralized `dbManager` from `/home/user/black-cross/backend/config/database.ts`

5. **Add third-party API configuration**
   - Integrate API keys into centralized config
   - Add Joi validation for each API
   - Document usage

6. **Create configuration documentation**
   - Add `backend/docs/CONFIGURATION.md`
   - Update `.env.example` with detailed comments
   - Add troubleshooting guide

### 🟢 Medium Priority (Next Sprint)

7. **Implement environment-specific configs**
   - Create `config/development.ts`, `config/production.ts`, etc.
   - Support deep merging of configs
   - Document environment patterns

8. **Enhance feature flags**
   - Document in `.env.example`
   - Implement middleware for feature checking
   - Consider runtime toggling with Redis

9. **Add configuration validation script**
   - Create `npm run config:validate`
   - Test configuration without starting server
   - Use in CI/CD pipeline

### 🔵 Low Priority (Future Enhancement)

10. **Integrate secrets management service**
    - AWS Secrets Manager / Azure Key Vault
    - Implement secret rotation
    - Add audit logging

11. **Implement circuit breaker pattern**
    - For external API calls
    - For database connections
    - Add health checks

---

## Conclusion

The Black-Cross backend has a **solid foundation** for configuration management with centralized config and validation. However, **critical security issues** and **inconsistent adoption** require immediate attention.

**Priority Actions:**
1. Remove production credentials from version control
2. Fix direct `process.env` access in auth module
3. Consolidate database configurations
4. Add comprehensive documentation

Implementing these recommendations will significantly improve security, maintainability, and developer experience.

---

**Generated:** 2025-10-24
**Reviewed By:** Claude Code Analysis
**Version:** 1.0
