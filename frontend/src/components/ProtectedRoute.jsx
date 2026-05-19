import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute — wraps routes that require authentication and optionally specific roles.
 * Usage: <Route element={<ProtectedRoute roles={['ADMIN','MANAGER']}><Page/></ProtectedRoute>} />
 */
export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check roles if specified
  if (roles && roles.length > 0) {
    const userRoles = user?.roles || [];
    const hasRequired = roles.some(
      (role) => userRoles.includes(role) || userRoles.includes(`ROLE_${role}`)
    );
    if (!hasRequired) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}
