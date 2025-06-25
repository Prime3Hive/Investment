import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Skeleton from './SkeletonLoader';

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
  const { user, isLoading, session } = useAuth();

  // Show loading state while auth is being determined
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="flex flex-col items-center space-y-4">
            <Skeleton height="3rem" width="3rem" rounded />
            <Skeleton height="1.5rem" width="8rem" rounded />
            <div className="mt-2">
              <Skeleton height="1rem" width="12rem" rounded />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check for session and user
  if (!session || !user) {
    console.log('🔒 Protected route: No session or user, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Check for admin access if required
  if (adminOnly && !user.isAdmin) {
    console.log('🔒 Protected route: Admin required but user is not admin, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  // Check if email is confirmed
  if (!user.emailConfirmed) {
    console.log('🔒 Protected route: Email not confirmed, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('✅ Protected route: Access granted');
  return <>{children}</>;
};

export default ProtectedRoute;