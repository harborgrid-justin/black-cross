# Database Initialization Scripts

This directory contains scripts for initializing, managing, and maintaining the Black-Cross PostgreSQL database.

## Overview

The Black-Cross platform uses PostgreSQL 17 as its primary relational database, managed through Sequelize ORM. This directory provides initialization and utility scripts for database setup, testing, and seeding.

## Files

### `init-db.sql` - PostgreSQL Initialization Script

**Purpose**: Prepares the PostgreSQL database with extensions, functions, and configuration.

**Execution**: Automatically runs on first container startup via Docker's `/docker-entrypoint-initdb.d/` mechanism.

**Key Features**:
- Creates and configures the `blackcross` database
- Installs essential PostgreSQL extensions (uuid-ossp, pgcrypto, citext, pg_trgm, unaccent)
- Sets up utility functions for IOC validation and normalization
- Configures security permissions and access control
- Establishes audit trigger functions for compliance
- Optimizes database performance settings
- Defines custom domain types for data validation

**Important Notes**:
- Runs ONLY on first container startup (when data volume is empty)
- Does NOT create tables - tables are managed by Sequelize ORM
- Idempotent - safe to run multiple times (uses IF NOT EXISTS)
- Production-ready with comprehensive error handling

**Extensions Installed**:
1. **uuid-ossp**: UUID generation for primary keys
2. **pgcrypto**: Cryptographic functions for password hashing and encryption
3. **citext**: Case-insensitive text type for email/username fields
4. **pg_trgm**: Trigram similarity search for fuzzy IOC matching
5. **unaccent**: Text search dictionary for accent removal

**Utility Functions Created**:
- `trigger_set_timestamp()`: Auto-update updated_at timestamps
- `audit_metadata()`: Generate audit trail metadata
- `normalize_ioc(TEXT)`: Normalize IOC values for consistent storage
- `is_valid_ipv4(TEXT)`: Validate IPv4 address format
- `is_valid_ipv6(TEXT)`: Validate IPv6 address format
- `is_valid_domain(TEXT)`: Validate domain name format
- `is_valid_email(TEXT)`: Validate email address format

**Custom Domain Types**:
- `severity_level`: Valid severity levels (low, medium, high, critical)
- `incident_status`: Valid incident status values
- `user_role`: Valid user roles for RBAC
- `priority_level`: Valid priority levels (1-5)

### `sync-db.ts` - Database Schema Synchronization

**Purpose**: Synchronizes Sequelize models with the PostgreSQL database schema.

**Usage**:
```bash
# From repository root
npm run db:sync

# From backend directory
cd backend && npm run db:sync
```

**Behavior**:
- Creates tables if they don't exist
- Alters existing tables to match model definitions (non-destructive)
- Does NOT drop tables or delete data
- Safe to run in development and production

**Use Cases**:
- After adding new models to `backend/models/`
- After modifying existing model schemas
- After pulling updates from version control
- Initial database setup after Docker container starts

### `create-test-user.ts` - Create Admin User

**Purpose**: Creates an admin user account for initial platform access.

**Usage**:
```bash
# From repository root
npm run create-admin

# From backend directory
cd backend && npm run create-admin
```

**Default Credentials**:
- Email: `admin@blackcross.local`
- Username: `admin`
- Password: `Admin123!` (change immediately in production)
- Role: `admin`

**Security Notes**:
- Default password should be changed immediately
- Only use in development or for initial setup
- In production, use strong, unique passwords
- Consider implementing 2FA for admin accounts

### `seed-db.ts` - Database Seeding

**Purpose**: Populates the database with sample data for development and testing.

**Usage**:
```bash
# From backend directory
cd backend && npm run seed

# Or directly with ts-node
npx ts-node scripts/seed-db.ts
```

**Seeds Created**:
- Sample users with different roles
- Security incidents with various statuses and severities
- Vulnerabilities and CVE mappings
- Assets and network inventory
- IOCs (Indicators of Compromise)
- Threat actor profiles
- Playbook executions
- Audit logs

**Use Cases**:
- Development environment setup
- Testing and QA environments
- Demo and training environments
- Feature development and debugging

**Warning**: Do NOT run in production - this will populate the database with test data.

### `seed-threats.ts` - Threat Intelligence Seeding

**Purpose**: Seeds the database with realistic threat intelligence data.

**Usage**:
```bash
# From backend directory
npx ts-node scripts/seed-threats.ts
```

**Seeds Created**:
- Threat intelligence feeds
- IOC collections (IPs, domains, file hashes)
- Threat actor profiles with TTPs
- MITRE ATT&CK techniques
- CVE vulnerability data

**Use Cases**:
- Testing threat detection workflows
- Demonstrating threat intelligence features
- Developing threat hunting capabilities
- Training and education

### `test-connection.ts` - Database Connection Test

**Purpose**: Verifies PostgreSQL connectivity and authentication.

**Usage**:
```bash
# From backend directory
npx ts-node scripts/test-connection.ts
```

**Checks Performed**:
- Database connection establishment
- Authentication with credentials
- Query execution capability
- Extension availability

**Use Cases**:
- Troubleshooting connection issues
- Verifying database configuration
- CI/CD pipeline health checks
- Pre-deployment validation

## Docker Integration

### Automatic Initialization

The `init-db.sql` script is automatically executed during PostgreSQL container initialization:

```yaml
# docker-compose.yml
postgres:
  image: postgres:17-alpine
  volumes:
    - postgres-data:/var/lib/postgresql/data
    - ./backend/scripts/init-db.sql:/docker-entrypoint-initdb.d/init.sql:ro
```

**Execution Flow**:
1. Docker starts PostgreSQL container
2. PostgreSQL checks if data volume is empty
3. If empty, executes all scripts in `/docker-entrypoint-initdb.d/` in alphabetical order
4. Our `init.sql` script runs and configures the database
5. Sequelize ORM creates tables when backend application starts

**Important**:
- Runs ONLY on first startup with empty data volume
- To re-run initialization, delete the Docker volume: `docker-compose down -v`
- In production, never delete volumes - use migrations instead

### Manual Initialization (Without Docker)

If running PostgreSQL outside Docker:

```bash
# Connect to PostgreSQL as superuser
psql -U postgres

# Run initialization script
\i backend/scripts/init-db.sql

# Verify installation
\dx  # List installed extensions
\df public.normalize_ioc  # Check utility functions
```

## Database Schema Management Strategy

Black-Cross uses a **hybrid approach** for database schema management:

### 1. Initial Setup (init-db.sql)
- Database creation and configuration
- Extension installation
- Utility function creation
- Performance optimization
- Security configuration

### 2. Schema Management (Sequelize ORM)
- Table creation and structure
- Column definitions and constraints
- Indexes and relationships
- Model synchronization

### 3. Data Migrations (Future)
- Schema evolution over time
- Backward-compatible changes
- Data transformations
- Version control for schema changes

## Development Workflow

### First-Time Setup

```bash
# 1. Start PostgreSQL with Docker
docker-compose up -d postgres

# 2. Wait for initialization to complete (check logs)
docker-compose logs -f postgres

# 3. Sync Sequelize models to create tables
npm run db:sync

# 4. Create admin user
npm run create-admin

# 5. (Optional) Seed development data
cd backend && npm run seed

# 6. Start the application
npm run dev
```

### Schema Updates

When you modify Sequelize models:

```bash
# 1. Update model definitions in backend/models/

# 2. Sync changes to database
npm run db:sync

# 3. Verify changes
npm run test:backend
```

### Reset Database (Development Only)

```bash
# WARNING: This deletes ALL data!

# Option 1: Reset Docker volume
docker-compose down -v
docker-compose up -d postgres
npm run db:sync
npm run create-admin

# Option 2: Drop and recreate database manually
psql -U postgres -c "DROP DATABASE blackcross;"
psql -U postgres -c "CREATE DATABASE blackcross;"
psql -U blackcross -d blackcross -f backend/scripts/init-db.sql
npm run db:sync
```

## Production Considerations

### Security

1. **Change Default Credentials**:
   - Use strong, unique passwords for database user
   - Rotate credentials regularly
   - Store credentials in secrets management systems (AWS Secrets Manager, HashiCorp Vault)

2. **Network Security**:
   - Limit database access to application servers only
   - Use SSL/TLS for database connections
   - Enable firewall rules to restrict database port access

3. **Access Control**:
   - Follow principle of least privilege
   - Create separate users for different application components
   - Audit database access regularly

### Performance

1. **Connection Pooling**:
   - Configure appropriate pool sizes based on workload
   - Monitor connection usage and adjust as needed
   - Use connection pool monitoring tools

2. **Indexing**:
   - Review query patterns and add indexes as needed
   - Monitor slow query logs
   - Use EXPLAIN ANALYZE for query optimization

3. **Vacuuming**:
   - Ensure autovacuum is enabled and properly configured
   - Monitor table bloat and adjust settings
   - Schedule manual VACUUM FULL for critical tables during maintenance windows

### Backup and Recovery

1. **Automated Backups**:
   ```bash
   # Create backup
   pg_dump -U blackcross blackcross > backup-$(date +%Y%m%d-%H%M%S).sql

   # Restore backup
   psql -U blackcross blackcross < backup-20240101-120000.sql
   ```

2. **Point-in-Time Recovery**:
   - Enable WAL archiving
   - Configure continuous archiving
   - Test recovery procedures regularly

3. **Backup Strategy**:
   - Daily full backups
   - Hourly incremental backups
   - Retain backups for 30+ days
   - Store backups in geographically separate location

## Troubleshooting

### Connection Issues

```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# View PostgreSQL logs
docker-compose logs postgres

# Test connection from host
psql -h localhost -p 5432 -U blackcross -d blackcross

# Check connection from backend container
docker-compose exec backend psql -h postgres -U blackcross -d blackcross
```

### Extension Issues

```bash
# List installed extensions
psql -U blackcross -d blackcross -c "SELECT * FROM pg_extension;"

# Reinstall extension
psql -U blackcross -d blackcross -c "DROP EXTENSION IF EXISTS uuid-ossp; CREATE EXTENSION uuid-ossp;"
```

### Permission Issues

```bash
# Check current user permissions
psql -U blackcross -d blackcross -c "\du blackcross"

# Grant necessary permissions
psql -U postgres -d blackcross -c "GRANT ALL PRIVILEGES ON DATABASE blackcross TO blackcross;"
```

### Sequelize Sync Issues

```bash
# Enable Sequelize logging for debugging
# Edit backend/config/sequelize.ts and set logging: console.log

# Run sync with detailed output
npm run db:sync

# Check table existence
psql -U blackcross -d blackcross -c "\dt"
```

## Monitoring and Maintenance

### Health Checks

```sql
-- Check database size
SELECT pg_size_pretty(pg_database_size('blackcross'));

-- Check table sizes
SELECT schemaname, tablename,
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;

-- Check connection count
SELECT count(*) FROM pg_stat_activity;
```

### Performance Monitoring

```sql
-- Find slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Check cache hit ratio
SELECT
  sum(heap_blks_read) AS heap_read,
  sum(heap_blks_hit) AS heap_hit,
  sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)) AS cache_hit_ratio
FROM pg_statio_user_tables;
```

## References

- [PostgreSQL 17 Documentation](https://www.postgresql.org/docs/17/)
- [Sequelize Documentation](https://sequelize.org/docs/v6/)
- [Docker PostgreSQL Image](https://hub.docker.com/_/postgres)
- [Black-Cross Architecture Guide](../../CLAUDE.md)

## Support

For issues or questions:
1. Check application logs: `docker-compose logs backend`
2. Check database logs: `docker-compose logs postgres`
3. Review this README and CLAUDE.md
4. Check Sequelize model definitions in `backend/models/`
5. Verify environment variables in `backend/.env`
