/**
 * Test Database Connection Script
 * Test Sequelize connection to Neon PostgreSQL
 */

import { initializeSequelize, testConnection, closeConnection } from '../config/sequelize';

async function main() {
  try {
    console.log('🔄 Testing database connection...\n');
    
    // Initialize Sequelize
    const sequelize = initializeSequelize();
    console.log('✅ Sequelize initialized\n');

    // Test connection
    const isConnected = await testConnection();
    
    if (isConnected) {
      console.log('\n✅ Connection test successful!');
      console.log('📊 Database:', sequelize.config.database);
      console.log('🌐 Host:', sequelize.config.host);
    } else {
      console.log('\n❌ Connection test failed');
      process.exit(1);
    }

    // Close connection
    await closeConnection();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Connection test error:', error);
    process.exit(1);
  }
}

main();
