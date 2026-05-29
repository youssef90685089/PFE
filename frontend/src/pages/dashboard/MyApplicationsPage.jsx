import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { applicationsApi, projectsApi, supervisorsApi } from '../../api/axios';
import DataTable from '../../components/ui/DataTable';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Plus, Upload, X, FileText, ChevronDown } from 'lucide-react';

export default function MyApplicationsPage() {
  const [apps, setApps] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ projectId: '', coverLetter: '' });
  const [cvFile, setCvFile] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const [appRes, projRes] = await Promise.all([
        applicationsApi.getMy(),
        projectsApi.getAll()
      ]);
      setApps(appRes.data?.data || []);
      setProjects(projRes.data?.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const body = {};
      if (form.projectId) body.projectId = parseInt(form.projectId);

      await applicationsApi.create(body);
      setForm({ projectId: '', coverLetter: '' });
      setCvFile(null);
      setShowForm(false);
      load();
      toast.success('Application submitted successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally { setSubmitting(false); }
  };

  // Status stepper for tracking application progress
  const STATUS_STEPS = ['PENDING', 'UNDER_REVIEW', 'QUIZ_PENDING', 'QUIZ_COMPLETED', 'AI_EVALUATING', 'MANAGER_REVIEW'];
  const getStatusIndex = (status) => {
    if (status === 'ACCEPTED' || status === 'REJECTED') return STATUS_STEPS.length;
    return STATUS_STEPS.indexOf(status);
  };

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Project', accessor: (r) => r.projectTitle || 'General Application' },
    { header: 'Supervisor', accessor: (r) => r.supervisorName || 'Unassigned' },
    { header: 'Status', render: (r) => <Badge status={r.status} /> },
    { header: 'Submitted', render: (r) => new Date(r.createdAt).toLocaleDateString() },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">My Applications</h1>
          <p className="text-surface-500 mt-1">{apps.length} application{apps.length !== 1 ? 's' : ''} submitted</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-600 transition-all shadow-sm shadow-primary-500/25">
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? 'Cancel' : 'New Application'}
        </button>
      </div>

      {/* Application Submission Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-surface-200 bg-white p-6 space-y-5 shadow-sm animate-fade-in">
          <h3 className="text-lg font-bold text-surface-800">Submit New Application</h3>

          {/* Project Selection */}
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Select Project (Optional)</label>
            <div className="relative">
              <select value={form.projectId} onChange={e => setForm({...form, projectId: e.target.value})}
                className="w-full appearance-none rounded-xl border border-surface-200 bg-white px-4 py-2.5 pr-10 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all">
                <option value="">General Application (no specific project)</option>
                {projects.filter(p => p.status === 'APPROVED' || p.status === 'SUBMITTED').map(p => (
                  <option key={p.id} value={p.id}>{p.title} — {p.domain || 'No domain'}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400 pointer-events-none" />
            </div>
          </div>

          {/* Cover Letter / Motivation */}
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Cover Letter / Motivation</label>
            <textarea value={form.coverLetter} onChange={e => setForm({...form, coverLetter: e.target.value})}
              rows={4} placeholder="Tell us why you're interested in this internship..."
              className="w-full rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all resize-none" />
          </div>

          {/* CV Upload */}
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Upload CV (Optional)</label>
            <div className="relative">
              <input type="file" accept=".pdf,.doc,.docx" onChange={e => setCvFile(e.target.files[0])}
                className="hidden" id="cv-upload" />
              <label htmlFor="cv-upload"
                className="flex items-center gap-3 rounded-xl border-2 border-dashed border-surface-300 p-4 cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition-all">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-100 text-surface-500">
                  {cvFile ? <FileText className="h-5 w-5 text-primary-600" /> : <Upload className="h-5 w-5" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-surface-700">{cvFile ? cvFile.name : 'Click to upload your CV'}</p>
                  <p className="text-xs text-surface-400">{cvFile ? `${(cvFile.size / 1024).toFixed(1)} KB` : 'PDF, DOC up to 10MB'}</p>
                </div>
              </label>
              {cvFile && (
                <button type="button" onClick={() => setCvFile(null)}
                  className="absolute top-2 right-2 rounded-lg bg-surface-100 p-1 hover:bg-red-50 hover:text-red-500 transition-colors">
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <button type="submit" disabled={submitting}
              className="rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 transition-all">
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="rounded-xl bg-surface-100 px-4 py-2.5 text-sm font-medium text-surface-600 hover:bg-surface-200 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Application Progress Stepper (for most recent application) */}
      {apps.length > 0 && (
        <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-surface-500 uppercase tracking-wider mb-4">Latest Application Progress</h3>
          <div className="flex items-center justify-between overflow-x-auto gap-1">
            {STATUS_STEPS.map((step, idx) => {
              const current = getStatusIndex(apps[0].status);
              const isCurrent = idx === current;
              const isCompleted = idx < current;
              return (
                <div key={step} className="flex-1 min-w-0">
                  <div className="flex items-center">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all ${
                      isCompleted ? 'bg-primary-500 text-white' :
                      isCurrent ? 'bg-primary-500 text-white ring-4 ring-primary-100 animate-pulse-subtle' :
                      'bg-surface-200 text-surface-400'
                    }`}>{isCompleted ? '✓' : idx + 1}</div>
                    {idx < STATUS_STEPS.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-1 ${isCompleted ? 'bg-primary-500' : 'bg-surface-200'}`} />
                    )}
                  </div>
                  <p className={`text-[10px] mt-1.5 truncate ${isCurrent ? 'font-bold text-primary-700' : 'text-surface-400'}`}>
                    {step.replace(/_/g, ' ')}
                  </p>
                </div>
              );
            })}
            {/* Final Decision */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  apps[0].status === 'ACCEPTED' ? 'bg-emerald-500 text-white' :
                  apps[0].status === 'REJECTED' ? 'bg-red-500 text-white' :
                  'bg-surface-200 text-surface-400'
                }`}>{apps[0].status === 'ACCEPTED' ? '✓' : apps[0].status === 'REJECTED' ? '✗' : '7'}</div>
              </div>
              <p className={`text-[10px] mt-1.5 font-bold ${
                apps[0].status === 'ACCEPTED' ? 'text-emerald-600' :
                apps[0].status === 'REJECTED' ? 'text-red-600' :
                'text-surface-400'
              }`}>DECISION</p>
            </div>
          </div>
        </div>
      )}

      <DataTable columns={columns} data={apps} emptyMessage="No applications yet. Submit your first application!" />
    </div>
  );
}
