import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { projectsApi } from '../../api/axios';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Plus } from 'lucide-react';

export default function MyProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', domain: '', technologyTags: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { load(); }, []);
  const load = () => projectsApi.getMy().then(r => setProjects(r.data?.data || [])).catch(console.error).finally(() => setLoading(false));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await projectsApi.create(form);
      setForm({ title: '', description: '', domain: '', technologyTags: '' });
      setShowForm(false);
      load();
      toast.success('Project idea submitted successfully');
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-surface-900">My Projects</h1>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 transition-colors">
          <Plus className="h-4 w-4" /> New Project
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-surface-200 bg-white p-6 space-y-4 animate-fade-in">
          <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required
            placeholder="Project Title" className="w-full rounded-xl border border-surface-200 px-4 py-2.5 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100" />
          <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} required rows={3}
            placeholder="Project Description" className="w-full rounded-xl border border-surface-200 px-4 py-2.5 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 resize-none" />
          <div className="grid grid-cols-2 gap-4">
            <input value={form.domain} onChange={e => setForm({...form, domain: e.target.value})}
              placeholder="Domain (e.g., Web Dev)" className="rounded-xl border border-surface-200 px-4 py-2.5 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100" />
            <input value={form.technologyTags} onChange={e => setForm({...form, technologyTags: e.target.value})}
              placeholder="Technologies (comma-separated)" className="rounded-xl border border-surface-200 px-4 py-2.5 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100" />
          </div>
          <button type="submit" disabled={submitting}
            className="rounded-xl bg-primary-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-600 disabled:opacity-50 transition-colors">
            {submitting ? 'Submitting...' : 'Submit Project'}
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map(p => (
          <div key={p.id} className="rounded-2xl border border-surface-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <h3 className="font-bold text-surface-800">{p.title}</h3>
              <Badge status={p.status} />
            </div>
            <p className="text-sm text-surface-500 mt-2 line-clamp-2">{p.description}</p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {(p.technologyTags || '').split(',').filter(Boolean).map(t => (
                <span key={t} className="rounded-md bg-surface-100 px-2 py-0.5 text-xs text-surface-600">{t.trim()}</span>
              ))}
            </div>
            {p.aiScore && <p className="mt-3 text-xs text-surface-400">AI Score: <span className="font-bold text-primary-600">{p.aiScore.toFixed(1)}</span></p>}
          </div>
        ))}
        {projects.length === 0 && <p className="text-surface-400 col-span-2 text-center py-12">No projects yet. Submit your first project idea!</p>}
      </div>
    </div>
  );
}
