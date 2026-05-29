import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { applicationsApi, supervisorsApi, interviewsApi } from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../components/ui/DataTable';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { X, UserCheck, MessageSquare, ChevronDown, CalendarDays } from 'lucide-react';

export default function ApplicationsPage() {
  const navigate = useNavigate();
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

  // Interview schedule modal
  const [interviewModal, setInterviewModal] = useState(null);
  const [interviewForm, setInterviewForm] = useState({ scheduledAt: '', interviewer: '', type: 'TECHNICAL' });

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
      toast.success('Application status updated successfully');
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to update'); }
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
      toast.success('Supervisor assigned successfully');
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to assign'); }
    finally { setUpdating(null); }
  };

  const handleScheduleInterview = async (e) => {
    e.preventDefault();
    if (!interviewModal) return;
    setUpdating('interview');
    try {
      await interviewsApi.schedule({
        candidateId: interviewModal.candidateId,
        scheduledAt: interviewForm.scheduledAt ? new Date(interviewForm.scheduledAt).toISOString() : new Date(Date.now() + 86400000).toISOString(),
        interviewer: interviewForm.interviewer || 'Manager',
        type: interviewForm.type,
      });
      toast.success('Interview scheduled for ' + interviewModal.candidateName);
      setInterviewModal(null);
      setInterviewForm({ scheduledAt: '', interviewer: '', type: 'TECHNICAL' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to schedule interview');
    } finally { setUpdating(null); }
  };

  const handleDecision = (id, decision) => {
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
          {(r.status === 'QUIZ_COMPLETED' || r.status === 'AI_EVALUATING' || r.status === 'MANAGER_REVIEW') && (
            <button onClick={() => { setInterviewModal(r); setInterviewForm({ scheduledAt: '', interviewer: '', type: 'TECHNICAL' }); }}
              className="rounded-lg bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700 hover:bg-purple-100 transition-colors">
              <CalendarDays className="h-3 w-3 inline mr-0.5" /> Interview
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

      {/* Interview Schedule Modal */}
      {interviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-surface-900">
                <CalendarDays className="h-5 w-5 inline mr-2 text-purple-600" />
                Schedule Interview — {interviewModal.candidateName}
              </h3>
              <button onClick={() => setInterviewModal(null)} className="rounded-lg p-1 hover:bg-surface-100">
                <X className="h-5 w-5 text-surface-400" />
              </button>
            </div>
            <form onSubmit={handleScheduleInterview} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1.5">Date & Time</label>
                <input type="datetime-local" value={interviewForm.scheduledAt}
                  onChange={e => setInterviewForm(f => ({...f, scheduledAt: e.target.value}))}
                  className="w-full border border-surface-200 rounded-lg px-3 py-2.5 text-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1.5">Interviewer</label>
                <input type="text" value={interviewForm.interviewer}
                  onChange={e => setInterviewForm(f => ({...f, interviewer: e.target.value}))}
                  placeholder="Interviewer name"
                  className="w-full border border-surface-200 rounded-lg px-3 py-2.5 text-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1.5">Type</label>
                <select value={interviewForm.type}
                  onChange={e => setInterviewForm(f => ({...f, type: e.target.value}))}
                  className="w-full border border-surface-200 rounded-lg px-3 py-2.5 text-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all">
                  <option value="TECHNICAL">Technical</option>
                  <option value="HR">HR</option>
                  <option value="MANAGER">Manager</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setInterviewModal(null)}
                  className="rounded-xl bg-surface-100 px-4 py-2 text-sm font-medium text-surface-600 hover:bg-surface-200">Cancel</button>
                <button type="submit" disabled={updating === 'interview'}
                  className="rounded-xl bg-purple-500 px-4 py-2 text-sm font-medium text-white hover:bg-purple-600 disabled:opacity-50">
                  {updating === 'interview' ? 'Scheduling...' : 'Schedule Interview'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
