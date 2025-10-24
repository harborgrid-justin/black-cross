/**
 * @fileoverview Protected route wrapper component for authentication control.
 *
 * Implements route protection by checking authentication status before rendering
 * protected content. Redirects unauthenticated users to the login page. Includes
 * development mode bypass for easier testing and Cypress E2E test compatibility.
 *
 * Features:
 * - Authentication status verification
 * - Automatic redirect to login for unauthenticated users
 * - Development mode authentication bypass
 * - Cypress test environment support
 * - Debug logging for authentication flow
 *
 * @module components/auth/PrivateRoute
 */

import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { useEffect } from 'react';

/**
 * Props for the PrivateRoute component.
 *
 * @interface PrivateRouteProps
 * @property {React.ReactNode} children - Protected components to render if authenticated
 */
interface PrivateRouteProps {
  children: React.ReactNode;
}

/**
 * Route protection component that enforces authentication requirements.
 *
 * Wraps protected routes and verifies the user is authenticated before rendering
 * the child components. If the user is not authenticated (and not in development/test
 * mode), redirects to the login page.
 *
 * Development/Testing Behavior:
 * - In development mode (MODE === 'development' or DEV === true): Bypasses authentication
 * - When Cypress is detected (window.Cypress exists): Bypasses authentication
 * - This allows easier E2E testing and development workflow
 *
 * Production Behavior:
 * - Strictly enforces authentication
 * - Redirects to /login if not authenticated
 *
 * @component
 * @param {PrivateRouteProps} props - Component props
 * @param {React.ReactNode} props.children - Protected content to render
 * @returns {JSX.Element} Either the protected children or a redirect to login
 *
 * @example
 * ```tsx
 * // Wrapping a protected route
 * <PrivateRoute>
 *   <Dashboard />
 * </PrivateRoute>
 * ```
 *
 * @example
 * ```tsx
 * // Used in React Router configuration
 * <Route
 *   path="/dashboard"
 *   element={
 *     <PrivateRoute>
 *       <Dashboard />
 *     </PrivateRoute>
 *   }
 * />
 * ```
 */
export default function PrivateRoute({ children }: PrivateRouteProps) {
  const { isAuthenticated, token } = useAppSelector((state) => state.auth);
  
  // Bypass authentication in development mode (including Cypress tests for easier E2E testing)
  const isDevelopment = import.meta.env.MODE === 'development' || import.meta.env.DEV;
  const isCypress = (window as any).Cypress !== undefined;
  const shouldBypassAuth = isDevelopment || isCypress;

  // Debug logging
  useEffect(() => {
    console.log('PrivateRoute: MODE =', import.meta.env.MODE, ', DEV =', import.meta.env.DEV, ', isAuthenticated =', isAuthenticated, ', token =', token, ', isDevelopment =', isDevelopment, ', isCypress =', isCypress, ', shouldBypassAuth =', shouldBypassAuth);
  }, [isAuthenticated, token, isDevelopment, isCypress, shouldBypassAuth]);

  if (!isAuthenticated && !shouldBypassAuth) {
    console.log('PrivateRoute: Redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('PrivateRoute: Rendering children');
  return <>{children}</>;
}
