/**
 * Shared Database Connection Utility
 * Provides access to the centralized database connections for modules
 */

import type { Connection } from 'mongoose';
import dbManager from '../config/database';

/**
 * Get the shared MongoDB connection
 * This should be used instead of creating new connections in each module
 */
function getMongoConnection(): Connection | null {
  if (!dbManager.isMongoDBConnected()) {
    throw new Error('MongoDB is not connected. Ensure database manager is initialized.');
  }
  return dbManager.getMongoConnection();
}

/**
 * Check if MongoDB is connected
 */
function isMongoConnected(): boolean {
  return dbManager.isMongoDBConnected();
}

export {
  getMongoConnection,
  isMongoConnected,
};
