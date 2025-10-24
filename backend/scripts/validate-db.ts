/**
 * Database Validation Script
 *
 * This script validates that the PostgreSQL database is properly initialized
 * with all required extensions, functions, and configurations.
 *
 * Run this script after database initialization to verify setup.
 *
 * Usage:
 *   npx ts-node backend/scripts/validate-db.ts
 */

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

interface ValidationResult {
  check: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  message: string;
  details?: unknown;
}

const results: ValidationResult[] = [];

/**
 * Add validation result to results array
 */
function addResult(check: string, status: 'PASS' | 'FAIL' | 'WARN', message: string, details?: unknown) {
  results.push({ check, status, message, details });
}

/**
 * Print validation results with color coding
 */
function printResults() {
  console.log('\n' + '='.repeat(80));
  console.log('DATABASE VALIDATION RESULTS');
  console.log('='.repeat(80) + '\n');

  let passCount = 0;
  let failCount = 0;
  let warnCount = 0;

  for (const result of results) {
    const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${icon} ${result.check}: ${result.message}`);
    if (result.details) {
      console.log(`   Details: ${JSON.stringify(result.details, null, 2)}`);
    }

    if (result.status === 'PASS') passCount++;
    if (result.status === 'FAIL') failCount++;
    if (result.status === 'WARN') warnCount++;
  }

  console.log('\n' + '='.repeat(80));
  console.log(`Total Checks: ${results.length}`);
  console.log(`Passed: ${passCount} | Failed: ${failCount} | Warnings: ${warnCount}`);
  console.log('='.repeat(80) + '\n');

  return failCount === 0;
}

/**
 * Main validation function
 */
async function validateDatabase() {
  const databaseUrl = process.env.DATABASE_URL || 'postgresql://blackcross:blackcross_secure_password@localhost:5432/blackcross';

  console.log('🔍 Starting database validation...');
  console.log(`📍 Database URL: ${databaseUrl.replace(/:[^:@]+@/, ':****@')}\n`);

  let sequelize: Sequelize | null = null;

  try {
    // ========================================
    // 1. CONNECTION TEST
    // ========================================
    console.log('1️⃣  Testing database connection...');
    sequelize = new Sequelize(databaseUrl, {
      dialect: 'postgres',
      logging: false,
    });

    try {
      await sequelize.authenticate();
      addResult('Database Connection', 'PASS', 'Successfully connected to PostgreSQL');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      addResult('Database Connection', 'FAIL', `Failed to connect: ${message}`);
      throw error; // Cannot continue without connection
    }

    // ========================================
    // 2. VERSION CHECK
    // ========================================
    console.log('2️⃣  Checking PostgreSQL version...');
    try {
      const [versionResult] = await sequelize.query<{ version: string }>('SELECT version()');
      const version = versionResult[0]?.version || 'Unknown';
      const versionMatch = version.match(/PostgreSQL (\d+\.\d+)/);
      const versionNumber = versionMatch ? parseFloat(versionMatch[1]) : 0;

      if (versionNumber >= 17) {
        addResult('PostgreSQL Version', 'PASS', `Version ${versionNumber} (meets requirement >= 17.0)`, { version });
      } else if (versionNumber >= 12) {
        addResult('PostgreSQL Version', 'WARN', `Version ${versionNumber} (recommended: >= 17.0)`, { version });
      } else {
        addResult('PostgreSQL Version', 'FAIL', `Version ${versionNumber} (minimum required: 12.0)`, { version });
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      addResult('PostgreSQL Version', 'FAIL', `Failed to check version: ${message}`);
    }

    // ========================================
    // 3. EXTENSION CHECKS
    // ========================================
    console.log('3️⃣  Validating PostgreSQL extensions...');
    const requiredExtensions = ['uuid-ossp', 'pgcrypto', 'citext', 'pg_trgm', 'unaccent'];

    for (const extName of requiredExtensions) {
      try {
        const [extResult] = await sequelize.query<{ installed: boolean }>(
          `SELECT EXISTS(SELECT 1 FROM pg_extension WHERE extname = :extName) as installed`,
          { replacements: { extName } }
        );
        const installed = extResult[0]?.installed || false;

        if (installed) {
          addResult(`Extension: ${extName}`, 'PASS', 'Installed and available');
        } else {
          addResult(`Extension: ${extName}`, 'FAIL', 'Not installed - run init-db.sql script');
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        addResult(`Extension: ${extName}`, 'FAIL', `Failed to check: ${message}`);
      }
    }

    // ========================================
    // 4. UTILITY FUNCTION CHECKS
    // ========================================
    console.log('4️⃣  Validating utility functions...');
    const requiredFunctions = [
      'trigger_set_timestamp',
      'audit_metadata',
      'normalize_ioc',
      'is_valid_ipv4',
      'is_valid_ipv6',
      'is_valid_domain',
      'is_valid_email',
    ];

    for (const funcName of requiredFunctions) {
      try {
        const [funcResult] = await sequelize.query<{ exists: boolean }>(
          `SELECT EXISTS(SELECT 1 FROM pg_proc WHERE proname = :funcName) as exists`,
          { replacements: { funcName } }
        );
        const exists = funcResult[0]?.exists || false;

        if (exists) {
          addResult(`Function: ${funcName}`, 'PASS', 'Function exists and available');
        } else {
          addResult(`Function: ${funcName}`, 'FAIL', 'Function not found - run init-db.sql script');
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        addResult(`Function: ${funcName}`, 'FAIL', `Failed to check: ${message}`);
      }
    }

    // ========================================
    // 5. TEST UTILITY FUNCTIONS
    // ========================================
    console.log('5️⃣  Testing utility functions...');

    // Test normalize_ioc
    try {
      const [iocResult] = await sequelize.query<{ normalized: string }>(
        "SELECT normalize_ioc('  TEST.COM  ') as normalized"
      );
      const normalized = iocResult[0]?.normalized;
      if (normalized === 'test.com') {
        addResult('normalize_ioc() Test', 'PASS', 'Function works correctly');
      } else {
        addResult('normalize_ioc() Test', 'FAIL', `Unexpected result: ${normalized}`);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      addResult('normalize_ioc() Test', 'FAIL', `Function test failed: ${message}`);
    }

    // Test is_valid_ipv4
    try {
      const [ipv4Result] = await sequelize.query<{ valid: boolean }>(
        "SELECT is_valid_ipv4('192.168.1.1') as valid"
      );
      const valid = ipv4Result[0]?.valid;
      if (valid === true) {
        addResult('is_valid_ipv4() Test', 'PASS', 'Function works correctly');
      } else {
        addResult('is_valid_ipv4() Test', 'FAIL', `Unexpected result: ${valid}`);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      addResult('is_valid_ipv4() Test', 'FAIL', `Function test failed: ${message}`);
    }

    // Test is_valid_email
    try {
      const [emailResult] = await sequelize.query<{ valid: boolean }>(
        "SELECT is_valid_email('test@example.com') as valid"
      );
      const valid = emailResult[0]?.valid;
      if (valid === true) {
        addResult('is_valid_email() Test', 'PASS', 'Function works correctly');
      } else {
        addResult('is_valid_email() Test', 'FAIL', `Unexpected result: ${valid}`);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      addResult('is_valid_email() Test', 'FAIL', `Function test failed: ${message}`);
    }

    // ========================================
    // 6. DOMAIN TYPE CHECKS
    // ========================================
    console.log('6️⃣  Validating custom domain types...');
    const requiredDomains = [
      'severity_level',
      'incident_status',
      'user_role',
      'priority_level',
    ];

    for (const domainName of requiredDomains) {
      try {
        const [domainResult] = await sequelize.query<{ exists: boolean }>(
          `SELECT EXISTS(SELECT 1 FROM pg_type WHERE typname = :domainName) as exists`,
          { replacements: { domainName } }
        );
        const exists = domainResult[0]?.exists || false;

        if (exists) {
          addResult(`Domain Type: ${domainName}`, 'PASS', 'Domain type exists');
        } else {
          addResult(`Domain Type: ${domainName}`, 'FAIL', 'Domain type not found - run init-db.sql script');
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        addResult(`Domain Type: ${domainName}`, 'FAIL', `Failed to check: ${message}`);
      }
    }

    // ========================================
    // 7. CONFIGURATION CHECKS
    // ========================================
    console.log('7️⃣  Checking database configuration...');

    // Check timezone
    try {
      const [tzResult] = await sequelize.query<{ timezone: string }>(
        "SELECT current_setting('timezone') as timezone"
      );
      const timezone = tzResult[0]?.timezone;
      if (timezone === 'UTC') {
        addResult('Timezone Configuration', 'PASS', 'Timezone set to UTC');
      } else {
        addResult('Timezone Configuration', 'WARN', `Timezone is ${timezone}, recommended: UTC`);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      addResult('Timezone Configuration', 'FAIL', `Failed to check timezone: ${message}`);
    }

    // Check max_connections
    try {
      const [connResult] = await sequelize.query<{ max_connections: string }>(
        "SELECT current_setting('max_connections') as max_connections"
      );
      const maxConnections = parseInt(connResult[0]?.max_connections || '0');
      if (maxConnections >= 100) {
        addResult('Max Connections', 'PASS', `Max connections: ${maxConnections}`);
      } else {
        addResult('Max Connections', 'WARN', `Max connections: ${maxConnections} (recommended: >= 100)`);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      addResult('Max Connections', 'FAIL', `Failed to check max_connections: ${message}`);
    }

    // ========================================
    // 8. SCHEMA AND PERMISSIONS
    // ========================================
    console.log('8️⃣  Checking schema and permissions...');

    // Check public schema exists
    try {
      const [schemaResult] = await sequelize.query<{ exists: boolean }>(
        "SELECT EXISTS(SELECT 1 FROM pg_namespace WHERE nspname = 'public') as exists"
      );
      const exists = schemaResult[0]?.exists || false;

      if (exists) {
        addResult('Public Schema', 'PASS', 'Public schema exists');
      } else {
        addResult('Public Schema', 'FAIL', 'Public schema not found');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      addResult('Public Schema', 'FAIL', `Failed to check schema: ${message}`);
    }

    // Check user permissions
    try {
      const [permResult] = await sequelize.query<{ has_create_privilege: boolean }>(
        "SELECT has_schema_privilege('blackcross', 'public', 'CREATE') as has_create_privilege"
      );
      const hasCreatePrivilege = permResult[0]?.has_create_privilege || false;

      if (hasCreatePrivilege) {
        addResult('User Permissions', 'PASS', 'User has CREATE privilege on public schema');
      } else {
        addResult('User Permissions', 'FAIL', 'User lacks CREATE privilege on public schema');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      addResult('User Permissions', 'FAIL', `Failed to check permissions: ${message}`);
    }

    // ========================================
    // 9. FULL-TEXT SEARCH CONFIGURATION
    // ========================================
    console.log('9️⃣  Checking full-text search configuration...');

    try {
      const [ftsResult] = await sequelize.query<{ exists: boolean }>(
        "SELECT EXISTS(SELECT 1 FROM pg_ts_config WHERE cfgname = 'threat_search') as exists"
      );
      const exists = ftsResult[0]?.exists || false;

      if (exists) {
        addResult('FTS Configuration', 'PASS', 'threat_search configuration exists');
      } else {
        addResult('FTS Configuration', 'FAIL', 'threat_search configuration not found - run init-db.sql script');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      addResult('FTS Configuration', 'FAIL', `Failed to check FTS config: ${message}`);
    }

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`\n❌ Critical error during validation: ${message}\n`);
  } finally {
    // Close database connection
    if (sequelize) {
      await sequelize.close();
    }
  }

  // Print results and exit
  const success = printResults();

  if (success) {
    console.log('✅ Database validation completed successfully!\n');
    process.exit(0);
  } else {
    console.log('❌ Database validation failed. Please review the errors above.\n');
    console.log('💡 To fix issues, run: docker-compose down -v && docker-compose up -d postgres\n');
    process.exit(1);
  }
}

// Run validation
validateDatabase().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error(`\n❌ Validation script failed: ${message}\n`);
  process.exit(1);
});
