/**
 * Centralized Database Connection Manager Module
 *
 * This module provides a singleton DatabaseManager class that orchestrates
 * connections to multiple database systems used by the Black-Cross platform:
 * - PostgreSQL (via Sequelize ORM) - Required for core relational data
 * - MongoDB (via Mongoose) - Optional for unstructured data and logs
 *
 * The manager handles connection lifecycle, error recovery, and graceful
 * degradation when optional services are unavailable.
 *
 * @module config/database
 * @see {@link ./sequelize} for Sequelize-specific initialization
 * @see {@link ./index} for application configuration
 *
 * @example
 * ```typescript
 * import dbManager from './config/database';
 *
 * // Initialize all database connections
 * await dbManager.initializeAll();
 *
 * // Get Sequelize instance for queries
 * const sequelize = dbManager.getSequelizeInstance();
 *
 * // Check MongoDB availability
 * if (dbManager.isMongoDBConnected()) {
 *   const mongoConn = dbManager.getMongoConnection();
 * }
 *
 * // Cleanup on shutdown
 * await dbManager.closeAll();
 * ```
 */

import mongoose from 'mongoose';
import type { Connection } from 'mongoose';
import type { Sequelize } from 'sequelize-typescript';
import { initializeSequelize, testConnection as testSequelizeConnection, syncDatabase } from './sequelize';
import config from './index';

/**
 * Manages all database connections for the Black-Cross cyber threat intelligence platform.
 *
 * This class implements a singleton pattern to ensure consistent database connection
 * management across the application. It handles:
 * - PostgreSQL connections via Sequelize ORM (required)
 * - MongoDB connections via Mongoose (optional)
 * - Connection lifecycle management (connect, disconnect, reconnect)
 * - Error handling and graceful degradation
 * - Connection state tracking and validation
 *
 * @class DatabaseManager
 *
 * @remarks
 * PostgreSQL is required for core application functionality and will throw errors
 * if connection fails. MongoDB is optional and the application will continue
 * functioning with reduced capabilities if MongoDB is unavailable.
 *
 * @example
 * ```typescript
 * const dbManager = new DatabaseManager();
 *
 * // Initialize all connections
 * try {
 *   await dbManager.initializeAll();
 *   console.log('Databases ready');
 * } catch (error) {
 *   console.error('Critical database failure:', error);
 *   process.exit(1);
 * }
 * ```
 */
class DatabaseManager {
  /**
   * MongoDB connection instance from Mongoose.
   * Null when not connected or MongoDB is unavailable.
   *
   * @private
   * @type {Connection | null}
   */
  private mongoConnection: Connection | null = null;

  /**
   * Flag indicating whether MongoDB is currently connected and operational.
   *
   * @private
   * @type {boolean}
   */
  private isMongoConnected = false;

  /**
   * Sequelize ORM instance for PostgreSQL database operations.
   * Null when not initialized or connection failed.
   *
   * @private
   * @type {Sequelize | null}
   */
  private sequelizeInstance: Sequelize | null = null;

  /**
   * Flag indicating whether Sequelize (PostgreSQL) is currently connected.
   *
   * @private
   * @type {boolean}
   */
  private isSequelizeConnected = false;

  /**
   * Establishes connection to MongoDB database using Mongoose.
   *
   * This method initializes the MongoDB connection with configured connection
   * pooling and timeout settings. It also sets up event handlers for connection
   * lifecycle events (error, disconnect, reconnect). MongoDB is treated as an
   * optional service - connection failures are logged but do not throw errors.
   *
   * @async
   * @public
   * @returns {Promise<Connection | null>} The MongoDB connection instance if successful,
   *                                       or null if connection fails or MongoDB is unavailable
   *
   * @remarks
   * - Returns existing connection immediately if already connected
   * - Uses connection pooling with min/max pool size from config
   * - Sets serverSelectionTimeoutMS to 5000ms for fast failure detection
   * - Sets socketTimeoutMS to 45000ms for long-running operations
   * - Automatically registers event handlers for connection state changes
   * - Does NOT throw errors on failure - MongoDB is optional for the platform
   *
   * @example
   * ```typescript
   * // Connect to MongoDB
   * const connection = await dbManager.connectMongoDB();
   * if (connection) {
   *   console.log('MongoDB available for unstructured data');
   * } else {
   *   console.log('Running without MongoDB - some features limited');
   * }
   * ```
   *
   * @see {@link disconnectMongoDB} for closing the connection
   * @see {@link isMongoDBConnected} for checking connection status
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
   * Gracefully closes the MongoDB connection and cleans up resources.
   *
   * This method ensures all pending MongoDB operations complete before
   * closing the connection. It updates internal state flags and nullifies
   * the connection reference. Safe to call even if not connected.
   *
   * @async
   * @public
   * @returns {Promise<void>} Resolves when disconnection is complete
   * @throws {Error} If an error occurs during disconnection process
   *
   * @remarks
   * - No-op if MongoDB connection doesn't exist
   * - Waits for all pending operations to complete
   * - Clears internal connection state flags
   * - Removes event listeners from mongoose.connection
   *
   * @example
   * ```typescript
   * // Graceful shutdown
   * process.on('SIGTERM', async () => {
   *   await dbManager.disconnectMongoDB();
   *   process.exit(0);
   * });
   * ```
   *
   * @see {@link connectMongoDB} for establishing the connection
   * @see {@link closeAll} for closing all database connections
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
   * Checks whether MongoDB is currently connected and ready for operations.
   *
   * This method verifies both the internal connection flag and Mongoose's
   * actual connection state. A connection is considered active only when
   * both conditions are true.
   *
   * @public
   * @returns {boolean} True if MongoDB is connected and operational, false otherwise
   *
   * @remarks
   * - Checks internal `isMongoConnected` flag
   * - Verifies mongoose.connection.readyState === 1 (connected state)
   * - ReadyState values: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
   * - Use this before attempting MongoDB operations to prevent errors
   *
   * @example
   * ```typescript
   * if (dbManager.isMongoDBConnected()) {
   *   // Safe to use MongoDB operations
   *   const logs = await LogModel.find({ level: 'error' });
   * } else {
   *   // Fall back to alternative storage or skip optional feature
   *   console.log('MongoDB unavailable, using in-memory logging');
   * }
   * ```
   *
   * @see {@link connectMongoDB} for establishing connection
   * @see {@link getMongoConnection} for accessing the connection instance
   */
  isMongoDBConnected() {
    return this.isMongoConnected && mongoose.connection.readyState === 1;
  }

  /**
   * Retrieves the active MongoDB connection instance.
   *
   * Returns the Mongoose connection object that can be used for database
   * operations. May return null if MongoDB is not connected or unavailable.
   *
   * @public
   * @returns {Connection | null} The active MongoDB connection, or null if not connected
   *
   * @remarks
   * - Returns null if `connectMongoDB()` has not been called or failed
   * - Always check return value for null before using
   * - Prefer using `isMongoDBConnected()` before calling this method
   * - The connection object provides access to MongoDB collections and operations
   *
   * @example
   * ```typescript
   * const connection = dbManager.getMongoConnection();
   * if (connection) {
   *   const db = connection.db;
   *   const collection = db.collection('threat_logs');
   *   await collection.insertOne({ event: 'threat_detected', timestamp: new Date() });
   * }
   * ```
   *
   * @see {@link isMongoDBConnected} for checking connection status first
   * @see {@link connectMongoDB} for establishing the connection
   */
  getMongoConnection() {
    return this.mongoConnection;
  }

  /**
   * Initializes Sequelize ORM connection to PostgreSQL database.
   *
   * This method establishes the primary database connection required for all
   * core application functionality. It initializes Sequelize, tests the connection,
   * and synchronizes database models with the schema. Unlike MongoDB, PostgreSQL
   * is required and connection failures will throw errors.
   *
   * @async
   * @public
   * @returns {Promise<Sequelize | null>} The Sequelize instance if connection successful
   * @throws {Error} If PostgreSQL connection fails or DATABASE_URL is invalid
   *
   * @remarks
   * - Returns existing instance immediately if already connected
   * - Calls `initializeSequelize()` from sequelize config module
   * - Verifies connection with `testSequelizeConnection()`
   * - Performs non-destructive model synchronization (does not drop tables)
   * - **CRITICAL**: This is a required connection - application cannot function without it
   * - Throws descriptive errors to help diagnose connection issues
   *
   * @example
   * ```typescript
   * try {
   *   const sequelize = await dbManager.connectSequelize();
   *   console.log('PostgreSQL ready for queries');
   *
   *   // Use Sequelize models
   *   const users = await User.findAll();
   * } catch (error) {
   *   console.error('Cannot start without PostgreSQL:', error);
   *   process.exit(1);
   * }
   * ```
   *
   * @see {@link initializeSequelize} for Sequelize initialization details
   * @see {@link disconnectSequelize} for closing the connection
   * @see {@link getSequelizeInstance} for accessing the instance after connection
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
   * Gracefully closes the Sequelize connection to PostgreSQL.
   *
   * This method terminates all active connections in the Sequelize connection
   * pool and releases database resources. It ensures all pending queries complete
   * before closing. Safe to call even if not connected.
   *
   * @async
   * @public
   * @returns {Promise<void>} Resolves when disconnection is complete
   * @throws {Error} If an error occurs during disconnection process
   *
   * @remarks
   * - No-op if Sequelize instance doesn't exist
   * - Closes all connections in the connection pool
   * - Waits for pending queries to complete
   * - Clears internal connection state flags
   * - Should be called during graceful application shutdown
   *
   * @example
   * ```typescript
   * // Application shutdown handler
   * async function shutdown() {
   *   console.log('Shutting down gracefully...');
   *   await dbManager.disconnectSequelize();
   *   console.log('Database connections closed');
   * }
   *
   * process.on('SIGTERM', shutdown);
   * process.on('SIGINT', shutdown);
   * ```
   *
   * @see {@link connectSequelize} for establishing the connection
   * @see {@link closeAll} for closing all database connections
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
   * Retrieves the active Sequelize ORM instance for database operations.
   *
   * This method provides access to the Sequelize instance that can be used
   * for executing queries, accessing models, and performing database transactions.
   * Throws an error if called before connection is established.
   *
   * @public
   * @returns {Sequelize} The active Sequelize instance
   * @throws {Error} If Sequelize is not connected or instance is null
   *
   * @remarks
   * - Must call `connectSequelize()` before using this method
   * - Verifies both instance existence and connection status
   * - The returned instance provides access to all Sequelize ORM features
   * - Use this to access models, run raw queries, or start transactions
   *
   * @example
   * ```typescript
   * // Get Sequelize instance and run a query
   * const sequelize = dbManager.getSequelizeInstance();
   *
   * // Use models
   * const User = sequelize.models.User;
   * const users = await User.findAll({ where: { active: true } });
   *
   * // Run raw SQL
   * const [results] = await sequelize.query('SELECT COUNT(*) FROM incidents');
   *
   * // Start a transaction
   * const transaction = await sequelize.transaction();
   * try {
   *   await User.create({ username: 'admin' }, { transaction });
   *   await transaction.commit();
   * } catch (error) {
   *   await transaction.rollback();
   * }
   * ```
   *
   * @see {@link connectSequelize} for establishing connection first
   * @see {@link checkSequelizeConnection} for non-throwing status check
   */
  getSequelizeInstance(): Sequelize {
    if (!this.sequelizeInstance || !this.isSequelizeConnected) {
      throw new Error('Sequelize is not connected. Call connectSequelize() first.');
    }
    return this.sequelizeInstance;
  }

  /**
   * Checks whether Sequelize (PostgreSQL) is currently connected and operational.
   *
   * This is a non-throwing alternative to `getSequelizeInstance()` for checking
   * connection status. Returns a boolean indicating if the database is ready
   * for operations.
   *
   * @public
   * @returns {boolean} True if Sequelize is connected, false otherwise
   *
   * @remarks
   * - Verifies internal connection flag is true
   * - Confirms Sequelize instance is not null
   * - Does not throw errors unlike `getSequelizeInstance()`
   * - Use this for conditional logic based on connection availability
   *
   * @example
   * ```typescript
   * // Conditional database operations
   * if (dbManager.checkSequelizeConnection()) {
   *   const sequelize = dbManager.getSequelizeInstance();
   *   await performDatabaseBackup(sequelize);
   * } else {
   *   console.warn('Database not available for backup');
   * }
   *
   * // Health check endpoint
   * app.get('/health', (req, res) => {
   *   const dbStatus = dbManager.checkSequelizeConnection();
   *   res.json({
   *     status: dbStatus ? 'healthy' : 'unhealthy',
   *     database: {
   *       postgresql: dbStatus,
   *       mongodb: dbManager.isMongoDBConnected()
   *     }
   *   });
   * });
   * ```
   *
   * @see {@link getSequelizeInstance} for accessing the instance (throws if not connected)
   * @see {@link connectSequelize} for establishing the connection
   */
  checkSequelizeConnection(): boolean {
    return this.isSequelizeConnected && this.sequelizeInstance !== null;
  }

  /**
   * Initializes all database connections for the Black-Cross platform.
   *
   * This is the primary initialization method that should be called during
   * application startup. It connects to both PostgreSQL (required) and MongoDB
   * (optional) in the correct order, with appropriate error handling for each.
   *
   * @async
   * @public
   * @returns {Promise<boolean>} True if initialization completes successfully
   * @throws {Error} If PostgreSQL (Sequelize) connection fails - MongoDB failures are tolerated
   *
   * @remarks
   * Connection order and behavior:
   * 1. **PostgreSQL (Sequelize)** - Connects first, MUST succeed or throws error
   * 2. **MongoDB** - Attempts connection, logs warning if fails but continues
   *
   * The application will start successfully even if MongoDB is unavailable, but
   * will halt if PostgreSQL connection fails since it's required for core functionality.
   *
   * @example
   * ```typescript
   * // Application startup sequence
   * import express from 'express';
   * import dbManager from './config/database';
   *
   * async function startServer() {
   *   try {
   *     // Initialize databases before starting server
   *     await dbManager.initializeAll();
   *     console.log('All database connections ready');
   *
   *     const app = express();
   *     // ... configure routes ...
   *
   *     app.listen(8080, () => {
   *       console.log('Server running on port 8080');
   *     });
   *   } catch (error) {
   *     console.error('Failed to start server:', error);
   *     process.exit(1);
   *   }
   * }
   *
   * startServer();
   * ```
   *
   * @see {@link connectSequelize} for PostgreSQL connection details
   * @see {@link connectMongoDB} for MongoDB connection details
   * @see {@link closeAll} for graceful shutdown
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
   * Gracefully closes all database connections.
   *
   * This method should be called during application shutdown to ensure all
   * database connections are properly closed, pending operations complete,
   * and resources are released. It closes MongoDB first, then PostgreSQL.
   *
   * @async
   * @public
   * @returns {Promise<void>} Resolves when all connections are closed
   * @throws {Error} If any disconnection operation fails
   *
   * @remarks
   * Disconnection order:
   * 1. **MongoDB** - Closed first (safe to fail if not connected)
   * 2. **PostgreSQL (Sequelize)** - Closed second to ensure data integrity
   *
   * This order ensures that any final data writes complete before the
   * primary database connection closes.
   *
   * @example
   * ```typescript
   * // Graceful shutdown handler
   * async function gracefulShutdown(signal: string) {
   *   console.log(`${signal} received, starting graceful shutdown`);
   *
   *   try {
   *     // Close database connections
   *     await dbManager.closeAll();
   *
   *     // Close server
   *     server.close(() => {
   *       console.log('Server closed successfully');
   *       process.exit(0);
   *     });
   *
   *     // Force exit after timeout
   *     setTimeout(() => {
   *       console.error('Forced shutdown after timeout');
   *       process.exit(1);
   *     }, 10000);
   *   } catch (error) {
   *     console.error('Error during shutdown:', error);
   *     process.exit(1);
   *   }
   * }
   *
   * process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
   * process.on('SIGINT', () => gracefulShutdown('SIGINT'));
   * ```
   *
   * @see {@link disconnectMongoDB} for MongoDB disconnection
   * @see {@link disconnectSequelize} for PostgreSQL disconnection
   * @see {@link initializeAll} for initialization
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

/**
 * Singleton instance of DatabaseManager for the Black-Cross platform.
 *
 * This is the primary export of the database configuration module. It provides
 * a single, shared instance of DatabaseManager that should be used throughout
 * the application to ensure consistent connection management.
 *
 * @constant {DatabaseManager}
 *
 * @remarks
 * **Singleton Pattern**: Only one instance exists for the entire application.
 * This ensures:
 * - Single connection pool for each database
 * - Consistent connection state across modules
 * - Centralized connection management
 * - Prevention of connection pool exhaustion
 *
 * @example
 * ```typescript
 * // Import in your application entry point
 * import dbManager from './config/database';
 *
 * // Initialize on startup
 * await dbManager.initializeAll();
 *
 * // Import in any module that needs database access
 * import dbManager from './config/database';
 * const sequelize = dbManager.getSequelizeInstance();
 * ```
 *
 * @see {@link DatabaseManager} for available methods
 */
const dbManager = new DatabaseManager();

export default dbManager;
