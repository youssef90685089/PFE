import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { usersApi } from '../../api/axios';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { Plus, Edit2, X, Search, Trash2 } from 'lucide-react';

const ROLE_OPTIONS = ['ADMIN', 'MANAGER', 'RECEPTIONIST'];
const STATUS_OPTIONS = [
  { label: 'Active', value: true },
  { label: 'Inactive', value: false },
];

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', roles: ['CANDIDATE'], active: true });
  const [searchQuery, setSearchQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => { load(); }, []);

  const load = () =>
    usersApi
      .getAll()
      .then(r => setUsers(r.data?.data || []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));

  const toggleActive = async (id) => {
    try {
      await usersApi.toggleActive(id);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, active: !u.active } : u));
      toast.success('User status updated.');
    } catch {
      toast.error('Failed to toggle user status.');
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await usersApi.delete(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      if (selectedUser?.id === id) setSelectedUser(null);
      toast.success('User deleted successfully');
    } catch (error) {
      toast.error('Failed to delete user. Please try again.');
    } finally {
      setDeleteTarget(null);
    }
  };

  const filteredUsers = users.filter(user => {
    const query = searchQuery.toLowerCase();
    return (
      user.firstName?.toLowerCase().includes(query) ||
      user.lastName?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.roles?.some(r => r.toLowerCase().includes(query))
    );
  });

  const handleAddUser = () => {
    setFormData({ firstName: '', lastName: '', email: '', roles: ['CANDIDATE'], active: true });
    setShowAddModal(true);
  };

  const handleModifyUser = (user) => {
    const u = user || selectedUser;
    if (u) {
      setSelectedUser(u);
      setFormData({
        firstName: u.firstName || '',
        lastName: u.lastName || '',
        email: u.email || '',
        roles: u.roles || ['CANDIDATE'],
        active: u.active ?? true,
      });
      setShowModifyModal(true);
    }
  };

  /**
   * Create user — password is NOT sent; the backend auto-generates a secure
   * temporary password and emails it to the new user's address.
   */
  const handleSaveAdd = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast.error('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    // Omit password entirely — backend generates + emails it
    const { password: _omit, ...userData } = { ...formData, active: true, mustChangePassword: true };
    try {
      const res = await usersApi.create(userData);
      const newUser = res.data?.data || { ...userData, id: Date.now() };
      setUsers(prev => [newUser, ...prev]);
      setShowAddModal(false);
      toast.success(
        `✅ User created! A welcome email with login credentials has been sent to ${newUser.email}.`,
        { duration: 6000 }
      );
    } catch (error) {
      const msg = error?.response?.data?.message || 'Failed to create user.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveAddSubmit = (e) => {
    e.preventDefault();
    handleSaveAdd();
  };

  const handleSaveModify = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast.error('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    const payload = { ...formData };
    const updatedData = { ...payload, id: selectedUser.id };
    try {
      await usersApi.update(selectedUser.id, payload);
      setUsers(prev => prev.map(u => (u.id === selectedUser.id ? updatedData : u)));
      setShowModifyModal(false);
      setSelectedUser(null);
      toast.success('User updated successfully.');
    } catch (error) {
      const msg = error?.response?.data?.message || 'Failed to update user.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveModifySubmit = (e) => {
    e.preventDefault();
    handleSaveModify();
  };

  const columns = [
    { header: 'Name', render: (r) => <span className="font-medium text-surface-800">{r.firstName} {r.lastName}</span> },
    { header: 'Email', accessor: 'email' },
    { header: 'Role', render: (r) => <div className="flex gap-1">{(r.roles || []).map(role => <Badge key={role} status={role.replace('ROLE_', '')} />)}</div> },
    {
      header: '', render: (r) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); handleModifyUser(r); }}
            className="rounded-lg px-3 py-1 text-xs font-medium bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors"
          >
            <Edit2 className="h-3 w-3" />
          </button>
          <button
              onClick={(e) => { e.stopPropagation(); setDeleteTarget(r); }}
            className="rounded-lg px-3 py-1 text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      )
    },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-surface-900">User Management</h1>
            <p className="text-surface-500 mt-1">Manage system users and roles</p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2.5 text-sm rounded-xl border border-surface-200 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
            </div>
            <button
              onClick={handleAddUser}
              className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/20 hover:bg-primary-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add User
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-surface-200 p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-200">
                  {columns.map(col => (
                    <th key={col.header} className="text-left py-3 px-4 text-xs font-semibold text-surface-600 uppercase tracking-wide">
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr
                    key={user.id}
                    className="border-b border-surface-100 hover:bg-surface-50 transition-colors"
                  >
                    {columns.map(col => (
                      <td key={col.header} className="py-3 px-4 text-sm text-surface-800">
                        {col.render ? col.render(user) : user[col.accessor]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Add User Modal ───────────────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-surface-900">Add New User</h2>
                <p className="text-xs text-surface-400 mt-1">
                  A secure password will be auto-generated and emailed to the user.
                </p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-surface-400 hover:text-surface-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">First Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full rounded-xl border border-surface-200 px-4 py-2.5 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  placeholder="e.g. John"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Last Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full rounded-xl border border-surface-200 px-4 py-2.5 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  placeholder="e.g. Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Email <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-xl border border-surface-200 px-4 py-2.5 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  placeholder="user@example.com"
                />
              </div>

              {/* Password field intentionally removed — backend auto-generates & emails it */}

              {/* Auto-generated password notice */}
              <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
                <span className="text-lg">🔑</span>
                <p className="text-xs text-blue-700 leading-relaxed">
                  A <strong>secure temporary password</strong> will be auto-generated by the server and sent to the user's email address. The user will be prompted to change it on first login.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Role</label>
                <select
                  value={formData.roles[0] || 'CANDIDATE'}
                  onChange={e => setFormData({ ...formData, roles: [e.target.value] })}
                  className="w-full rounded-xl border border-surface-200 px-4 py-2.5 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                >
                  {ROLE_OPTIONS.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Status</label>
                <select
                  value={formData.active ? 'true' : 'false'}
                  onChange={e => setFormData({ ...formData, active: e.target.value === 'true' })}
                  className="w-full rounded-xl border border-surface-200 px-4 py-2.5 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                >
                  {STATUS_OPTIONS.map(opt => (
                    <option key={String(opt.value)} value={String(opt.value)}>{opt.label}</option>
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
                  type="button"
                  onClick={handleSaveAdd}
                  disabled={submitting}
                  className="flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-white hover:opacity-95 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#007EA7' }}
                >
                  {submitting ? 'Creating…' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit User Modal ──────────────────────────────────────────────── */}
      {showModifyModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-surface-900">Edit User</h2>
              <button onClick={() => setShowModifyModal(false)} className="text-surface-400 hover:text-surface-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModifySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full rounded-xl border border-surface-200 px-4 py-2.5 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={e => setFormData({ ...formData, lastName: e.target.value })}
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
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Role</label>
                <select
                  value={formData.roles[0] || 'CANDIDATE'}
                  onChange={e => setFormData({ ...formData, roles: [e.target.value] })}
                  className="w-full rounded-xl border border-surface-200 px-4 py-2.5 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                >
                  {ROLE_OPTIONS.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Status</label>
                <select
                  value={formData.active ? 'true' : 'false'}
                  onChange={e => setFormData({ ...formData, active: e.target.value === 'true' })}
                  className="w-full rounded-xl border border-surface-200 px-4 py-2.5 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                >
                  {STATUS_OPTIONS.map(opt => (
                    <option key={String(opt.value)} value={String(opt.value)}>{opt.label}</option>
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
                  disabled={submitting}
                  className="flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-white hover:opacity-95 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#007EA7' }}
                >
                  {submitting ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Delete User"
          message={`Are you sure you want to delete ${deleteTarget.firstName} ${deleteTarget.lastName}? This action cannot be undone.`}
          onConfirm={() => handleDeleteUser(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}
