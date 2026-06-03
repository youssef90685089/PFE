import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { projectsApi } from '../../api/axios';
import DataTable from '../../components/ui/DataTable';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Plus, X, Save } from 'lucide-react';

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    technologyTags: '' // Treated as "Language / Tech"
  });

  const isManager = user?.roles?.includes('ROLE_MANAGER') || user?.roles?.includes('MANAGER');
  const isAdmin = user?.roles?.includes('ROLE_ADMIN') || user?.roles?.includes('ADMIN');
  const canAddProject = isManager || isAdmin;

  useEffect(() => { load(); }, []);

  const load = () => projectsApi.getAll()
    .then(r => setProjects(r.data?.data || []))
    .catch(console.error)
    .finally(() => setLoading(false));

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await projectsApi.create({
        title: projectForm.title,
        description: projectForm.description,
        technologyTags: projectForm.technologyTags
      });
      toast.success('Project added successfully');
      setShowAddModal(false);
      setProjectForm({ title: '', description: '', technologyTags: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add project');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { header: 'Title', accessor: 'title', render: (r) => <span className="font-medium text-surface-800">{r.title}</span> },
    { header: 'Language / Tech', accessor: (r) => r.technologyTags || '—' },
    { header: 'Submitted By', accessor: (r) => r.submittedByName || '—' },
    { header: 'Supervisor', accessor: (r) => r.supervisorName || 'Unassigned' },
    { header: 'AI Score', render: (r) => r.aiScore ? <span className="font-mono text-sm font-medium text-primary-600">{r.aiScore.toFixed(1)}</span> : '—' },
    { header: 'Status', render: (r) => <Badge status={r.status} /> },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Projects Configuration</h1>
          <p className="text-surface-500 mt-1">{projects.length} project(s) available in the system</p>
        </div>
        {canAddProject && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md transition-all"
          >
            <Plus className="h-4 w-4" />
            Add Project
          </button>
        )}
      </div>

      <DataTable columns={columns} data={projects} searchPlaceholder="Search projects..." />

      {/* ── Add Project Modal ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col animate-scale-up">
            <div className="p-5 border-b border-surface-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-surface-900">Add New Project</h2>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 hover:bg-surface-100 rounded-full transition-colors">
                <X className="h-5 w-5 text-surface-400" />
              </button>
            </div>
            
            <form onSubmit={handleCreateProject} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-surface-700 mb-1">Project Title *</label>
                <input required type="text" value={projectForm.title} onChange={e => setProjectForm(f => ({...f, title: e.target.value}))}
                  placeholder="e.g. E-commerce Mobile App"
                  className="w-full rounded-xl border border-surface-200 px-4 py-2.5 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all" />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-surface-700 mb-1">Language / Technology *</label>
                <input required type="text" value={projectForm.technologyTags} onChange={e => setProjectForm(f => ({...f, technologyTags: e.target.value}))}
                  placeholder="e.g. React, Node.js, Python"
                  className="w-full rounded-xl border border-surface-200 px-4 py-2.5 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all" />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-surface-700 mb-1">Description *</label>
                <textarea required value={projectForm.description} onChange={e => setProjectForm(f => ({...f, description: e.target.value}))}
                  placeholder="Detailed description of the project..." rows={4}
                  className="w-full rounded-xl border border-surface-200 px-4 py-2.5 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all resize-none" />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 text-sm font-semibold text-surface-600 hover:bg-surface-100 rounded-xl transition-all border border-surface-200">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 rounded-xl transition-all disabled:opacity-50 shadow-md shadow-primary-500/20">
                  {submitting ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <><Save className="h-4 w-4" /> Save Project</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
