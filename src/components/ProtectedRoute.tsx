import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Checking authentication...</p>
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