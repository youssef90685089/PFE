import { useEffect, useState } from 'react';
import { projectsApi } from '../../api/axios';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function MyProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);
  const load = () => projectsApi.getMy().then(r => setProjects(r.data?.data || [])).catch(console.error).finally(() => setLoading(false));

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">My Projects</h1>
        <p className="text-surface-500 mt-1">Projects you submitted as a candidate</p>
      </div>

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
        {projects.length === 0 && <p className="text-surface-400 col-span-2 text-center py-12">No projects submitted yet.</p>}
      </div>
    </div>
  );
}
