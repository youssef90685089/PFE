import { useEffect, useState } from 'react';
import { candidatesApi } from '../../api/axios';
import DataTable from '../../components/ui/DataTable';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    candidatesApi.getAll().then(r => setCandidates(r.data?.data || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  const columns = [
    { header: 'Name', accessor: 'fullName', render: (r) => <span className="font-medium text-surface-800">{r.fullName}</span> },
    { header: 'Email', accessor: 'email' },
    { header: 'University', accessor: (r) => r.university || '—' },
    { header: 'Degree', accessor: (r) => r.degree || '—' },
    { header: 'Skills', render: (r) => (
      <div className="flex flex-wrap gap-1 max-w-xs">
        {(r.skillsTags || '').split(',').filter(Boolean).slice(0, 4).map(s => (
          <span key={s} className="rounded-md bg-primary-50 px-1.5 py-0.5 text-[10px] font-medium text-primary-700">{s.trim()}</span>
        ))}
      </div>
    )},
    { header: 'Year', accessor: (r) => r.graduationYear || '—' },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Candidates</h1>
        <p className="text-surface-500 mt-1">{candidates.length} registered candidates</p>
      </div>
      <DataTable columns={columns} data={candidates} searchPlaceholder="Search candidates..." />
    </div>
  );
}
