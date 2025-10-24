/**
 * @fileoverview Vite environment type declarations.
 *
 * Provides TypeScript type definitions for Vite's import.meta.env environment variables.
 * Extends the base Vite client types with application-specific environment variables.
 *
 * @module vite-env
 */

/// <reference types="vite/client" />

/**
 * Environment variables available through import.meta.env.
 *
 * Extends Vite's built-in ImportMetaEnv interface with application-specific
 * environment variables. Vite automatically provides:
 * - MODE: 'development' | 'production' | 'test' - Current build mode
 * - DEV: boolean - Whether running in development mode
 * - PROD: boolean - Whether running in production mode
 * - SSR: boolean - Whether running in server-side rendering mode
 * - BASE_URL: string - Base URL for the application
 *
 * @interface ImportMetaEnv
 * @property {string} VITE_API_URL - Backend API base URL
 */
interface ImportMetaEnv {
  readonly MODE: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly SSR: boolean;
  readonly BASE_URL: string;
  readonly VITE_API_URL: string;
}
