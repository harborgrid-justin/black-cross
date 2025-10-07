import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { useEffect } from 'react';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const { isAuthenticated, token } = useAppSelector((state) => state.auth);
  
  // For development: bypass authentication if in development mode
  const isDevelopment = process.env['NODE_ENV'] === 'development';

  // Debug logging
  useEffect(() => {
    console.log('PrivateRoute: isAuthenticated =', isAuthenticated, ', token =', token, ', isDevelopment =', isDevelopment);
  }, [isAuthenticated, token, isDevelopment]);

  if (!isAuthenticated && !isDevelopment) {
    console.log('PrivateRoute: Redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('PrivateRoute: Rendering children');
  return <>{children}</>;
}
