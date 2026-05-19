import { createContext, useContext, useReducer, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

// ── State ────────────────────────────────────────────────
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
};

// ── Reducer ──────────────────────────────────────────────
function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false,
      };
    case 'LOADED':
      return { ...state, isLoading: false };
    case 'SET_USER':
      return { ...state, user: action.payload, isAuthenticated: true, isLoading: false };
    default:
      return state;
  }
}

// ── Provider ─────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Restore session from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('sipms_token');
    const userStr = localStorage.getItem('sipms_user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        // For demo tokens, just set the user without checking expiry
        if (token.startsWith('demo_token') || token.startsWith('sipms_token_')) {
          dispatch({
            type: 'SET_USER',
            payload: user,
          });
        } else {
          // For real JWT tokens, check expiry
          const decoded = jwtDecode(token);
          if (decoded.exp * 1000 > Date.now()) {
            dispatch({
              type: 'LOGIN',
              payload: { user, token },
            });
          } else {
            localStorage.removeItem('sipms_token');
            localStorage.removeItem('sipms_user');
            dispatch({ type: 'LOADED' });
          }
        }
      } catch {
        dispatch({ type: 'LOADED' });
      }
    } else {
      dispatch({ type: 'LOADED' });
    }
  }, []);

  const login = (authResponse) => {
    const user = {
      id: authResponse.userId,
      email: authResponse.email,
      fullName: authResponse.fullName || authResponse.email?.split('@')[0],
      roles: authResponse.roles,
      mustChangePassword: authResponse.mustChangePassword || false,
      specialty: authResponse.specialty,
      status: authResponse.status,
      quizCompleted: authResponse.quizCompleted || false,
    };
    const token = authResponse.accessToken || localStorage.getItem('sipms_token');
    localStorage.setItem('sipms_token', token);
    localStorage.setItem('sipms_user', JSON.stringify(user));
    dispatch({ type: 'LOGIN', payload: { user, token } });
  };

  const logout = () => {
    // ── Nuclear Logout ─────────────────────────────────────────────
    // Wipe all storage so no stale token survives.
    localStorage.clear();
    sessionStorage.clear();
    // Force a full page reload to /login. This destroys all React state,
    // React Router history memory, and the Axios header cache — preventing
    // the "zombie session" where a second login doesn't trigger navigation.
    window.location.replace('/login');
  };

  const resetPassword = (newPassword) => {
    // Update password in localStorage
    const userStr = localStorage.getItem('sipms_user');
    if (userStr) {
      const user = JSON.parse(userStr);
      user.mustChangePassword = false;
      localStorage.setItem('sipms_user', JSON.stringify(user));
      dispatch({ type: 'SET_USER', payload: user });
    }
  };

  const hasRole = (role) => {
    return state.user?.roles?.includes(role) || state.user?.roles?.includes(`ROLE_${role}`);
  };

  const isAdmin = () => hasRole('ADMIN');
  const isManager = () => hasRole('MANAGER');
  const isReceptionist = () => hasRole('RECEPTIONIST');
  const isCandidate = () => hasRole('CANDIDATE');

  return (
    <AuthContext.Provider value={{
      ...state, login, logout, resetPassword, hasRole, isAdmin, isManager, isReceptionist, isCandidate,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
