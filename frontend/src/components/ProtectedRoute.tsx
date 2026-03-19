import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { getStoredUser, getStoredUserRole } from '../utils/auth';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'user';
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const user = getStoredUser();
  const userRole = getStoredUserRole();

  if (!user?.id || !userRole) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to={userRole === 'admin' ? '/dashboard' : '/booking'} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
