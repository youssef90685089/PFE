import { useState } from 'react';
import { Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function SettingsPage() {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [settings, setSettings] = useState({
    siteName: 'SIPMS - Internship Portal',
    siteEmail: 'admin@clinisy.com',
    timezone: 'Africa/Tunis',
  });

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">System Settings</h1>
        <p className="text-surface-500 mt-1">Configure system parameters and preferences</p>
      </div>

      {/* Settings Card */}
      <div className="bg-white rounded-2xl border border-surface-200 p-8 max-w-2xl">
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-surface-900">General Settings</h2>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-2">Site Name</label>
              <input
                type="text"
                value={settings.siteName}
                onChange={e => setSettings({...settings, siteName: e.target.value})}
                className="w-full rounded-xl border border-surface-200 px-4 py-2.5 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-2">Contact Email</label>
              <input
                type="email"
                value={settings.siteEmail}
                onChange={e => setSettings({...settings, siteEmail: e.target.value})}
                className="w-full rounded-xl border border-surface-200 px-4 py-2.5 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-2">Timezone</label>
              <select
                value={settings.timezone}
                onChange={e => setSettings({...settings, timezone: e.target.value})}
                className="w-full rounded-xl border border-surface-200 px-4 py-2.5 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all"
              >
                <option value="Africa/Tunis">Africa/Tunis (GMT+1)</option>
                <option value="Europe/Paris">Europe/Paris (GMT+1)</option>
                <option value="Europe/London">Europe/London (GMT+0)</option>
                <option value="America/New_York">America/New_York (GMT-5)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (GMT-8)</option>
              </select>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-3 pt-6 border-t border-surface-200">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50 transition-colors shadow-lg shadow-primary-600/20"
            >
              {saving ? (
                <>Saving...</>
              ) : saved ? (
                <>
                  <Save className="h-4 w-4" /> Saved!
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}