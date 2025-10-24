/**
 * Database Synchronization Script
 *
 * This script synchronizes Sequelize models with the PostgreSQL database schema.
 * It provides a safe, automated way to apply model changes to the database without
 * manually writing SQL migrations.
 *
 * @module scripts/sync-database
 *
 * @remarks
 * **Synchronization Modes:**
 * - **Alter Mode (Default)**: Non-destructive synchronization that adds new columns/tables
 *   and modifies existing columns while preserving data. Safe for development and production.
 * - **Force Mode**: DESTRUCTIVE mode that drops all tables and recreates them from scratch.
 *   **WARNING**: This will DELETE ALL DATA. Use only in development environments.
 *
 * **Usage:**
 * ```bash
 * # Safe synchronization (default - recommended for production)
 * npm run db:sync
 * # or directly: tsx scripts/sync-database.ts
 *
 * # Force synchronization (DANGEROUS - development only)
 * npm run db:sync -- --force
 * # or directly: tsx scripts/sync-database.ts --force
 * ```
 *
 * **Process Flow:**
 * 1. Load environment configuration from .env file
 * 2. Initialize Sequelize with all registered models
 * 3. Test database connection
 * 4. Synchronize models with database schema
 * 5. Display synchronization summary
 * 6. Close database connection gracefully
 *
 * **Error Handling:**
 * - Environment configuration errors (missing DATABASE_URL)
 * - Database connection failures
 * - Model synchronization errors
 * - Graceful cleanup on errors
 *
 * @example
 * ```typescript
 * // Run with default alter mode (safe)
 * $ npm run db:sync
 * // Output:
 * // ✅ Sequelize initialized with 12 models
 * // ✅ PostgreSQL connection established successfully
 * // ✅ Database models synced successfully
 * // 🎉 Database synchronization completed successfully!
 *
 * // Run with force mode (destructive)
 * $ npm run db:sync -- --force
 * // Output:
 * // ⚠️  WARNING: Force mode will DROP ALL TABLES and recreate them!
 * // ⚠️  ALL DATA WILL BE LOST. This should only be used in development.
 * // ...
 * ```
 *
 * @see {@link ../config/sequelize} for Sequelize configuration
 * @see {@link ../models} for model definitions
 */

import { initializeSequelize, syncDatabase, closeConnection } from '../config/sequelize';

/**
 * ANSI color codes for terminal output formatting.
 *
 * These codes provide colored console output for better readability
 * and visual distinction between different message types.
 *
 * @constant
 * @private
 */
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
} as const;

/**
 * Type guard to check if an error is an Error instance.
 *
 * TypeScript's catch blocks type errors as `unknown` for safety.
 * This type guard narrows the type to `Error` for safe property access.
 *
 * @param error - The unknown error value from a catch block
 * @returns True if the error is an Error instance with a message property
 *
 * @example
 * ```typescript
 * try {
 *   throw new Error('Something went wrong');
 * } catch (error: unknown) {
 *   if (isError(error)) {
 *     console.error(error.message); // Type-safe access to message
 *   }
 * }
 * ```
 */
function isError(error: unknown): error is Error {
  return error instanceof Error;
}

/**
 * Parse command-line arguments to determine synchronization mode.
 *
 * Checks for the `--force` flag which enables destructive synchronization.
 * Any other arguments are ignored to prevent accidental misuse.
 *
 * @returns Object containing the force flag boolean
 *
 * @example
 * ```typescript
 * // Command: tsx scripts/sync-database.ts --force
 * const args = parseArguments();
 * console.log(args.force); // true
 *
 * // Command: tsx scripts/sync-database.ts
 * const args = parseArguments();
 * console.log(args.force); // false
 * ```
 */
function parseArguments(): { force: boolean } {
  const args = process.argv.slice(2);
  return {
    force: args.includes('--force'),
  };
}

/**
 * Display a formatted warning banner for force mode.
 *
 * Provides visual emphasis for the destructive nature of force synchronization
 * to prevent accidental data loss. Uses bright yellow/red colors and box
 * drawing characters for maximum visibility.
 *
 * @private
 */
function displayForceWarning(): void {
  console.log(`
${colors.yellow}${colors.bright}╔═══════════════════════════════════════════════════════════════╗
║                         ⚠️  WARNING ⚠️                          ║
║                                                               ║
║  Force mode will DROP ALL TABLES and recreate them!          ║
║  ALL DATA WILL BE LOST. This should only be used in          ║
║  development environments.                                    ║
║                                                               ║
║  If you're sure you want to proceed, the script will         ║
║  continue in 3 seconds. Press Ctrl+C to cancel.              ║
╚═══════════════════════════════════════════════════════════════╝${colors.reset}
`);
}

/**
 * Display a formatted success summary after synchronization.
 *
 * Provides a clear visual confirmation that the operation completed successfully
 * with timing information and next steps.
 *
 * @param mode - The synchronization mode used ('alter' or 'force')
 * @param startTime - The timestamp when synchronization began
 * @private
 */
function displaySuccessSummary(mode: string, startTime: number): void {
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`
${colors.green}${colors.bright}╔═══════════════════════════════════════════════════════════════╗
║              🎉 Database Synchronization Complete 🎉          ║
╚═══════════════════════════════════════════════════════════════╝${colors.reset}

${colors.cyan}Mode:${colors.reset}     ${mode === 'force' ? `${colors.red}Force (destructive)${colors.reset}` : `${colors.green}Alter (safe)${colors.reset}`}
${colors.cyan}Duration:${colors.reset} ${duration}s
${colors.cyan}Status:${colors.reset}   ${colors.green}✅ Success${colors.reset}

${colors.bright}Next steps:${colors.reset}
${mode === 'force' ? `  • Run ${colors.cyan}npm run create-admin${colors.reset} to create an admin user
  • Run ${colors.cyan}npm run db:seed${colors.reset} to populate initial data` : `  • Your database schema is now up to date
  • You can start the application with ${colors.cyan}npm run dev${colors.reset}`}
`);
}

/**
 * Sleep for a specified number of milliseconds.
 *
 * Used to provide a brief delay before executing force mode, giving the user
 * time to cancel if they launched the command accidentally.
 *
 * @param ms - Number of milliseconds to sleep
 * @returns Promise that resolves after the specified delay
 *
 * @example
 * ```typescript
 * console.log('Starting...');
 * await sleep(3000);
 * console.log('3 seconds later');
 * ```
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => { setTimeout(resolve, ms); });
}

/**
 * Validate environment configuration.
 *
 * Ensures that critical environment variables are set before attempting
 * database operations. Provides helpful error messages if configuration
 * is missing or invalid.
 *
 * @throws {Error} If DATABASE_URL is not configured
 *
 * @example
 * ```typescript
 * try {
 *   validateEnvironment();
 *   console.log('Environment is valid');
 * } catch (error) {
 *   console.error('Configuration error:', error.message);
 *   process.exit(1);
 * }
 * ```
 */
function validateEnvironment(): void {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL is not configured. Please set it in your .env file.\n' +
      'Example: DATABASE_URL=postgresql://username:password@localhost:5432/blackcross'
    );
  }
}

/**
 * Main execution function for database synchronization.
 *
 * Orchestrates the complete synchronization workflow including:
 * - Command-line argument parsing
 * - Environment validation
 * - Database connection initialization
 * - Model synchronization (alter or force mode)
 * - Error handling and cleanup
 * - Exit code management
 *
 * **Exit Codes:**
 * - 0: Success - synchronization completed without errors
 * - 1: Failure - configuration, connection, or synchronization error occurred
 *
 * @async
 * @returns Promise that resolves when synchronization completes or rejects on error
 *
 * @example
 * ```typescript
 * // Script execution
 * main()
 *   .then(() => process.exit(0))
 *   .catch((error) => {
 *     console.error('Fatal error:', error);
 *     process.exit(1);
 *   });
 * ```
 */
async function main(): Promise<void> {
  const startTime = Date.now();
  const { force } = parseArguments();

  try {
    // Display banner
    console.log(`
${colors.blue}${colors.bright}╔═══════════════════════════════════════════════════════════════╗
║           Black-Cross Database Synchronization Tool          ║
╚═══════════════════════════════════════════════════════════════╝${colors.reset}
`);

    // Validate environment
    console.log(`${colors.cyan}[1/5]${colors.reset} Validating environment configuration...`);
    validateEnvironment();
    console.log(`      ${colors.green}✅ Environment validated${colors.reset}`);

    // Warn about force mode
    if (force) {
      displayForceWarning();
      await sleep(3000);
    }

    // Initialize Sequelize
    console.log(`\n${colors.cyan}[2/5]${colors.reset} Initializing Sequelize ORM...`);
    const sequelize = initializeSequelize();
    const modelCount = Object.keys(sequelize.models).length;
    console.log(`      ${colors.green}✅ Sequelize initialized with ${modelCount} models${colors.reset}`);

    // Test connection
    console.log(`\n${colors.cyan}[3/5]${colors.reset} Testing database connection...`);
    await sequelize.authenticate();
    console.log(`      ${colors.green}✅ PostgreSQL connection established successfully${colors.reset}`);

    // Sync database
    console.log(`\n${colors.cyan}[4/5]${colors.reset} Synchronizing database schema...`);
    console.log(`      ${colors.bright}Mode:${colors.reset} ${force ? `${colors.red}Force (will drop all tables)${colors.reset}` : `${colors.green}Alter (safe migration)${colors.reset}`}`);
    await syncDatabase(force);
    console.log(`      ${colors.green}✅ Database models ${force ? 'recreated' : 'synced'} successfully${colors.reset}`);

    // Close connection
    console.log(`\n${colors.cyan}[5/5]${colors.reset} Closing database connection...`);
    await closeConnection();
    console.log(`      ${colors.green}✅ Connection closed gracefully${colors.reset}`);

    // Display success summary
    displaySuccessSummary(force ? 'force' : 'alter', startTime);

    process.exit(0);
  } catch (error: unknown) {
    console.error(`\n${colors.red}${colors.bright}╔═══════════════════════════════════════════════════════════════╗
║                  ❌ Database Sync Failed ❌                    ║
╚═══════════════════════════════════════════════════════════════╝${colors.reset}\n`);

    if (isError(error)) {
      console.error(`${colors.red}Error:${colors.reset} ${error.message}\n`);

      // Provide helpful troubleshooting tips based on error type
      if (error.message.includes('DATABASE_URL')) {
        console.error(`${colors.yellow}Troubleshooting:${colors.reset}
  1. Check if the .env file exists in the backend directory
  2. Verify DATABASE_URL is set correctly
  3. Example: DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
`);
      } else if (error.message.includes('connect') || error.message.includes('ECONNREFUSED')) {
        console.error(`${colors.yellow}Troubleshooting:${colors.reset}
  1. Ensure PostgreSQL is running (docker-compose up -d postgres)
  2. Check if the database host and port are correct
  3. Verify firewall rules allow database connections
  4. Test connection: psql -h localhost -U postgres -d blackcross
`);
      } else if (error.message.includes('authentication')) {
        console.error(`${colors.yellow}Troubleshooting:${colors.reset}
  1. Verify database username and password in DATABASE_URL
  2. Check PostgreSQL user permissions
  3. Ensure the database exists (createdb blackcross)
`);
      } else {
        console.error(`${colors.yellow}Troubleshooting:${colors.reset}
  1. Check the error message above for specific details
  2. Verify all models are properly defined
  3. Review the database logs for additional information
  4. Try running with --force flag (WARNING: deletes all data)
`);
      }
    } else {
      console.error(`${colors.red}Unknown error:${colors.reset} ${String(error)}\n`);
    }

    // Attempt to close connection on error
    try {
      await closeConnection();
    } catch (closeError) {
      // Ignore close errors during error handling
    }

    process.exit(1);
  }
}

// Execute main function
main();
