import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { interviewsApi, candidatesApi } from '../../api/axios';
import { CalendarDays, User, Clock, CheckCircle2, XCircle, Search, X, Plus, ChevronRight, FileText } from 'lucide-react';

export default function InterviewPage() {
  const [interviews, setInterviews] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [scheduleForm, setScheduleForm] = useState({
    candidateId: '',
    scheduledAt: '',
    interviewer: '',
    type: 'TECHNICAL',
  });

  const [resultForm, setResultForm] = useState({
    score: '',
    notes: '',
    feedback: '',
    status: 'COMPLETED',
  });

  useEffect(() => {
    Promise.all([loadInterviews(), loadCandidates()]);
  }, []);

  const loadInterviews = async () => {
    try {
      const r = await interviewsApi.getAll();
      setInterviews(r.data?.data || []);
    } catch { setInterviews([]); }
    finally { setLoading(false); }
  };

  const loadCandidates = async () => {
    try {
      const r = await candidatesApi.getAll();
      setCandidates(r.data?.data || []);
    } catch { setCandidates([]); }
  };

  const handleSchedule = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await interviewsApi.schedule({
        candidateId: Number(scheduleForm.candidateId),
        scheduledAt: scheduleForm.scheduledAt || new Date(Date.now() + 86400000).toISOString(),
        interviewer: scheduleForm.interviewer || 'Manager',
        type: scheduleForm.type,
      });
      toast.success('Interview scheduled');
      setShowScheduleModal(false);
      setScheduleForm({ candidateId: '', scheduledAt: '', interviewer: '', type: 'TECHNICAL' });
      loadInterviews();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to schedule');
    } finally { setSubmitting(false); }
  };

  const handleUpdateResult = async (e) => {
    e.preventDefault();
    if (!showResultModal) return;
    setSubmitting(true);
    try {
      await interviewsApi.updateResult(showResultModal.id, {
        score: Number(resultForm.score),
        notes: resultForm.notes,
        feedback: resultForm.feedback,
        status: resultForm.status,
      });
      toast.success('Interview result updated');
      setShowResultModal(null);
      setResultForm({ score: '', notes: '', feedback: '', status: 'COMPLETED' });
      loadInterviews();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally { setSubmitting(false); }
  };

  const pendingCandidates = candidates.filter(c =>
    c.hasUserAccount && !interviews.some(i => i.candidateId === c.id && i.status === 'SCHEDULED')
  );

  const filtered = searchTerm
    ? interviews.filter(i =>
        (i.candidateName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (i.candidateEmail || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    : interviews;

  const statusBadge = (status) => {
    const colors = {
      SCHEDULED: 'bg-amber-50 text-amber-700 border-amber-200',
      IN_PROGRESS: 'bg-blue-50 text-blue-700 border-blue-200',
      COMPLETED: 'bg-green-50 text-green-700 border-green-200',
      CANCELLED: 'bg-red-50 text-red-700 border-red-200',
    };
    return `text-xs font-semibold px-2.5 py-1 rounded-full border ${colors[status] || 'bg-slate-50 text-slate-600 border-slate-200'}`;
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600/30 border-t-blue-600" />
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarDays className="h-7 w-7 text-primary-600" />
            Schedule & Conduct Interview
          </h1>
          <p className="text-slate-500 mt-1">Manage candidate interviews and evaluation process.</p>
        </div>
        <button
          onClick={() => setShowScheduleModal(true)}
          className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-primary-500/20 transition-all"
        >
          <Plus className="h-4 w-4" />
          Schedule Interview
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Interview List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text" placeholder="Search candidates..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            {filtered.length === 0 ? (
              <p className="text-center text-slate-400 py-8 text-sm">No interviews yet</p>
            ) : (
              <div className="space-y-2">
                {filtered.map(i => (
                  <div key={i.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-primary-200 hover:bg-primary-50/30 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm">
                        {(i.candidateName || '?').charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 text-sm">{i.candidateName}</h3>
                        <p className="text-xs text-slate-400">{i.candidateEmail}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] text-slate-400">{i.type}</span>
                          {i.scheduledAt && (
                            <span className="text-[10px] text-slate-400">
                              {new Date(i.scheduledAt).toLocaleDateString()} {new Date(i.scheduledAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}
                            </span>
                          )}
                          {i.score != null && (
                            <span className="text-[10px] font-bold text-primary-600">Score: {i.score}%</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={statusBadge(i.status)}>{i.status}</span>
                      {i.status === 'SCHEDULED' && (
                        <button
                          onClick={() => { setShowResultModal(i); setResultForm({ score: '', notes: '', feedback: '', status: 'COMPLETED' }); }}
                          className="p-1.5 rounded-lg hover:bg-green-50 text-green-600 transition-colors"
                          title="Record result"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Summary */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h2 className="font-bold text-slate-900 mb-3 flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-primary-600" />
              Summary
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Total</span><span className="font-semibold">{interviews.length}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Scheduled</span><span className="font-semibold text-amber-600">{interviews.filter(i => i.status === 'SCHEDULED').length}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Completed</span><span className="font-semibold text-green-600">{interviews.filter(i => i.status === 'COMPLETED').length}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Cancelled</span><span className="font-semibold text-red-600">{interviews.filter(i => i.status === 'CANCELLED').length}</span></div>
            </div>
          </div>

          {interviews.filter(i => i.status === 'SCHEDULED').slice(0, 2).length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h2 className="font-bold text-slate-900 mb-3 flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-primary-600" />
                Upcoming
              </h2>
              <div className="space-y-3">
                {interviews.filter(i => i.status === 'SCHEDULED').slice(0, 3).map(i => (
                  <div key={i.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-xs font-bold text-primary-600 mb-0.5">
                      {i.scheduledAt ? new Date(i.scheduledAt).toLocaleDateString() + ' ' + new Date(i.scheduledAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) : 'TBD'}
                    </p>
                    <p className="text-sm font-semibold text-slate-800">{i.candidateName}</p>
                    <p className="text-[10px] text-slate-400">{i.type} · {i.interviewer || 'Manager'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Schedule Modal ── */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary-600" />
                Schedule Interview
              </h2>
              <button onClick={() => setShowScheduleModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSchedule} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Candidate *</label>
                <select value={scheduleForm.candidateId} onChange={e => setScheduleForm(f => ({...f, candidateId: e.target.value}))} required
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all">
                  <option value="">Select candidate...</option>
                  {candidates.filter(c => c.hasUserAccount).map(c => (
                    <option key={c.id} value={c.id}>{c.firstName} {c.lastName} — {c.email}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Date & Time</label>
                <input type="datetime-local" value={scheduleForm.scheduledAt} onChange={e => setScheduleForm(f => ({...f, scheduledAt: e.target.value}))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Interviewer</label>
                <input type="text" value={scheduleForm.interviewer} onChange={e => setScheduleForm(f => ({...f, interviewer: e.target.value}))}
                  placeholder="Interviewer name"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Type</label>
                <select value={scheduleForm.type} onChange={e => setScheduleForm(f => ({...f, type: e.target.value}))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all">
                  <option value="TECHNICAL">Technical</option>
                  <option value="HR">HR</option>
                  <option value="MANAGER">Manager</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowScheduleModal(false)}
                  className="flex-1 border border-slate-200 text-slate-600 font-semibold py-2.5 rounded-xl hover:bg-slate-50 transition-all text-sm">Cancel</button>
                <button type="submit" disabled={submitting}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-all text-sm flex items-center justify-center gap-2">
                  {submitting ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <><CalendarDays className="h-4 w-4" /> Schedule</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Result Modal ── */}
      {showResultModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Record Result — {showResultModal.candidateName}
              </h2>
              <button onClick={() => setShowResultModal(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateResult} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Score (0-100) *</label>
                <input type="number" min="0" max="100" value={resultForm.score} onChange={e => setResultForm(f => ({...f, score: e.target.value}))} required
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-100 transition-all" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Notes</label>
                <textarea rows="3" value={resultForm.notes} onChange={e => setResultForm(f => ({...f, notes: e.target.value}))}
                  placeholder="Interview notes..."
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-100 transition-all resize-none" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Feedback</label>
                <textarea rows="3" value={resultForm.feedback} onChange={e => setResultForm(f => ({...f, feedback: e.target.value}))}
                  placeholder="Detailed feedback..."
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-100 transition-all resize-none" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Status</label>
                <select value={resultForm.status} onChange={e => setResultForm(f => ({...f, status: e.target.value}))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-100 transition-all">
                  <option value="COMPLETED">Completed (Passed)</option>
                  <option value="IN_PROGRESS">Still In Progress</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowResultModal(null)}
                  className="flex-1 border border-slate-200 text-slate-600 font-semibold py-2.5 rounded-xl hover:bg-slate-50 transition-all text-sm">Cancel</button>
                <button type="submit" disabled={submitting}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-all text-sm flex items-center justify-center gap-2">
                  {submitting ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <><CheckCircle2 className="h-4 w-4" /> Save Result</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}