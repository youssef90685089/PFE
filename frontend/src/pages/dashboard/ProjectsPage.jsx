import { useEffect, useState } from 'react';
import { projectsApi } from '../../api/axios';
import DataTable from '../../components/ui/DataTable';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);
  const load = () => projectsApi.getAll().then(r => setProjects(r.data?.data || [])).catch(console.error).finally(() => setLoading(false));

  const columns = [
    { header: 'Title', accessor: 'title', render: (r) => <span className="font-medium text-surface-800">{r.title}</span> },
    { header: 'Domain', accessor: (r) => r.domain || '—' },
    { header: 'Submitted By', accessor: (r) => r.submittedByName || '—' },
    { header: 'Supervisor', accessor: (r) => r.supervisorName || 'Unassigned' },
    { header: 'AI Score', render: (r) => r.aiScore ? <span className="font-mono text-sm font-medium text-primary-600">{r.aiScore.toFixed(1)}</span> : '—' },
    { header: 'Status', render: (r) => <Badge status={r.status} /> },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Projects</h1>
        <p className="text-surface-500 mt-1">{projects.length} project ideas submitted</p>
      </div>
      <DataTable columns={columns} data={projects} searchPlaceholder="Search projects..." />
    </div>
  );
}
