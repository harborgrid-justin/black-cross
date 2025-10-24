# Database Initialization Summary

## Overview

This document summarizes the PostgreSQL initialization setup for the Black-Cross threat intelligence platform.

## Files Created

### 1. `init-db.sql` (361 lines)
**Primary PostgreSQL initialization script** - Runs automatically via Docker Compose

**Sections**:
1. Database Creation and Connection Configuration
2. Essential PostgreSQL Extensions (uuid-ossp, pgcrypto, citext, pg_trgm, unaccent)
3. Schema Management (public schema setup)
4. Database Configuration and Performance Tuning
5. Security Configuration (permissions, privileges)
6. Audit and Logging Preparation
7. Utility Functions for Threat Intelligence
8. Performance Optimization Settings
9. Full-Text Search Configuration
10. Index Templates and Conventions (documentation)
11. Data Validation and Constraints (custom domain types)
12. Initialization Verification

**Key Features**:
- Production-ready with comprehensive error handling
- Idempotent (safe to run multiple times)
- Creates 7 utility functions for IOC validation
- Defines 4 custom domain types for data integrity
- Configures full-text search with accent removal
- Sets up audit triggers and metadata functions
- Optimizes performance settings for threat intelligence workloads

### 2. `validate-db.ts` (375 lines)
**Database validation and health check script**

**Validation Checks** (9 sections):
1. Database Connection Test
2. PostgreSQL Version Check (≥17.0 recommended)
3. Extension Validation (5 required extensions)
4. Utility Function Checks (7 functions)
5. Utility Function Testing (normalize_ioc, is_valid_ipv4, is_valid_email)
6. Domain Type Checks (4 custom types)
7. Configuration Checks (timezone, max_connections)
8. Schema and Permissions Verification
9. Full-Text Search Configuration

**Usage**:
```bash
# From repository root
npm run db:validate

# From backend directory
cd backend && npm run db:validate
```

**Output**: Color-coded validation results with pass/fail/warning status for each check.

### 3. `README.md` (542 lines)
**Comprehensive documentation for database scripts**

**Contents**:
- Overview of database architecture
- Detailed documentation for each script
- Docker integration guide
- Development workflow instructions
- Production considerations (security, performance, backup)
- Troubleshooting guide
- Monitoring and maintenance queries
- References and support information

## Installation Verification

### Quick Test

After starting the database with Docker:

```bash
# 1. Start PostgreSQL
docker-compose up -d postgres

# 2. Wait for initialization (check logs)
docker-compose logs -f postgres

# 3. Validate database setup
npm run db:validate

# 4. Sync Sequelize models
npm run db:sync

# 5. Create admin user
npm run create-admin
```

### Expected Output

The validation script should show:
- ✅ All 5 PostgreSQL extensions installed
- ✅ All 7 utility functions created
- ✅ All 4 custom domain types defined
- ✅ Timezone set to UTC
- ✅ Max connections ≥ 100
- ✅ Public schema exists with proper permissions
- ✅ Full-text search configuration (threat_search) created

## PostgreSQL Extensions

### 1. uuid-ossp
**Purpose**: UUID generation for primary keys
**Usage**: All models use UUID v4 as primary keys instead of auto-incrementing integers
**Security**: Prevents user enumeration attacks

### 2. pgcrypto
**Purpose**: Cryptographic functions
**Usage**: Password hashing, data encryption at rest
**Functions**: `gen_salt()`, `crypt()`, `decrypt()`, `encrypt()`

### 3. citext
**Purpose**: Case-insensitive text type
**Usage**: Email and username fields for efficient case-insensitive queries
**Benefit**: Eliminates need for LOWER() in WHERE clauses

### 4. pg_trgm
**Purpose**: Trigram similarity search
**Usage**: Fuzzy matching for IOCs, CVEs, threat actor names
**Benefit**: Enables typo-tolerant searches and approximate string matching

### 5. unaccent
**Purpose**: Accent removal for text search
**Usage**: Full-text search dictionaries
**Benefit**: Improves search results for international characters

## Utility Functions

### 1. `trigger_set_timestamp()`
Automatically updates `updated_at` timestamp on row modification.

**Usage**: Attach to any table as BEFORE UPDATE trigger.

### 2. `audit_metadata()`
Generates audit trail metadata (timestamp, user, IP address).

**Returns**: TABLE with audit_timestamp, audit_user, audit_ip.

### 3. `normalize_ioc(TEXT)`
Normalizes IOC values (lowercase, trim whitespace).

**Example**: `normalize_ioc('  MALWARE.COM  ')` → `'malware.com'`

### 4. `is_valid_ipv4(TEXT)`
Validates IPv4 address format.

**Example**: `is_valid_ipv4('192.168.1.1')` → `TRUE`

### 5. `is_valid_ipv6(TEXT)`
Validates IPv6 address format (simplified regex).

**Example**: `is_valid_ipv6('2001:0db8::1')` → `TRUE`

### 6. `is_valid_domain(TEXT)`
Validates domain name format.

**Example**: `is_valid_domain('example.com')` → `TRUE`

### 7. `is_valid_email(TEXT)`
Validates email address format.

**Example**: `is_valid_email('user@example.com')` → `TRUE`

## Custom Domain Types

### 1. `severity_level`
**Valid values**: 'low', 'medium', 'high', 'critical'
**Usage**: Incidents, vulnerabilities, alerts

### 2. `incident_status`
**Valid values**: 'open', 'investigating', 'contained', 'resolved', 'closed', 'false_positive'
**Usage**: Incident lifecycle tracking

### 3. `user_role`
**Valid values**: 'admin', 'analyst', 'manager', 'viewer', 'guest'
**Usage**: RBAC (Role-Based Access Control)

### 4. `priority_level`
**Valid values**: 1-5 (1=highest priority, 5=lowest)
**Usage**: Incident prioritization, task management

## Performance Configuration

### Database-Level Settings

- **Timezone**: UTC (for consistent timestamp handling)
- **Statistics Target**: 100 (for better query planning)
- **Max Parallel Workers**: 4 (for multi-core query execution)
- **Work Memory**: 4MB (for sorting and hash operations)
- **JIT Compilation**: Enabled (for complex queries)

### Docker Compose Settings

From `docker-compose.yml`:

```yaml
-c max_connections=200
-c shared_buffers=256MB
-c effective_cache_size=1GB
-c maintenance_work_mem=64MB
-c checkpoint_completion_target=0.9
-c wal_buffers=16MB
-c default_statistics_target=100
-c random_page_cost=1.1
-c effective_io_concurrency=200
-c work_mem=2621kB
-c min_wal_size=1GB
-c max_wal_size=4GB
```

**Optimized for**:
- High transaction throughput
- Concurrent read/write operations
- Fast query execution for threat intelligence
- Efficient memory usage

## Security Hardening

### Permissions Strategy

1. **Blackcross User**: Full privileges on blackcross database only
2. **Public Schema**: CREATE privilege revoked from PUBLIC role
3. **Default Privileges**: Automatically applied to new tables/sequences
4. **Least Privilege**: Application user has only necessary permissions

### Best Practices Applied

- ✅ UUID primary keys (prevents enumeration)
- ✅ Password hashing with pgcrypto
- ✅ Case-insensitive user lookups (prevents username leakage)
- ✅ Audit trail functions for compliance
- ✅ Input validation via custom domain types
- ✅ SSL/TLS support configured
- ✅ Connection limits enforced (200 max)

## Troubleshooting

### Validation Failures

If `npm run db:validate` fails:

1. **Extension missing**: Docker volume may not have initialized
   - Solution: `docker-compose down -v && docker-compose up -d postgres`

2. **Connection refused**: PostgreSQL not ready yet
   - Solution: Wait 10-15 seconds, check logs with `docker-compose logs postgres`

3. **Permission denied**: User lacks necessary privileges
   - Solution: Re-run init-db.sql script manually

4. **Version mismatch**: Wrong PostgreSQL version
   - Solution: Verify `docker-compose.yml` uses `postgres:17-alpine`

### Manual Re-initialization

If you need to re-run the initialization script:

```bash
# 1. Stop and remove volumes
docker-compose down -v

# 2. Start PostgreSQL fresh
docker-compose up -d postgres

# 3. Wait for initialization
sleep 15

# 4. Validate setup
npm run db:validate

# 5. Sync models
npm run db:sync
```

## Integration with Sequelize ORM

### Division of Responsibility

**init-db.sql manages**:
- Database creation and configuration
- Extension installation
- Utility functions
- Custom domain types
- Performance settings
- Security configuration

**Sequelize ORM manages**:
- Table schemas and structure
- Column definitions and constraints
- Indexes and foreign keys
- Model relationships
- Data migrations over time

### Workflow

1. **Initialization**: `init-db.sql` runs on first Docker start
2. **Schema Creation**: Sequelize creates tables via `npm run db:sync`
3. **Data Seeding**: Optional seeding with `npm run db:seed`
4. **Application Start**: Backend connects and uses Sequelize models

## Production Deployment Checklist

Before deploying to production:

- [ ] Change default database password
- [ ] Enable SSL/TLS for database connections
- [ ] Configure automated backups (daily full + hourly incremental)
- [ ] Set up monitoring for connection pool, query performance
- [ ] Enable query logging for slow queries (> 100ms)
- [ ] Configure WAL archiving for point-in-time recovery
- [ ] Review and adjust connection pool settings
- [ ] Set up database metrics collection (Prometheus, DataDog)
- [ ] Configure alerts for disk space, connection limits
- [ ] Test disaster recovery procedures
- [ ] Document database topology and architecture
- [ ] Review and audit database permissions
- [ ] Enable pgaudit extension for compliance logging
- [ ] Configure firewall rules to restrict database access

## Next Steps

1. **Validate Setup**: Run `npm run db:validate`
2. **Sync Models**: Run `npm run db:sync`
3. **Create Admin**: Run `npm run create-admin`
4. **Seed Data** (optional): Run `npm run db:seed`
5. **Start Application**: Run `npm run dev`

## Additional Resources

- [PostgreSQL 17 Documentation](https://www.postgresql.org/docs/17/)
- [Sequelize TypeScript Docs](https://sequelize.org/docs/v6/other-topics/typescript/)
- [Backend Scripts README](./README.md)
- [Black-Cross Architecture Guide](../../CLAUDE.md)
- [Docker Compose Configuration](../../docker-compose.yml)

---

**Created**: 2025-10-24
**Purpose**: PostgreSQL database initialization for Black-Cross platform
**Maintainer**: Black-Cross Database Team
