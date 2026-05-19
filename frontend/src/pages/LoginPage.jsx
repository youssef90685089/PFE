import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/axios';
import { Eye, EyeOff, GraduationCap, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authApi.login({ email, password });
      const apiResponse = res.data;

      // Backend wraps response: { success, message, data: AuthResponse }
      if (!apiResponse.success) {
        setError(apiResponse.message || 'Invalid email or password');
        return;
      }

      const authData = apiResponse.data;

      // Persist token + user to localStorage and update React context
      login(authData);

      // ── Navigate immediately based on API response data ───────────────
      if (authData.mustChangePassword) {
        navigate('/change-password', { replace: true });
      } else {
        const roles = authData.roles || [];
        if (roles.includes('ROLE_RECEPTIONIST')) {
          navigate('/dashboard/reception-panel', { replace: true });
        } else if (roles.includes('ROLE_CANDIDATE')) {
          navigate('/dashboard/quiz-interface', { replace: true });
        } else {
          // Admin and Manager go to the dashboard index (Overview)
          navigate('/dashboard', { replace: true });
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-primary-500 text-white">
        <div className="relative z-10 flex flex-col justify-center p-16">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm mb-8">
            <GraduationCap className="h-8 w-8 text-secondary-500" />
          </div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight">
            SIPMS |<br />Internship Portal
          </h1>
          <p className="mt-4 text-lg text-primary-100 max-w-md leading-relaxed">
            Smart Internship &amp; Project Management System for seamless professional development tracking.
          </p>
          <div className="mt-12 grid grid-cols-2 gap-6">
            {[
              { n: '1000+', l: 'Internship Placements' },
              { n: '99%',   l: 'System Reliability' },
              { n: '100+',  l: 'Partner Organizations' },
              { n: 'AI',    l: 'Matching Engine' },
            ].map((s) => (
              <div key={s.l} className="rounded-2xl bg-white/5 backdrop-blur-sm p-4 border border-white/10">
                <p className="text-2xl font-bold">{s.n}</p>
                <p className="text-xs text-primary-200 mt-1">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
        {/* Decorative triangle */}
        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 100 L100 0 L100 100 Z" fill="white" />
          </svg>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex flex-1 items-center justify-center p-8 bg-surface-50 font-sans">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500 text-white font-bold shadow-lg shadow-primary-500/25">
              S
            </div>
            <h1 className="font-bold text-xl text-surface-900 tracking-tighter">SIPMS</h1>
          </div>

          <h2 className="text-2xl font-bold text-surface-900 tracking-tight">System Login</h2>
          <p className="mt-2 text-surface-500">Authorized access for SIPMS internship management</p>

          {error && (
            <div className="mt-4 rounded-xl bg-red-50 border border-red-100 p-3 text-sm text-red-600 animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-1.5 uppercase tracking-wider">
                User Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@sipms.com"
                className="w-full rounded-xl border border-surface-200 bg-white px-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-1.5 uppercase tracking-wider">
                Secure Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-surface-200 bg-white px-4 py-3 pr-10 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-primary-500 py-3 text-sm font-bold text-white shadow-md hover:bg-primary-600 disabled:opacity-60 transition-all"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>Sign In <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-surface-500">
            Need an account?{' '}
            <Link to="/register" className="font-bold text-primary-500 hover:text-primary-600">
              Apply for Internship
            </Link>
          </p>

          {/* Quick Auth Access — dev helper */}
          <div className="mt-8 rounded-2xl border border-surface-200 bg-white p-4">
            <p className="text-[10px] font-bold text-surface-400 uppercase tracking-[0.15em] mb-3">
              Quick Auth Access
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { r: 'Admin',     e: 'admin@sipms.com' },
                { r: 'Manager',   e: 'manager@sipms.com' },
                { r: 'Reception', e: 'reception@sipms.com' },
                { r: 'Candidate', e: 'candidate@test.com' },
              ].map(({ r, e }) => (
                <button
                  key={r}
                  onClick={() => { setEmail(e); setPassword('Admin@123'); }}
                  className="rounded-lg border border-surface-100 p-2 text-left hover:border-primary-200 hover:bg-primary-50/30 transition-all"
                >
                  <span className="font-bold text-surface-700">{r}</span>
                  <br />
                  <span className="text-[10px] text-surface-400 font-mono">{e}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
