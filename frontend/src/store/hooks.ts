/**
 * @fileoverview Typed Redux hooks for use throughout the application. Provides type-safe useSelector and useDispatch hooks.
 *
 * These hooks wrap the standard react-redux hooks with proper TypeScript typing for the application's
 * Redux store. Use these throughout the application instead of the plain `useDispatch` and `useSelector`
 * hooks to ensure type safety.
 *
 * @module store/hooks
 */

import type { TypedUseSelectorHook} from 'react-redux';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './index';

/**
 * Type-safe version of the `useDispatch` hook from react-redux.
 *
 * This hook provides proper TypeScript typing for dispatching actions, including
 * support for async thunks created with Redux Toolkit's createAsyncThunk.
 *
 * @returns {AppDispatch} The typed dispatch function for the Redux store
 *
 * @example
 * ```typescript
 * import { useAppDispatch } from '@/store/hooks';
 * import { fetchThreats } from '@/store/slices/threatSlice';
 *
 * function ThreatList() {
 *   const dispatch = useAppDispatch();
 *
 *   useEffect(() => {
 *     // TypeScript knows about all available actions and thunks
 *     dispatch(fetchThreats({ severity: 'high' }));
 *   }, [dispatch]);
 * }
 * ```
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();

/**
 * Type-safe version of the `useSelector` hook from react-redux.
 *
 * This hook provides proper TypeScript typing for selecting state from the Redux store.
 * The type system will ensure you can only access properties that exist on the RootState.
 *
 * @type {TypedUseSelectorHook<RootState>}
 *
 * @example
 * ```typescript
 * import { useAppSelector } from '@/store/hooks';
 *
 * function ThreatCount() {
 *   // TypeScript provides autocomplete and type checking for state
 *   const threats = useAppSelector((state) => state.threats.threats);
 *   const loading = useAppSelector((state) => state.threats.loading);
 *
 *   return <div>Total threats: {threats.length}</div>;
 * }
 * ```
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
