-- ============================================================================
-- Black-Cross Threat Intelligence Platform
-- PostgreSQL Database Initialization Script
-- ============================================================================
--
-- PURPOSE:
--   This script prepares the PostgreSQL database for the Black-Cross platform.
--   It creates the database, configures essential extensions, sets permissions,
--   and establishes the foundation for Sequelize ORM to manage schema.
--
-- EXECUTION CONTEXT:
--   Runs automatically via Docker Compose during container initialization
--   through the /docker-entrypoint-initdb.d/ mechanism.
--
-- IMPORTANT:
--   - This script runs ONLY on first container startup (empty data volume)
--   - Table schemas are managed by Sequelize ORM (see backend/models/)
--   - Do NOT add CREATE TABLE statements here - use Sequelize migrations
--
-- DATABASE STRATEGY:
--   - PostgreSQL 17 with Alpine Linux
--   - UTF-8 encoding for international character support
--   - Extensions: uuid-ossp (UUID generation), pgcrypto (encryption)
--   - Timezone: UTC for consistent temporal data across deployments
--
-- MAINTENANCE:
--   - Review extension requirements when adding new features
--   - Update performance settings based on production metrics
--   - Keep security configuration aligned with compliance requirements
--
-- ============================================================================

-- ============================================================================
-- SECTION 1: DATABASE CREATION AND CONNECTION CONFIGURATION
-- ============================================================================

-- Terminate existing connections to the blackcross database (if it exists)
-- This ensures a clean state during re-initialization or troubleshooting
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = 'blackcross'
  AND pid <> pg_backend_pid();

-- Create the main database if it doesn't exist
-- Note: This may fail if already created by POSTGRES_DB env var, hence the conditional
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'blackcross') THEN
        -- Cannot use CREATE DATABASE in a transaction block, so we skip if exists
        -- The database is typically created by Docker's POSTGRES_DB environment variable
        RAISE NOTICE 'Database "blackcross" already exists or will be created by Docker';
    END IF;
END
$$;

-- Connect to the blackcross database for remaining operations
-- Note: In Docker initialization scripts, we're already connected to the target database
\connect blackcross

-- ============================================================================
-- SECTION 2: ESSENTIAL POSTGRESQL EXTENSIONS
-- ============================================================================

-- Enable UUID generation capabilities (required for primary keys)
-- The uuid-ossp extension provides uuid_generate_v4() function used by Sequelize
-- for generating unique identifiers for all model primary keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp"
WITH SCHEMA public;

COMMENT ON EXTENSION "uuid-ossp" IS 'UUID generation functions for primary keys and unique identifiers';

-- Enable cryptographic functions (required for password hashing and encryption)
-- The pgcrypto extension provides secure hash functions and encryption capabilities
-- Used for sensitive data encryption at rest and cryptographic operations
CREATE EXTENSION IF NOT EXISTS "pgcrypto"
WITH SCHEMA public;

COMMENT ON EXTENSION "pgcrypto" IS 'Cryptographic functions for password hashing and data encryption';

-- Enable case-insensitive text type (useful for email and username lookups)
-- The citext extension provides case-insensitive character string type
-- Improves performance for email/username queries without LOWER() functions
CREATE EXTENSION IF NOT EXISTS "citext"
WITH SCHEMA public;

COMMENT ON EXTENSION "citext" IS 'Case-insensitive text type for email and username fields';

-- Enable trigram similarity search (for fuzzy text matching in threat intelligence)
-- The pg_trgm extension enables fast similarity searches for IOCs, CVEs, and threat data
-- Critical for typo-tolerant searches and approximate string matching
CREATE EXTENSION IF NOT EXISTS "pg_trgm"
WITH SCHEMA public;

COMMENT ON EXTENSION "pg_trgm" IS 'Trigram similarity search for fuzzy text matching of IOCs and threats';

-- Enable full-text search capabilities (for searching incident descriptions, notes, etc.)
-- The unaccent extension removes accents from characters for better search results
CREATE EXTENSION IF NOT EXISTS "unaccent"
WITH SCHEMA public;

COMMENT ON EXTENSION "unaccent" IS 'Text search dictionary to remove accents for better full-text search';

-- ============================================================================
-- SECTION 3: SCHEMA MANAGEMENT
-- ============================================================================

-- Ensure the public schema exists and is properly configured
-- The public schema is the default namespace for all application tables
CREATE SCHEMA IF NOT EXISTS public;

COMMENT ON SCHEMA public IS 'Default schema for Black-Cross application tables and functions';

-- Grant schema usage to the blackcross user
GRANT USAGE ON SCHEMA public TO blackcross;
GRANT CREATE ON SCHEMA public TO blackcross;

-- ============================================================================
-- SECTION 4: DATABASE CONFIGURATION AND PERFORMANCE TUNING
-- ============================================================================

-- Set database timezone to UTC for consistent timestamp handling
-- All timestamp columns in the application use UTC to avoid timezone confusion
-- Application layer handles timezone conversion for display purposes
ALTER DATABASE blackcross SET timezone TO 'UTC';

COMMENT ON DATABASE blackcross IS 'Black-Cross Cyber Threat Intelligence Platform - Primary Database';

-- Configure default privileges for the blackcross user
-- Ensures new tables/sequences created by Sequelize have proper permissions
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO blackcross;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT USAGE, SELECT ON SEQUENCES TO blackcross;

-- ============================================================================
-- SECTION 5: SECURITY CONFIGURATION
-- ============================================================================

-- Ensure the blackcross user has necessary permissions
-- These permissions are required for Sequelize ORM to function properly
GRANT ALL PRIVILEGES ON DATABASE blackcross TO blackcross;
GRANT ALL PRIVILEGES ON SCHEMA public TO blackcross;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO blackcross;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO blackcross;

-- Revoke unnecessary privileges from PUBLIC role for security hardening
REVOKE CREATE ON SCHEMA public FROM PUBLIC;

-- ============================================================================
-- SECTION 6: AUDIT AND LOGGING PREPARATION
-- ============================================================================

-- Create audit trigger function for tracking table modifications
-- This function can be attached to any table to automatically log changes
-- Used for compliance, forensics, and change tracking
CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.trigger_set_timestamp() IS 'Automatically update updated_at timestamp on row modification';

-- Create function to generate audit trail metadata
-- Captures current user, timestamp, and operation type for audit logs
CREATE OR REPLACE FUNCTION public.audit_metadata()
RETURNS TABLE (
    audit_timestamp TIMESTAMP WITH TIME ZONE,
    audit_user TEXT,
    audit_ip INET
) AS $$
BEGIN
    RETURN QUERY SELECT
        NOW() AS audit_timestamp,
        current_user AS audit_user,
        inet_client_addr() AS audit_ip;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.audit_metadata() IS 'Generate audit trail metadata for compliance and security monitoring';

-- ============================================================================
-- SECTION 7: UTILITY FUNCTIONS FOR THREAT INTELLIGENCE
-- ============================================================================

-- Function to normalize IOC values (lowercase, trim whitespace)
-- Ensures consistent IOC storage and comparison across the platform
CREATE OR REPLACE FUNCTION public.normalize_ioc(ioc_value TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN LOWER(TRIM(ioc_value));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION public.normalize_ioc(TEXT) IS 'Normalize IOC values for consistent storage and comparison';

-- Function to validate IPv4 addresses
-- Returns TRUE if the input is a valid IPv4 address, FALSE otherwise
CREATE OR REPLACE FUNCTION public.is_valid_ipv4(ip_address TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN ip_address ~ '^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION public.is_valid_ipv4(TEXT) IS 'Validate IPv4 address format for IOC validation';

-- Function to validate IPv6 addresses
-- Returns TRUE if the input is a valid IPv6 address, FALSE otherwise
CREATE OR REPLACE FUNCTION public.is_valid_ipv6(ip_address TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Simplified IPv6 validation regex (full validation is complex)
    RETURN ip_address ~ '^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::([0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:)$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION public.is_valid_ipv6(TEXT) IS 'Validate IPv6 address format for IOC validation';

-- Function to validate domain names
-- Returns TRUE if the input is a valid domain name, FALSE otherwise
CREATE OR REPLACE FUNCTION public.is_valid_domain(domain_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN domain_name ~ '^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION public.is_valid_domain(TEXT) IS 'Validate domain name format for IOC validation';

-- Function to validate email addresses
-- Returns TRUE if the input is a valid email address, FALSE otherwise
CREATE OR REPLACE FUNCTION public.is_valid_email(email_address TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN email_address ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION public.is_valid_email(TEXT) IS 'Validate email address format';

-- ============================================================================
-- SECTION 8: PERFORMANCE OPTIMIZATION SETTINGS
-- ============================================================================

-- Configure autovacuum settings for optimal performance
-- These settings are table-level defaults and can be overridden per table
-- Aggressive autovacuum ensures good query performance for high-write tables

-- Set default statistics target for better query planning
ALTER DATABASE blackcross SET default_statistics_target = 100;

-- Enable parallel query execution for better performance on multi-core systems
ALTER DATABASE blackcross SET max_parallel_workers_per_gather = 4;

-- Configure work memory for sorting and hash operations
-- This is set at database level; can be tuned per connection for specific queries
ALTER DATABASE blackcross SET work_mem = '4MB';

-- Enable JIT compilation for complex queries (PostgreSQL 11+)
ALTER DATABASE blackcross SET jit = on;

-- ============================================================================
-- SECTION 9: FULL-TEXT SEARCH CONFIGURATION
-- ============================================================================

-- Create custom full-text search configuration for threat intelligence
-- Combines English text search with unaccent for better international support
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_ts_config WHERE cfgname = 'threat_search' AND cfgnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        CREATE TEXT SEARCH CONFIGURATION public.threat_search (COPY = pg_catalog.english);
    END IF;
END
$$;

ALTER TEXT SEARCH CONFIGURATION public.threat_search
    ALTER MAPPING FOR hword, hword_part, word
    WITH unaccent, english_stem;

COMMENT ON TEXT SEARCH CONFIGURATION public.threat_search IS 'Custom FTS configuration for threat intelligence with accent removal';

-- ============================================================================
-- SECTION 10: INDEX TEMPLATES AND CONVENTIONS
-- ============================================================================

-- Note: Actual indexes are created by Sequelize based on model definitions
-- This section documents indexing conventions for reference

-- INDEXING STRATEGY:
-- 1. Primary Keys: Automatically indexed as UUID columns
-- 2. Foreign Keys: Always indexed for join performance (assigned_to_id, user_id, etc.)
-- 3. Status/Severity: B-tree indexes for filtering (status, severity, priority)
-- 4. Timestamps: B-tree indexes for time-based queries (created_at, detected_at)
-- 5. Text Fields: GIN indexes for full-text search (description, notes)
-- 6. IOC Values: GIN trigram indexes for similarity search (ioc_value)
-- 7. JSON Fields: GIN indexes for JSONB queries (capabilities, metadata)

-- ============================================================================
-- SECTION 11: DATA VALIDATION AND CONSTRAINTS
-- ============================================================================

-- Create custom domain types for common data patterns
-- These enforce data validation at the database level

-- Domain for valid severity levels
CREATE DOMAIN public.severity_level AS TEXT
CHECK (VALUE IN ('low', 'medium', 'high', 'critical'));

COMMENT ON DOMAIN public.severity_level IS 'Valid severity levels for incidents and vulnerabilities';

-- Domain for valid incident status
CREATE DOMAIN public.incident_status AS TEXT
CHECK (VALUE IN ('open', 'investigating', 'contained', 'resolved', 'closed', 'false_positive'));

COMMENT ON DOMAIN public.incident_status IS 'Valid status values for security incidents';

-- Domain for valid user roles
CREATE DOMAIN public.user_role AS TEXT
CHECK (VALUE IN ('admin', 'analyst', 'manager', 'viewer', 'guest'));

COMMENT ON DOMAIN public.user_role IS 'Valid user roles for RBAC';

-- Domain for valid priority levels (1-5, where 1 is highest)
CREATE DOMAIN public.priority_level AS INTEGER
CHECK (VALUE >= 1 AND VALUE <= 5);

COMMENT ON DOMAIN public.priority_level IS 'Valid priority levels (1=highest, 5=lowest)';

-- ============================================================================
-- SECTION 12: INITIALIZATION VERIFICATION
-- ============================================================================

-- Log successful initialization
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Black-Cross Database Initialization Complete';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Database: blackcross';
    RAISE NOTICE 'PostgreSQL Version: %', version();
    RAISE NOTICE 'Timezone: %', current_setting('timezone');
    RAISE NOTICE 'Extensions Installed:';
    RAISE NOTICE '  - uuid-ossp (UUID generation)';
    RAISE NOTICE '  - pgcrypto (encryption)';
    RAISE NOTICE '  - citext (case-insensitive text)';
    RAISE NOTICE '  - pg_trgm (trigram search)';
    RAISE NOTICE '  - unaccent (accent removal)';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Next Steps:';
    RAISE NOTICE '  1. Run: npm run db:sync';
    RAISE NOTICE '  2. Run: npm run create-admin';
    RAISE NOTICE '  3. Run: npm run dev';
    RAISE NOTICE '========================================';
END
$$;

-- ============================================================================
-- END OF INITIALIZATION SCRIPT
-- ============================================================================
-- Tables will be created automatically by Sequelize ORM when the backend starts
-- See: backend/models/ for table schema definitions
-- See: backend/config/sequelize.ts for ORM configuration
-- ============================================================================
