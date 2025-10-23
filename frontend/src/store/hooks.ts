/**
 * @fileoverview Typed Redux hooks for use throughout the application. Provides type-safe useSelector and useDispatch hooks.
 * 
 * @module store/hooks
 */

import type { TypedUseSelectorHook} from 'react-redux';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './index';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
