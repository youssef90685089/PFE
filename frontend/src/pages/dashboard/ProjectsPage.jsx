import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { projectsApi } from '../../api/axios';
import DataTable from '../../components/ui/DataTable';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { Plus, X, Save, Edit, Trash2 } from 'lucide-react';

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    technologyTags: '' // Treated as "Language / Tech"
  });

  const isManager = user?.roles?.includes('ROLE_MANAGER') || user?.roles?.includes('MANAGER');
  const isAdmin = user?.roles?.includes('ROLE_ADMIN') || user?.roles?.includes('ADMIN');
  const canManageProject = isManager || isAdmin;

  useEffect(() => { load(); }, []);

  const load = () => projectsApi.getAll()
    .then(r => setProjects(r.data?.data || []))
    .catch(console.error)
    .finally(() => setLoading(false));

  const openAddModal = () => {
    setEditingId(null);
    setProjectForm({ title: '', description: '', technologyTags: '' });
    setShowAddModal(true);
  };

  const openEditModal = (project) => {
    setEditingId(project.id);
    setProjectForm({
      title: project.title || '',
      description: project.description || '',
      technologyTags: project.technologyTags || ''
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await projectsApi.delete(id);
      toast.success('Project deleted successfully');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete project');
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleSubmitProject = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        title: projectForm.title,
        description: projectForm.description,
        technologyTags: projectForm.technologyTags
      };

      if (editingId) {
        await projectsApi.update(editingId, payload);
        toast.success('Project updated successfully');
      } else {
        await projectsApi.create(payload);
        toast.success('Project added successfully');
      }
      
      setShowAddModal(false);
      setProjectForm({ title: '', description: '', technologyTags: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save project');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { header: 'Title', accessor: 'title', render: (r) => <span className="font-medium text-surface-800">{r.title}</span> },
    { header: 'Language', accessor: (r) => r.technologyTags || '—' },
    { header: 'Description', accessor: (r) => r.description ? <span className="text-surface-500 line-clamp-2 max-w-[250px]">{r.description}</span> : '—' },
    { header: 'Submitted By', accessor: (r) => r.submittedByName || '—' },
  ];

  if (canManageProject) {
    columns.push({
      header: 'Actions',
      accessor: 'id',
      render: (r) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => openEditModal(r)}
            className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            title="Edit Project"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button 
            onClick={() => setDeleteTarget(r)}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete Project"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    });
  }

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-surface-900">Projects Configuration</h1>
            <p className="text-surface-500 mt-1">{projects.length} project(s) available in the system</p>
          </div>
          {canManageProject && (
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md transition-all"
            >
              <Plus className="h-4 w-4" />
              Add Project
            </button>
          )}
        </div>

        <DataTable columns={columns} data={projects} searchPlaceholder="Search projects..." />

        {/* ── Add/Edit Project Modal ── */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col animate-scale-up">
              <div className="p-5 border-b border-surface-100 flex items-center justify-between">
                <h2 className="text-lg font-bold text-surface-900">
                  {editingId ? 'Edit Project' : 'Add New Project'}
                </h2>
                <button onClick={() => setShowAddModal(false)} className="p-1.5 hover:bg-surface-100 rounded-full transition-colors">
                  <X className="h-5 w-5 text-surface-400" />
                </button>
              </div>
              
              <form onSubmit={handleSubmitProject} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-surface-700 mb-1">Project Title *</label>
                  <input required type="text" value={projectForm.title} onChange={e => setProjectForm(f => ({...f, title: e.target.value}))}
                    placeholder="e.g. E-commerce Mobile App"
                    className="w-full rounded-xl border border-surface-200 px-4 py-2.5 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all" />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-surface-700 mb-1">Language / Tech *</label>
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
                    {submitting ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <><Save className="h-4 w-4" /> {editingId ? 'Update Project' : 'Save Project'}</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {deleteTarget && (
        <ConfirmModal
          title="Delete Project"
          message={`Are you sure you want to delete the project "${deleteTarget.title}"? This action cannot be undone.`}
          onConfirm={() => handleDelete(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}
