/**
 * @fileoverview Vite environment type declarations.
 * 
 * Provides TypeScript type definitions for Vite's import.meta.env environment variables.
 * 
 * @module vite-env
 */

/// <reference types="vite/client" />

/**
 * Environment variables available through import.meta.env.
 * 
 * @interface ImportMetaEnv
 * @property {string} VITE_API_URL - Backend API base URL
 */
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}

/**
 * Extended import.meta interface with environment variables.
 * 
 * @interface ImportMeta
 * @property {ImportMetaEnv} env - Environment variables
 */
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
