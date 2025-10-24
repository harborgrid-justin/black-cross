/**
 * @fileoverview Store Export Point for Threat Actors Redux State.
 *
 * Central export module for threat actors Redux store components including
 * the slice reducer, actions, async thunks, and selectors. Provides a clean
 * import interface for components consuming threat actor state.
 *
 * Exports:
 * - actorReducer: Redux reducer function for threat actor state
 * - fetchActors: Async thunk for fetching all actors
 * - fetchActorById: Async thunk for fetching single actor
 * - setFilters: Action creator for updating filters
 * - clearSelectedActor: Action creator for clearing selection
 * - clearError: Action creator for error handling
 *
 * @module pages/threat-actors/store
 *
 * @example
 * ```typescript
 * import { actorReducer, fetchActors, setFilters } from './pages/threat-actors/store';
 *
 * // In store configuration
 * const store = configureStore({
 *   reducer: {
 *     actors: actorReducer
 *   }
 * });
 *
 * // In components
 * dispatch(fetchActors());
 * ```
 */

export * from './actorSlice';
export { default as actorReducer } from './actorSlice';
