import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * RoleBasedRedirect
 * This component is used at the dashboard index to funnel users
 * to their specific start pages (e.g., Receptionists to the panel).
 */
export default function RoleBasedRedirect({ children }) {
  const { user, isCandidate } = useAuth();
  const location = useLocation();
  const userRoles = user?.roles || [];

  // Special logic for Candidates: Redirect to quiz until completed
  if (isCandidate()) {
    if (!user.quizCompleted) {
      return <Navigate to="/dashboard/quiz-interface" replace />;
    }
    return children;
  }

  // Define role redirect logic for other roles
  // Paths MUST be absolute (starting with /) to avoid relative issues
  const roleRedirects = {
    RECEPTIONIST: '/dashboard/reception-panel',
    ADMIN: '/dashboard',
    MANAGER: '/dashboard',
  };

  // Check user's primary role
  for (const role of userRoles) {
    const cleanRole = role.replace('ROLE_', '');
    const targetPath = roleRedirects[cleanRole];

    if (targetPath) {
      // Normalize paths for comparison (remove trailing slashes)
      const currentPath = location.pathname.replace(/\/$/, '');
      const normalizedTarget = targetPath.replace(/\/$/, '');

      // If we are already at the target (or the target is the index itself),
      // render the children (OverviewPage) to avoid infinite loops.
      if (currentPath === normalizedTarget || normalizedTarget === '/dashboard') {
        return children;
      }
      
      return <Navigate to={targetPath} replace />;
    }
  }

  return children;
}