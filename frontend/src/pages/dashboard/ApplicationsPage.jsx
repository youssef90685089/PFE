import { useEffect, useState } from 'react';
import { applicationsApi, supervisorsApi } from '../../api/axios';
import DataTable from '../../components/ui/DataTable';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { X, UserCheck, MessageSquare, ChevronDown } from 'lucide-react';

export default function ApplicationsPage() {
  const [apps, setApps] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [updating, setUpdating] = useState(null);

  // Modal state for supervisor assignment
  const [assignModal, setAssignModal] = useState(null);
  const [selectedSupervisor, setSelectedSupervisor] = useState('');

  // Modal state for manager notes
  const [notesModal, setNotesModal] = useState(null);
  const [managerNotes, setManagerNotes] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const [appRes, supRes] = await Promise.all([
        applicationsApi.getAll(),
        supervisorsApi.getActive()
      ]);
      setApps(appRes.data?.data || []);
      setSupervisors(supRes.data?.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleStatusChange = async (id, status, notes) => {
    setUpdating(id);
    try {
      const body = { status };
      if (notes) body.managerNotes = notes;
      await applicationsApi.updateStatus(id, body);
      load();
      setNotesModal(null);
    } catch (e) { alert(e.response?.data?.message || 'Failed to update'); }
    finally { setUpdating(null); }
  };

  const handleAssignSupervisor = async () => {
    if (!assignModal || !selectedSupervisor) return;
    setUpdating(assignModal);
    try {
      await applicationsApi.assignSupervisor(assignModal, { supervisorId: parseInt(selectedSupervisor) });
      setAssignModal(null);
      setSelectedSupervisor('');
      load();
    } catch (e) { alert(e.response?.data?.message || 'Failed to assign'); }
    finally { setUpdating(null); }
  };

  const handleDecision = (id, decision) => {
    // Open notes modal for accept/reject
    setNotesModal({ id, decision });
    setManagerNotes('');
  };

  const submitDecision = () => {
    if (!notesModal) return;
    handleStatusChange(notesModal.id, notesModal.decision, managerNotes);
  };

  const STATUSES = ['ALL','PENDING','UNDER_REVIEW','QUIZ_PENDING','QUIZ_COMPLETED','AI_EVALUATING','MANAGER_REVIEW','ACCEPTED','REJECTED'];
  const filtered = statusFilter === 'ALL' ? apps : apps.filter(a => a.status === statusFilter);

  // Stat counts
  const counts = {};
  STATUSES.forEach(s => { counts[s] = s === 'ALL' ? apps.length : apps.filter(a => a.status === s).length; });

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Candidate', render: (r) => (
      <div>
        <p className="font-medium text-surface-800">{r.candidateName}</p>
        <p className="text-xs text-surface-400">{r.candidateEmail}</p>
      </div>
    )},
    { header: 'Project', accessor: (r) => r.projectTitle || '—' },
    { header: 'Supervisor', render: (r) => (
      <div className="flex items-center gap-2">
        <span className="text-sm">{r.supervisorName || '—'}</span>
        {!r.supervisorId && (
          <button onClick={() => { setAssignModal(r.id); setSelectedSupervisor(''); }}
            className="rounded-lg bg-primary-50 px-2 py-1 text-[10px] font-medium text-primary-700 hover:bg-primary-100 transition-colors">
            <UserCheck className="h-3 w-3 inline mr-0.5" /> Assign
          </button>
        )}
      </div>
    )},
    { header: 'Intake', render: (r) => <Badge status={r.intakeMethod} /> },
    { header: 'Status', render: (r) => <Badge status={r.status} /> },
    { header: 'AI Score', render: (r) => r.aiMatchScore
      ? <span className="font-mono text-sm font-medium text-primary-600">{r.aiMatchScore.toFixed(1)}</span>
      : <span className="text-surface-300">—</span>
    },
    { header: 'Actions', render: (r) => {
      const next = {
        PENDING: 'UNDER_REVIEW', UNDER_REVIEW: 'QUIZ_PENDING', QUIZ_COMPLETED: 'MANAGER_REVIEW',
        AI_EVALUATING: 'MANAGER_REVIEW'
      };
      const nextStatus = next[r.status];
      return (
        <div className="flex gap-1.5 flex-wrap">
          {nextStatus && (
            <button onClick={() => handleStatusChange(r.id, nextStatus)} disabled={updating === r.id}
              className="rounded-lg bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-700 hover:bg-primary-100 transition-colors disabled:opacity-50">
              → {nextStatus.replace(/_/g, ' ')}
            </button>
          )}
          {r.status === 'MANAGER_REVIEW' && (
            <>
              <button onClick={() => handleDecision(r.id, 'ACCEPTED')}
                className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition-colors">
                Accept
              </button>
              <button onClick={() => handleDecision(r.id, 'REJECTED')}
                className="rounded-lg bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-100 transition-colors">
                Reject
              </button>
            </>
          )}
          {r.managerNotes && (
            <span title={r.managerNotes} className="rounded-lg bg-surface-100 px-2 py-1 text-xs text-surface-500 cursor-help">
              <MessageSquare className="h-3 w-3 inline" /> Notes
            </span>
          )}
        </div>
      );
    }},
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Applications</h1>
        <p className="text-surface-500 mt-1">Manage internship application lifecycle · {apps.length} total</p>
      </div>

      {/* Status Filter Pills with Counts */}
      <div className="flex flex-wrap gap-2">
        {STATUSES.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
              statusFilter === s ? 'bg-primary-500 text-white shadow-sm' : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
            }`}>
            {s.replace(/_/g, ' ')}
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${
              statusFilter === s ? 'bg-white/20' : 'bg-surface-200'
            }`}>{counts[s]}</span>
          </button>
        ))}
      </div>

      <DataTable columns={columns} data={filtered} searchPlaceholder="Search applications..." />

      {/* Supervisor Assignment Modal */}
      {assignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-surface-900">Assign Supervisor</h3>
              <button onClick={() => setAssignModal(null)} className="rounded-lg p-1 hover:bg-surface-100">
                <X className="h-5 w-5 text-surface-400" />
              </button>
            </div>
            <div className="relative mb-4">
              <select value={selectedSupervisor} onChange={e => setSelectedSupervisor(e.target.value)}
                className="w-full appearance-none rounded-xl border border-surface-200 bg-white px-4 py-2.5 pr-10 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100">
                <option value="">Select a supervisor...</option>
                {supervisors.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} — {s.department} ({s.currentInterns}/{s.maxInterns} interns)
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400 pointer-events-none" />
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setAssignModal(null)}
                className="rounded-xl bg-surface-100 px-4 py-2 text-sm font-medium text-surface-600 hover:bg-surface-200">Cancel</button>
              <button onClick={handleAssignSupervisor} disabled={!selectedSupervisor || updating}
                className="rounded-xl bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 disabled:opacity-50">
                {updating ? 'Assigning...' : 'Assign'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manager Notes / Decision Modal */}
      {notesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-surface-900">
                {notesModal.decision === 'ACCEPTED' ? 'Accept Application' : 'Reject Application'}
              </h3>
              <button onClick={() => setNotesModal(null)} className="rounded-lg p-1 hover:bg-surface-100">
                <X className="h-5 w-5 text-surface-400" />
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Manager Notes (Optional)</label>
              <textarea value={managerNotes} onChange={e => setManagerNotes(e.target.value)}
                rows={3} placeholder="Add notes about your decision..."
                className="w-full rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 resize-none" />
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setNotesModal(null)}
                className="rounded-xl bg-surface-100 px-4 py-2 text-sm font-medium text-surface-600 hover:bg-surface-200">Cancel</button>
              <button onClick={submitDecision} disabled={updating}
                className={`rounded-xl px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${
                  notesModal.decision === 'ACCEPTED' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'
                }`}>
                {updating ? 'Processing...' : notesModal.decision === 'ACCEPTED' ? 'Confirm Accept' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
