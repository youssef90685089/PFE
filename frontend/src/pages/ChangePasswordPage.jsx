import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/axios';
import { Lock, Eye, EyeOff, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { resetPassword, user } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    if (newPassword.length < 8) return 'Password must be at least 8 characters.';
    if (!/[A-Z]/.test(newPassword)) return 'Password must contain at least one uppercase letter.';
    if (!/[0-9]/.test(newPassword)) return 'Password must contain at least one number.';
    if (newPassword !== confirmPassword) return 'Passwords do not match.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    setError('');
    try {
      const res = await authApi.changePassword({ currentPassword, newPassword });
      if (!res.data.success) {
        setError(res.data.message || 'Failed to change password.');
        return;
      }
      // Clear mustChangePassword flag in local storage so the redirect doesn't loop
      const userStr = localStorage.getItem('sipms_user');
      if (userStr) {
        const u = JSON.parse(userStr);
        u.mustChangePassword = false;
        localStorage.setItem('sipms_user', JSON.stringify(u));
      }
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const strength = newPassword.length === 0 ? 0
    : newPassword.length < 6 ? 1
    : newPassword.length < 10 ? 2
    : 3;
  const strengthLabels = ['', 'Weak', 'Moderate', 'Strong'];
  const strengthColors = ['', 'bg-red-500', 'bg-yellow-400', 'bg-green-500'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          {/* Icon */}
          <div className="flex items-center justify-center mb-6">
            <div className="h-16 w-16 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center">
              <ShieldCheck className="h-8 w-8 text-amber-400" />
            </div>
          </div>

          {/* Warning Banner */}
          <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-400/20 rounded-xl p-4 mb-6">
            <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-300">Temporary Password Detected</p>
              <p className="text-xs text-amber-400/80 mt-1">
                Hello {user?.fullName?.split(' ')[0] || 'there'}. Your account was created with a temporary password.
                You must set a new secure password to continue.
              </p>
            </div>
          </div>

          <h1 className="text-xl font-bold text-white text-center mb-6">Set Your New Password</h1>

          {error && (
            <div className="bg-red-500/10 border border-red-400/30 rounded-xl p-3 mb-5 text-sm text-red-300 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Current Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Current (Temporary) Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-slate-500 focus:border-blue-400/50 focus:ring-1 focus:ring-blue-400/30 focus:outline-none transition-all"
                />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                  placeholder="Min. 8 chars, 1 uppercase, 1 number"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-slate-500 focus:border-blue-400/50 focus:ring-1 focus:ring-blue-400/30 focus:outline-none transition-all"
                />
                <button type="button" onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {/* Strength meter */}
              {newPassword.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[1, 2, 3].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? strengthColors[strength] : 'bg-white/10'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{strengthLabels[strength]}</p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className={`w-full bg-white/5 border rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none transition-all ${
                    confirmPassword && confirmPassword !== newPassword
                      ? 'border-red-400/50 focus:ring-1 focus:ring-red-400/30'
                      : 'border-white/10 focus:border-blue-400/50 focus:ring-1 focus:ring-blue-400/30'
                  }`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  <ShieldCheck className="h-5 w-5" />
                  Set New Password
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          SIPMS — Smart Internship &amp; Project Management System
        </p>
      </div>
    </div>
  );
}
