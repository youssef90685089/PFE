import { useEffect, useState } from 'react';
import { supervisorsApi } from '../../api/axios';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Plus, Edit2, X, Trash2, Search } from 'lucide-react';

const STATUS_OPTIONS = [
  { label: 'Active', value: true },
  { label: 'Inactive', value: false },
];

export default function SupervisorsPage() {
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [selectedSupervisor, setSelectedSupervisor] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    department: '',
    expertiseTags: '',
    maxInterns: 0,
    active: true,
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { load(); }, []);

  const load = () =>
    supervisorsApi.getAll()
      .then(r => setSupervisors(r.data?.data || []))
      .catch(() => setSupervisors([]))
      .finally(() => setLoading(false));

  const filteredSupervisors = supervisors.filter(supervisor => {
    const query = searchQuery.toLowerCase();
    return (
      supervisor.fullName?.toLowerCase().includes(query) ||
      supervisor.department?.toLowerCase().includes(query) ||
      supervisor.expertiseTags?.toLowerCase().includes(query) ||
      supervisor.email?.toLowerCase().includes(query)
    );
  });

  const toggleActive = async (id) => {
    const supervisor = supervisors.find(s => s.id === id);
    if (supervisor) {
      try {
        await supervisorsApi.update(id, { ...supervisor, active: !supervisor.active });
        setSupervisors(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
      } catch (error) {
        alert('Failed to toggle status');
      }
    }
  };

  const handleDeleteSupervisor = async (id) => {
    if (!window.confirm('Are you sure you want to delete this supervisor?')) return;
    try {
      await supervisorsApi.delete(id);
      setSupervisors(prev => prev.filter(s => s.id !== id));
      if (selectedSupervisor?.id === id) setSelectedSupervisor(null);
    } catch (error) {
      alert('Failed to delete supervisor. Please try again.');
    }
  };

  const handleAddSupervisor = () => {
    setFormData({
      fullName: '',
      email: '',
      department: '',
      expertiseTags: '',
      maxInterns: 0,
      active: true,
    });
    setShowAddModal(true);
  };

  const handleModifySupervisor = () => {
    if (selectedSupervisor) {
      setFormData({
        fullName: selectedSupervisor.fullName,
        email: selectedSupervisor.email || '',
        department: selectedSupervisor.department,
        expertiseTags: selectedSupervisor.expertiseTags || '',
        maxInterns: selectedSupervisor.maxInterns,
        active: selectedSupervisor.active,
      });
      setShowModifyModal(true);
    }
  };

  const handleModifySupervisorRow = (supervisor) => {
    setFormData({
      fullName: supervisor.fullName,
      email: supervisor.email || '',
      department: supervisor.department,
      expertiseTags: supervisor.expertiseTags || '',
      maxInterns: supervisor.maxInterns,
      active: supervisor.active,
    });
    setSelectedSupervisor(supervisor);
    setShowModifyModal(true);
  };

  const handleSaveAdd = async (e) => {
    e.preventDefault();
    console.log('Creating supervisor with data:', formData);
    
    if (!formData.fullName || !formData.email || !formData.department) {
      alert('Please fill in all required fields');
      return;
    }
    
    const supervisorData = { 
      ...formData, 
      active: true,
      currentInterns: 0
    };
    
    try {
      const res = await supervisorsApi.create(supervisorData);
      console.log('Create response:', res);
      
      const newSupervisor = res.data?.data || { 
        ...supervisorData, 
        id: Date.now(), 
        currentInterns: 0 
      };
      
      setSupervisors(prev => [newSupervisor, ...prev]);
      setShowAddModal(false);
      alert(`Supervisor created successfully!\n\nEmail: ${newSupervisor.email}`);
    } catch (error) {
      console.error('Error creating supervisor:', error);
      alert('Failed to create supervisor. Please try again.');
    }
  };

  const handleSaveModify = async () => {
    if (!formData.fullName || !formData.email || !formData.department) {
      alert('Please fill in all required fields');
      return;
    }
    const updatedData = { ...formData, id: selectedSupervisor.id };
    try {
      await supervisorsApi.update(selectedSupervisor.id, formData);
      setSupervisors(prev => prev.map(s => (s.id === selectedSupervisor.id ? updatedData : s)));
      setShowModifyModal(false);
      setSelectedSupervisor(null);
    } catch (error) {
      alert('Failed to update supervisor. Please try again.');
    }
  };

  const handleSaveModifySubmit = (e) => {
    e.preventDefault();
    handleSaveModify();
  };

  const handleSelectSupervisor = (supervisor) => {
    setSelectedSupervisor(selectedSupervisor?.id === supervisor.id ? null : supervisor);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-surface-900">Supervisors</h1>
            <p className="text-surface-500 mt-1">{supervisors.length} supervisors registered</p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
              <input
                type="text"
                placeholder="Search supervisors..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2.5 text-sm rounded-xl border border-surface-200 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
            </div>
            <button
              onClick={handleAddSupervisor}
              className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/20 hover:bg-primary-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Supervisor
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-surface-200 p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-200">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-surface-600 uppercase tracking-wide">Name</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-surface-600 uppercase tracking-wide">Department</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-surface-600 uppercase tracking-wide">Expertise</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-surface-600 uppercase tracking-wide">Capacity</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-surface-600 uppercase tracking-wide"></th>
                </tr>
              </thead>
              <tbody>
                {filteredSupervisors.map(supervisor => (
                  <tr
                    key={supervisor.id}
                    onClick={() => handleSelectSupervisor(supervisor)}
                    className={`border-b border-surface-100 cursor-pointer transition-colors ${selectedSupervisor?.id === supervisor.id ? 'bg-primary-50' : 'hover:bg-surface-50'}`}
                  >
                    <td className="py-3 px-4 text-sm font-medium text-surface-800">{supervisor.fullName}</td>
                    <td className="py-3 px-4 text-sm text-surface-700">{supervisor.department}</td>
                    <td className="py-3 px-4 text-sm">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {(supervisor.expertiseTags || '')
                          .split(',')
                          .filter(Boolean)
                          .slice(0, 4)
                          .map(t => (
                            <span key={t} className="rounded-md bg-primary-50 px-1.5 py-0.5 text-[10px] font-medium text-primary-700">
                              {t.trim()}
                            </span>
                          ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-surface-700">{supervisor.currentInterns || 0}/{supervisor.maxInterns}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleModifySupervisorRow(supervisor);
                        }}
                        className="rounded-lg px-3 py-1 text-xs font-medium bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {supervisors.length === 0 && (
              <div className="text-center py-12 text-surface-500">
                No supervisors registered
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Supervisor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-surface-900">Add New Supervisor</h2>
              <button onClick={() => setShowAddModal(false)} className="text-surface-400 hover:text-surface-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full rounded-xl border border-surface-200 px-4 py-2.5 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-xl border border-surface-200 px-4 py-2.5 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  placeholder="Enter email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Department</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={e => setFormData({ ...formData, department: e.target.value })}
                  className="w-full rounded-xl border border-surface-200 px-4 py-2.5 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  placeholder="Enter department"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Expertise (comma separated)</label>
                <input
                  type="text"
                  value={formData.expertiseTags}
                  onChange={e => setFormData({ ...formData, expertiseTags: e.target.value })}
                  className="w-full rounded-xl border border-surface-200 px-4 py-2.5 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  placeholder="e.g., Java, Python, UI Design"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Max Interns</label>
                <input
                  type="number"
                  value={formData.maxInterns}
                  onChange={e => setFormData({ ...formData, maxInterns: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-xl border border-surface-200 px-4 py-2.5 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Status</label>
                <select
                  value={formData.active ? 'true' : 'false'}
                  onChange={e => setFormData({ ...formData, active: e.target.value === 'true' })}
                  className="w-full rounded-xl border border-surface-200 px-4 py-2.5 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                >
                  {STATUS_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 rounded-xl border border-surface-200 px-4 py-2.5 text-sm font-semibold text-surface-700 hover:bg-surface-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-white hover:opacity-95 transition-colors"
                  style={{ backgroundColor: '#007EA7' }}
                >
                  Create Supervisor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modify Supervisor Modal */}
      {showModifyModal && selectedSupervisor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-surface-900">Modify Supervisor</h2>
              <button onClick={() => setShowModifyModal(false)} className="text-surface-400 hover:text-surface-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModifySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full rounded-xl border border-surface-200 px-4 py-2.5 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-xl border border-surface-200 px-4 py-2.5 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Department</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={e => setFormData({ ...formData, department: e.target.value })}
                  className="w-full rounded-xl border border-surface-200 px-4 py-2.5 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Expertise (comma separated)</label>
                <input
                  type="text"
                  value={formData.expertiseTags}
                  onChange={e => setFormData({ ...formData, expertiseTags: e.target.value })}
                  className="w-full rounded-xl border border-surface-200 px-4 py-2.5 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  placeholder="e.g., Java, Python, UI Design"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Max Interns</label>
                <input
                  type="number"
                  value={formData.maxInterns}
                  onChange={e => setFormData({ ...formData, maxInterns: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-xl border border-surface-200 px-4 py-2.5 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Status</label>
                <select
                  value={formData.active ? 'true' : 'false'}
                  onChange={e => setFormData({ ...formData, active: e.target.value === 'true' })}
                  className="w-full rounded-xl border border-surface-200 px-4 py-2.5 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                >
                  {STATUS_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setShowModifyModal(false)}
                  className="flex-1 rounded-xl border border-surface-200 px-4 py-2.5 text-sm font-semibold text-surface-700 hover:bg-surface-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-white hover:opacity-95 transition-colors"
                  style={{ backgroundColor: '#007EA7' }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
