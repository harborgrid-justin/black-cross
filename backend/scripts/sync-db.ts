/**
 * Database Sync Script
 * Synchronize Sequelize models with PostgreSQL database
 */

import { initializeSequelize, syncDatabase, closeConnection } from '../config/sequelize';

async function main() {
  try {
    console.log('🔄 Starting database synchronization...');

    // Initialize Sequelize
    initializeSequelize();
    console.log('✅ Sequelize initialized');

    // Sync database (alter mode - non-destructive)
    await syncDatabase(false);
    console.log('✅ Database synchronized successfully');

    // Close connection
    await closeConnection();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database sync failed:', error);
    process.exit(1);
  }
}

main();
