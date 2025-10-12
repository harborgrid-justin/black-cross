/**
 * Sequelize Configuration
 * PostgreSQL database connection setup using Sequelize
 */

import { Sequelize } from 'sequelize-typescript';
import config from './index';
import { models } from '../models';

let sequelizeInstance: Sequelize | null = null;

/**
 * Initialize Sequelize instance
 */
export function initializeSequelize(): Sequelize {
  if (sequelizeInstance) {
    return sequelizeInstance;
  }

  const dbUrl = config.database.postgresql.url;

  sequelizeInstance = new Sequelize(dbUrl, {
    dialect: 'postgres',
    logging: config.env === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 2,
      acquire: 30000,
      idle: 10000,
    },
    dialectOptions: {
      ssl: dbUrl.includes('sslmode=require') ? {
        require: true,
        rejectUnauthorized: false,
      } : false,
    },
    models,
  });

  return sequelizeInstance;
}

/**
 * Get Sequelize instance
 */
export function getSequelize(): Sequelize {
  if (!sequelizeInstance) {
    throw new Error('Sequelize not initialized. Call initializeSequelize() first.');
  }
  return sequelizeInstance;
}

/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    const sequelize = getSequelize();
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connection established successfully');
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to PostgreSQL:', error);
    return false;
  }
}

/**
 * Sync database models
 * @param force - If true, drops tables before recreating them (DANGEROUS)
 */
export async function syncDatabase(force: boolean = false): Promise<void> {
  try {
    const sequelize = getSequelize();
    await sequelize.sync({ force, alter: !force });
    console.log(`✅ Database models ${force ? 'recreated' : 'synced'} successfully`);
  } catch (error) {
    console.error('❌ Error syncing database:', error);
    throw error;
  }
}

/**
 * Close database connection
 */
export async function closeConnection(): Promise<void> {
  try {
    if (sequelizeInstance) {
      await sequelizeInstance.close();
      sequelizeInstance = null;
      console.log('✅ PostgreSQL connection closed');
    }
  } catch (error) {
    console.error('❌ Error closing PostgreSQL connection:', error);
    throw error;
  }
}

export default {
  initializeSequelize,
  getSequelize,
  testConnection,
  syncDatabase,
  closeConnection,
};
