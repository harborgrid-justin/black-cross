/**
 * Centralized Database Connection Manager
 * Manages all database connections for the Black-Cross platform
 */

import mongoose from 'mongoose';
import type { Connection } from 'mongoose';
import { PrismaClient } from '@prisma/client';
import config from './index';

class DatabaseManager {
  private mongoConnection: Connection | null = null;
  private isMongoConnected = false;
  private prismaClient: PrismaClient | null = null;
  private isPrismaConnected = false;

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
   * Initialize Prisma Client (PostgreSQL)
   */
  async connectPrisma(): Promise<PrismaClient | null> {
    if (this.isPrismaConnected && this.prismaClient) {
      return this.prismaClient;
    }

    try {
      console.log('🔌 Connecting to PostgreSQL via Prisma...');

      this.prismaClient = new PrismaClient({
        log: config.env === 'development' ? ['query', 'error', 'warn'] : ['error'],
        errorFormat: 'pretty',
      });

      // Test connection
      await this.prismaClient.$connect();

      this.isPrismaConnected = true;
      console.log('✅ PostgreSQL (Prisma) connected successfully');

      return this.prismaClient;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ PostgreSQL (Prisma) connection failed:', errorMessage);
      console.error('ℹ️  Please ensure PostgreSQL is running and DATABASE_URL is set correctly');
      this.isPrismaConnected = false;
      this.prismaClient = null;
      throw error; // Prisma is required for core functionality
    }
  }

  /**
   * Disconnect from Prisma
   */
  async disconnectPrisma(): Promise<void> {
    if (this.prismaClient) {
      try {
        await this.prismaClient.$disconnect();
        this.isPrismaConnected = false;
        this.prismaClient = null;
        console.log('✅ PostgreSQL (Prisma) disconnected successfully');
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ Error disconnecting from PostgreSQL:', errorMessage);
        throw error;
      }
    }
  }

  /**
   * Get Prisma Client instance
   */
  getPrismaClient(): PrismaClient {
    if (!this.prismaClient || !this.isPrismaConnected) {
      throw new Error('Prisma client is not connected. Call connectPrisma() first.');
    }
    return this.prismaClient;
  }

  /**
   * Check if Prisma is connected
   */
  checkPrismaConnection(): boolean {
    return this.isPrismaConnected && this.prismaClient !== null;
  }

  /**
   * Initialize all database connections
   */
  async initializeAll(): Promise<boolean> {
    try {
      // Prisma (PostgreSQL) is required
      await this.connectPrisma();

      // MongoDB is optional
      await this.connectMongoDB();

      console.log('🎉 Database connections initialized');
      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Database initialization failed:', errorMessage);
      throw error; // Fail if Prisma connection fails
    }
  }

  /**
   * Close all database connections
   */
  async closeAll(): Promise<void> {
    try {
      await this.disconnectMongoDB();
      await this.disconnectPrisma();
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
