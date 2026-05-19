import { useEffect, useState } from 'react';
import { candidatesApi } from '../../api/axios';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    candidatesApi.getMyProfile().then(r => { setProfile(r.data?.data); setForm(r.data?.data || {}); }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await candidatesApi.updateProfile(form);
      setProfile(res.data?.data);
      setEditing(false);
    } catch (e) { alert(e.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  if (loading) return <LoadingSpinner />;
  if (!profile) return <p className="text-surface-500">Profile not found</p>;

  const field = (label, key) => (
    <div>
      <label className="block text-sm font-medium text-surface-600 mb-1">{label}</label>
      {editing ? (
        <input value={form[key] || ''} onChange={e => setForm({...form, [key]: e.target.value})}
          className="w-full rounded-xl border border-surface-200 px-4 py-2.5 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100" />
      ) : (
        <p className="text-sm text-surface-800">{profile[key] || '—'}</p>
      )}
    </div>
  );

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-surface-900">My Profile</h1>
        {editing ? (
          <div className="flex gap-2">
            <button onClick={() => setEditing(false)} className="rounded-xl bg-surface-100 px-4 py-2 text-sm font-medium text-surface-600">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="rounded-xl bg-primary-500 px-4 py-2 text-sm font-medium text-white">
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} className="rounded-xl bg-primary-500 px-4 py-2 text-sm font-medium text-white">Edit Profile</button>
        )}
      </div>
      <div className="rounded-2xl border border-surface-200 bg-white p-6 space-y-5">
        <div className="flex items-center gap-4 pb-4 border-b border-surface-100">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 text-white text-xl font-bold shadow-lg">
            {profile.fullName?.split(' ').map(n => n[0]).join('').toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-bold text-surface-900">{profile.fullName}</p>
            <p className="text-sm text-surface-500">{profile.email}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-5">
          {field('University', 'university')}
          {field('Degree', 'degree')}
          {field('Graduation Year', 'graduationYear')}
          {field('Skills', 'skillsTags')}
        </div>
        {field('Bio', 'bio')}
      </div>
    </div>
  );
}
