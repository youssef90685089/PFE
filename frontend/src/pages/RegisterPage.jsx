import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/axios';
import { GraduationCap } from 'lucide-react';

export default function RegisterPage() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', phone: '', university: '', degree: '', graduationYear: '', skillsTags: '', bio: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.register(form);
      login(res.data.data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const input = (name, label, type = 'text', placeholder = '', required = true) => (
    <div>
      <label className="block text-sm font-medium text-surface-700 mb-1.5">{label}</label>
      <input type={type} name={name} required={required} value={form[name]}
        onChange={handleChange} placeholder={placeholder}
        className="w-full rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all" />
    </div>
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 via-surface-50 to-primary-50 p-4">
      <div className="w-full max-w-2xl animate-fade-in">
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white font-bold shadow-lg shadow-primary-500/25">
            <GraduationCap className="h-5 w-5" />
          </div>
          <h1 className="font-bold text-xl text-surface-900">SIPMS — Candidate Registration</h1>
        </div>

        <div className="rounded-2xl border border-surface-200 bg-white p-8 shadow-xl shadow-surface-200/50">
          {error && <div className="mb-4 rounded-xl bg-red-50 border border-red-100 p-3 text-sm text-red-600">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              {input('firstName', 'First Name', 'text', 'Sara')}
              {input('lastName', 'Last Name', 'text', 'Idrissi')}
            </div>
            <div className="grid grid-cols-2 gap-4">
              {input('email', 'Email', 'email', 'sara@student.ma')}
              {input('password', 'Password', 'password', '••••••••')}
            </div>
{input('phone', 'Phone', 'tel', '+212600000000', false)}
             <div className="grid grid-cols-2 gap-4">
               {input('university', 'University', 'text', 'Université Mohammed V', false)}
               {input('degree', 'Degree', 'text', 'Master Informatique', false)}
             </div>
             <div>
               <label className="block text-sm font-medium text-surface-700 mb-1.5">Graduation Year</label>
               <input name="graduationYear" type="number" value={form.graduationYear} onChange={handleChange}
                 min="1900" max="2050"
                 className="w-full rounded-xl border border-surface-200 px-4 py-2.5 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all"
                 placeholder="e.g., 2026" />
             </div>
             {input('skillsTags', 'Skills (comma separated)', 'text', 'java, react, python', false)}
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Bio</label>
              <textarea name="bio" value={form.bio} onChange={handleChange} rows={3} placeholder="Tell us about yourself..."
                className="w-full rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all resize-none" />
            </div>

            <button type="submit" disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 hover:from-primary-600 hover:to-primary-700 disabled:opacity-60 transition-all">
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-surface-500">
            Already have an account? <Link to="/login" className="font-semibold text-primary-600">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
