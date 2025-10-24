/**
 * @fileoverview Store exports for IoC Management module.
 *
 * Central export point for all Redux store-related items including
 * the reducer, async thunks, and action creators for IoC Management.
 *
 * @module pages/ioc-management/store
 */

export * from './iocSlice';
export { default as iocReducer } from './iocSlice';
