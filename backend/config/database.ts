/**
 * Centralized Database Connection Manager
 * Manages all database connections for the Black-Cross platform
 */

import mongoose from 'mongoose';
import type { Connection } from 'mongoose';
import type { Sequelize } from 'sequelize-typescript';
import { initializeSequelize, testConnection as testSequelizeConnection, syncDatabase } from './sequelize';
import config from './index';

class DatabaseManager {
  private mongoConnection: Connection | null = null;
  private isMongoConnected = false;
  private sequelizeInstance: Sequelize | null = null;
  private isSequelizeConnected = false;

  /**
   * Initialize MongoDB connection
   */
  async connectMongoDB(): Promise<Connection | null> {
    if (this.isMongoConnected) {
      return this.mongoConnection;
    }

    try {
      console.log('🔌 Connecting to MongoDB...');

      await mongoose.connect(config.database.mongodb.uri, {
        maxPoolSize: config.database.mongodb.options.maxPoolSize,
        minPoolSize: config.database.mongodb.options.minPoolSize,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      this.mongoConnection = mongoose.connection;
      this.isMongoConnected = true;
      console.log('✅ MongoDB connected successfully');

      // Handle connection events
      mongoose.connection.on('error', (err: Error) => {
        console.error('❌ MongoDB connection error:', err.message);
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️  MongoDB disconnected');
        this.isMongoConnected = false;
        this.mongoConnection = null;
      });

      mongoose.connection.on('reconnected', () => {
        console.log('🔄 MongoDB reconnected');
        this.isMongoConnected = true;
      });

      return this.mongoConnection;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.warn('⚠️  MongoDB connection failed (optional service):', errorMessage);
      console.log('ℹ️  Some features may be limited without MongoDB. You can start MongoDB later if needed.');
      this.isMongoConnected = false;
      this.mongoConnection = null;
      // Don't throw error - make MongoDB optional
      return null;
    }
  }

  /**
   * Disconnect from MongoDB
   */
  async disconnectMongoDB(): Promise<void> {
    if (this.mongoConnection) {
      try {
        await mongoose.connection.close();
        this.isMongoConnected = false;
        this.mongoConnection = null;
        console.log('✅ MongoDB disconnected successfully');
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ Error disconnecting from MongoDB:', errorMessage);
        throw error;
      }
    }
  }

  /**
   * Get MongoDB connection status
   */
  isMongoDBConnected() {
    return this.isMongoConnected && mongoose.connection.readyState === 1;
  }

  /**
   * Get the MongoDB connection instance
   */
  getMongoConnection() {
    return this.mongoConnection;
  }

  /**
   * Initialize Sequelize (PostgreSQL)
   */
  async connectSequelize(): Promise<Sequelize | null> {
    if (this.isSequelizeConnected && this.sequelizeInstance) {
      return this.sequelizeInstance;
    }

    try {
      console.log('🔌 Connecting to PostgreSQL via Sequelize...');

      this.sequelizeInstance = initializeSequelize();

      // Test connection
      const isConnected = await testSequelizeConnection();
      if (!isConnected) {
        throw new Error('Failed to connect to PostgreSQL');
      }

      // Sync database models (non-destructive)
      await syncDatabase(false);

      this.isSequelizeConnected = true;
      console.log('✅ PostgreSQL (Sequelize) connected successfully');

      return this.sequelizeInstance;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ PostgreSQL (Sequelize) connection failed:', errorMessage);
      console.error('ℹ️  Please ensure PostgreSQL is running and DATABASE_URL is set correctly');
      this.isSequelizeConnected = false;
      this.sequelizeInstance = null;
      throw error; // Sequelize is required for core functionality
    }
  }

  /**
   * Disconnect from Sequelize
   */
  async disconnectSequelize(): Promise<void> {
    if (this.sequelizeInstance) {
      try {
        await this.sequelizeInstance.close();
        this.isSequelizeConnected = false;
        this.sequelizeInstance = null;
        console.log('✅ PostgreSQL (Sequelize) disconnected successfully');
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ Error disconnecting from PostgreSQL:', errorMessage);
        throw error;
      }
    }
  }

  /**
   * Get Sequelize instance
   */
  getSequelizeInstance(): Sequelize {
    if (!this.sequelizeInstance || !this.isSequelizeConnected) {
      throw new Error('Sequelize is not connected. Call connectSequelize() first.');
    }
    return this.sequelizeInstance;
  }

  /**
   * Check if Sequelize is connected
   */
  checkSequelizeConnection(): boolean {
    return this.isSequelizeConnected && this.sequelizeInstance !== null;
  }

  /**
   * Initialize all database connections
   */
  async initializeAll(): Promise<boolean> {
    try {
      // Sequelize (PostgreSQL) is required
      await this.connectSequelize();

      // MongoDB is optional
      await this.connectMongoDB();

      console.log('🎉 Database connections initialized');
      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Database initialization failed:', errorMessage);
      throw error; // Fail if Sequelize connection fails
    }
  }

  /**
   * Close all database connections
   */
  async closeAll(): Promise<void> {
    try {
      await this.disconnectMongoDB();
      await this.disconnectSequelize();
      console.log('✅ All database connections closed successfully');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Error closing database connections:', errorMessage);
      throw error;
    }
  }
}

// Create singleton instance
const dbManager = new DatabaseManager();

export default dbManager;
