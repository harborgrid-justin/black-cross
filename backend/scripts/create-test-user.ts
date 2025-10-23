/**
 * Create test user for Cypress tests
 * Creates user with credentials matching cypress/fixtures/users.json
 */

import bcrypt from 'bcrypt';
import { initializeSequelize, closeConnection } from '../config/sequelize';
import User from '../models/User';

async function createTestUser() {
  try {
    console.log('🔧 Creating test user for Cypress tests...\n');

    // Initialize Sequelize
    initializeSequelize();
    console.log('✅ Sequelize initialized\n');

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email: 'admin@blackcross.com' } });

    if (existingUser) {
      console.log('✅ Test user already exists');
      console.log('   Email: admin@blackcross.com');
      console.log('   Password: Admin123!\n');
      await closeConnection();
      process.exit(0);
    }

    // Create password hash
    const password = await bcrypt.hash('Admin123!', 10);

    // Create user
    const user = await User.create({
      email: 'admin@blackcross.com',
      username: 'cypress_admin',
      password,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isActive: true,
      lastLogin: new Date(),
    });

    console.log('✅ Test user created successfully');
    console.log('   Email: admin@blackcross.com');
    console.log('   Password: Admin123!');
    console.log(`   ID: ${user.id}\n`);

    // Close connection
    await closeConnection();
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to create test user:', error);
    process.exit(1);
  }
}

createTestUser();
