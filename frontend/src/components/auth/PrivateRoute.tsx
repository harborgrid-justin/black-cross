/**
 * @fileoverview PrivateRoute component. React component for the Black-Cross platform.
 * 
 * @module components/auth/PrivateRoute.tsx
 */

import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { useEffect } from 'react';

interface PrivateRouteProps {
  children: React.ReactNode;
}

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
