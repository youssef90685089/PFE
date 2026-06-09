import { useEffect, useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { candidatesApi } from '../../api/axios';
import DataTable from '../../components/ui/DataTable';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import QuizSelectionModal from '../../components/QuizSelectionModal';
import { Send, UserCheck, FileText, Filter, Calendar, Edit2, Trash2, X } from 'lucide-react';

export default function CandidatesPage() {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(null);
  const [quizModal, setQuizModal] = useState(null); // candidate object when selecting quiz
  const [yearFilter, setYearFilter] = useState(''); // '' = all years
  const [editModal, setEditModal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const isManager = user?.roles?.includes('ROLE_MANAGER') || user?.roles?.includes('MANAGER');
  const isAdmin = user?.roles?.includes('ROLE_ADMIN') || user?.roles?.includes('ADMIN');
  const canInvite = isManager || isAdmin;

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    try {
      const r = await candidatesApi.getAll();
      setCandidates(r.data?.data || []);
    } catch (err) {
      toast.error('Failed to load candidates');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ── Collect all unique years from internship files ──────────
  const availableYears = useMemo(() => {
    const years = new Set();
    candidates.forEach(c => {
      (c.internshipFiles || []).forEach(f => {
        if (f.year) years.add(f.year);
      });
    });
    return Array.from(years).sort((a, b) => b - a); // newest first
  }, [candidates]);

  // ── Filter candidates by selected year ────────────────────
  const filteredCandidates = useMemo(() => {
    if (!yearFilter) return candidates;
    return candidates.filter(c =>
      (c.internshipFiles || []).some(f => String(f.year) === String(yearFilter))
    );
  }, [candidates, yearFilter]);

  const handleApproveAndSendQuiz = async (candidateId, quizId) => {
    setInviting(candidateId);
    try {
      const res = await candidatesApi.approveAndSendQuiz(candidateId, { quizId });
      if (res.data?.success) {
        toast.success('✓ Account created & quiz email sent!');
        await loadCandidates();
      } else {
        toast.error(res.data?.message || 'Failed to approve candidate');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to approve candidate';
      toast(msg, { icon: '⚠️', duration: 8000, style: { background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: '12px', padding: '14px 18px', fontSize: '14px', fontWeight: 500 } });
    } finally {
      setInviting(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await candidatesApi.delete(deleteConfirm.id);
      toast.success('Candidate deleted successfully');
      setDeleteConfirm(null);
      loadCandidates();
    } catch (err) {
      toast.error('Failed to delete candidate');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editModal) return;
    try {
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData.entries());
      data.hasUserAccount = data.hasUserAccount === 'true';
      await candidatesApi.update(editModal.id, data);
      toast.success('Candidate updated successfully');
      setEditModal(null);
      loadCandidates();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update candidate');
    }
  };

  const columns = [
    {
      header: 'Name',
      accessor: (r) => `${r.firstName || ''} ${r.lastName || ''}`,
      render: (r) => <span className="font-medium text-surface-800">{r.firstName} {r.lastName}</span>,
    },
    { header: 'Email', accessor: 'email' },
    {
      header: 'Phone',
      accessor: (r) => r.phone || '—',
    },
    {
      header: 'Account',
      accessor: 'hasUserAccount',
      render: (r) => r.hasUserAccount ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 border border-green-200">
          <UserCheck className="h-3 w-3" /> Active
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2 py-0.5 text-xs font-medium text-yellow-700 border border-yellow-200">
          Pending
        </span>
      ),
    },
    {
      header: 'Quiz Result',
      accessor: (r) => r.quizPassed == null ? 'not taken' : r.quizPassed ? 'passed' : 'failed',
      render: (r) => {
        if (!r.hasUserAccount || r.quizPassed == null) {
          return <span className="text-xs text-surface-400 italic">—</span>;
        }
        if (r.quizPassed) {
          return (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
              ✓ Passed {r.quizScore != null ? `(${r.quizScore}%)` : ''}
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700 border border-red-200">
            ✗ Failed {r.quizScore != null ? `(${r.quizScore}%)` : ''}
          </span>
        );
      },
    },
    {
      header: 'Files',
      accessor: (r) => r.internshipFiles?.length || 0,
      render: (r) => {
        const count = r.internshipFiles?.length || 0;
        return (
          <span className={`inline-flex items-center gap-1 text-xs font-medium ${count > 0 ? 'text-emerald-700' : 'text-red-500'}`}>
            <FileText className="h-3 w-3" />
            {count} file{count !== 1 ? 's' : ''}
          </span>
        );
      },
    },
    {
      header: 'Year',
      accessor: (r) => {
        const years = (r.internshipFiles || []).map(f => f.year).filter(Boolean);
        return years.length > 0 ? Math.max(...years) : '—';
      },
      render: (r) => {
        const years = (r.internshipFiles || []).map(f => f.year).filter(Boolean);
        if (years.length === 0) return <span className="text-xs text-surface-400">—</span>;
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-surface-600 bg-surface-100 rounded-full px-2 py-0.5">
            <Calendar className="h-3 w-3" />
            {Math.max(...years)}
          </span>
        );
      },
    },
    ...(canInvite ? [{
      header: 'Action',
      accessor: 'id',
      render: (r) => {
        const hasFiles = (r.internshipFiles?.length || 0) > 0;
        return (
          <div className="flex items-center gap-2">
            {!r.hasUserAccount ? (
              <div className="relative group/btn inline-block">
                <button
                  onClick={() => hasFiles && setQuizModal(r)}
                  disabled={inviting === r.id || !hasFiles}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold transition-all shadow-sm whitespace-nowrap
                    ${hasFiles
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer'
                      : 'bg-surface-200 text-surface-400 cursor-not-allowed opacity-70'
                    }`}
                  title={!hasFiles ? 'Cannot send quiz: candidate has no internship file' : 'Select quiz, approve & send invitation'}
                >
                  {inviting === r.id ? (
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                  Approve
                </button>
              </div>
            ) : (
              <span className="text-xs text-surface-400 italic">Approved ✓</span>
            )}
            <button
              onClick={() => setEditModal(r)}
              className="p-1.5 text-surface-500 hover:bg-surface-100 hover:text-primary-600 rounded-lg transition-colors"
              title="Edit candidate"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setDeleteConfirm(r)}
              className="p-1.5 text-surface-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
              title="Delete candidate"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        );
      },
    }] : []),
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Candidates</h1>
          <p className="text-surface-500 mt-1">
            {filteredCandidates.length} candidate{filteredCandidates.length !== 1 ? 's' : ''}
            {yearFilter ? ` for year ${yearFilter}` : ` (${candidates.length} total)`}
          </p>
        </div>

        {/* Year Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-surface-400" />
          <label className="text-sm font-medium text-surface-600" htmlFor="year-filter">
            Filter by year:
          </label>
          <select
            id="year-filter"
            value={yearFilter}
            onChange={e => setYearFilter(e.target.value)}
            className="rounded-xl border border-surface-200 bg-white px-3 py-2 text-sm text-surface-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
          >
            <option value="">All years</option>
            {availableYears.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          {yearFilter && (
            <button
              onClick={() => setYearFilter('')}
              className="text-xs text-primary-600 font-medium hover:underline"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredCandidates}
        searchPlaceholder="Search candidates..."
      />

      {quizModal && (
        <QuizSelectionModal
          candidate={quizModal}
          onClose={() => setQuizModal(null)}
          onSelect={(quizId) => {
            const cid = quizModal.id;
            setQuizModal(null);
            handleApproveAndSendQuiz(cid, quizId);
          }}
          onSkip={() => {
            const cid = quizModal.id;
            setQuizModal(null);
            handleApproveAndSendQuiz(cid, null);
          }}
        />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-surface-900 mb-2">Delete Candidate</h3>
            <p className="text-surface-600 mb-6 text-sm">
              Are you sure you want to delete <strong>{deleteConfirm.firstName} {deleteConfirm.lastName}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-surface-600 hover:bg-surface-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-surface-900">Edit Candidate</h3>
              <button onClick={() => setEditModal(null)} className="p-1 text-surface-400 hover:text-surface-600 rounded-lg hover:bg-surface-100 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-surface-700">First Name</label>
                  <input name="firstName" defaultValue={editModal.firstName} required className="w-full rounded-xl border border-surface-200 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-surface-700">Last Name</label>
                  <input name="lastName" defaultValue={editModal.lastName} required className="w-full rounded-xl border border-surface-200 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-surface-700">Email</label>
                <input name="email" type="email" defaultValue={editModal.email} required className="w-full rounded-xl border border-surface-200 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-surface-700">Phone</label>
                  <input name="phone" defaultValue={editModal.phone} className="w-full rounded-xl border border-surface-200 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-surface-700">CIN</label>
                  <input name="cin" defaultValue={editModal.cin} className="w-full rounded-xl border border-surface-200 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-surface-700">Account Status</label>
                <select name="hasUserAccount" defaultValue={editModal.hasUserAccount ? "true" : "false"} className="w-full rounded-xl border border-surface-200 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all">
                  <option value="true">Approved (Active User Account)</option>
                  <option value="false">Pending (No User Account)</option>
                </select>
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setEditModal(null)} className="rounded-xl px-4 py-2 text-sm font-semibold text-surface-600 hover:bg-surface-100 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 transition-colors shadow-sm">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
