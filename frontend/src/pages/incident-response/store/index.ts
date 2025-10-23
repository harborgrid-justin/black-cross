/**
 * @fileoverview Module export point for Incident Response. Central export for all module components.
 * 
 * @module pages/incident-response/store/index.ts
 */

/**
 * WF-COMP-006 | index.ts - Incident Response store exports
 * Purpose: Centralized exports for incident response store module
 * Last Updated: 2025-10-22 | File Type: .ts
 */

export * from './incidentSlice';
export { default as incidentReducer } from './incidentSlice';
