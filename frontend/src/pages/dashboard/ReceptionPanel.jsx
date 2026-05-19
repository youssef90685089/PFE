import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usersApi, quizzesApi, candidatesApi } from '../../api/axios';
import {
  Users, UserPlus, Search, Filter, X, CheckCircle,
  Clock, Briefcase, Mail, Phone, GraduationCap,
  AlertCircle, BookOpen, IdCard, Eye, Edit, Trash2,
  Calendar, Upload, FileText, Paperclip
} from 'lucide-react';

const SPECIALTIES = ['All', 'Web Development', 'Security', 'Power BI', 'Data Science', 'Mobile'];
const STATUS_COLORS = {
  PENDING:        'bg-yellow-100 text-yellow-700 border-yellow-200',
  UNDER_REVIEW:   'bg-blue-100 text-blue-700 border-blue-200',
  QUIZ_PENDING:   'bg-purple-100 text-purple-700 border-purple-200',
  QUIZ_COMPLETED: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  ACCEPTED:       'bg-green-100 text-green-700 border-green-200',
  REJECTED:       'bg-red-100 text-red-700 border-red-200',
};

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR - 1 + i); // e.g. 2024-2029

const EMPTY_FORM = {
  firstName: '', lastName: '', email: '',
  phone: '',     cin: '',       specialty: 'Web Development',
  university: '', degree: '',
  internshipYear: CURRENT_YEAR,
};

const EMPTY_FILES = { cv: null, coverLetter: null, transcript: null, idCard: null };

export default function ReceptionPanel() {
  const { user } = useAuth();

  // ── Data State ────────────────────────────────────────────────────────────
  const [candidates, setCandidates]   = useState([]);
  const [quizzes, setQuizzes]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [quizzesLoading, setQuizzesLoading] = useState(false);
  const [error, setError]             = useState('');
  const [successMsg, setSuccessMsg]   = useState('');

  // ── Filter State ──────────────────────────────────────────────────────────
  const [search, setSearch]           = useState('');
  const [specialty, setSpecialty]     = useState('All');
  const [yearFilter, setYearFilter]   = useState('All');

  // ── File Upload State ─────────────────────────────────────────────────────
  const [files, setFiles]             = useState(EMPTY_FILES);
  const fileRefs = { cv: useRef(), coverLetter: useRef(), transcript: useRef(), idCard: useRef() };

  // ── Modal State ───────────────────────────────────────────────────────────
  const [showForm, setShowForm]       = useState(false);
  const [formMode, setFormMode]       = useState('create'); // 'create' | 'view' | 'edit'
  const [form, setForm]               = useState(EMPTY_FORM);
  const [submitting, setSubmitting]   = useState(false);
  const [formError, setFormError]     = useState('');
  const [tempPassword, setTempPassword] = useState('');   // shown once after creation
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  useEffect(() => { fetchCandidates(); }, []);

  // Only load candidates on mount — quizzes load lazily when form opens
  const fetchCandidates = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await usersApi.getCandidates();
      setCandidates(res.data?.data || res.data || []);
    } catch {
      setError('Failed to load candidates. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  // Lazy-load quizzes only when receptionist opens the form
  const openForm = async () => {
    setShowForm(true);
    setFormError('');
    setTempPassword('');
    if (quizzes.length === 0) {
      setQuizzesLoading(true);
      try {
        const qRes = await quizzesApi.getAll();
        setQuizzes(qRes.data?.data || qRes.data || []);
      } catch { /* quizzes optional */ }
      finally { setQuizzesLoading(false); }
    }
  };

  const handleFormChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  // ── Create Candidate ──────────────────────────────────────────────────────
  const handleCreate = async e => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    setTempPassword('');

    try {
      const payload = {
        firstName: form.firstName,
        lastName:  form.lastName,
        email:     form.email,
        phone:     form.phone,
        cin:       form.cin,
        specialty: form.specialty,
        internshipYear: Number(form.internshipYear),
        roles:     ['ROLE_CANDIDATE'],
      };

      const res = await usersApi.create(payload);
      if (!res.data.success) {
        setFormError(res.data.message || 'Failed to create candidate.');
        return;
      }

      const created = res.data.data;
      const userId  = created.id;

      // Upload documents (best-effort, non-blocking)
      const hasFiles = Object.values(files).some(f => f !== null);
      if (hasFiles) {
        try { await candidatesApi.uploadDocuments(userId, files); } catch {}
      }

      // Assign first quiz (best-effort)
      if (quizzes.length > 0) {
        quizzesApi.assignToCandidate(quizzes[0].id, userId).catch(() => {});
      }

      if (created.password) setTempPassword(created.password);
      setSuccessMsg(
        `✓ ${form.firstName} ${form.lastName} registered!` +
        (created.password ? ` Temp password: ${created.password}` : ' Welcome email sent.')
      );
      setShowForm(false);
      setForm(EMPTY_FORM);
      fetchCandidates();
      setTimeout(() => setSuccessMsg(''), 10000);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Server error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Filtered list ─────────────────────────────────────────────────────────
  const filtered = candidates.filter(c => {
    const name  = `${c.firstName || ''} ${c.lastName || ''}`.toLowerCase();
    const email = (c.email || '').toLowerCase();
    const matchSearch = !search || name.includes(search.toLowerCase()) || email.includes(search.toLowerCase());
    const matchSpec   = specialty === 'All' || (c.specialty || '') === specialty;
    const matchYear   = yearFilter === 'All' || String(c.internshipYear || new Date(c.createdAt).getFullYear()) === String(yearFilter);
    return matchSearch && matchSpec && matchYear;
  });

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 p-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600" />
            Reception Panel
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Welcome, {user?.fullName} · Register candidates and manage applications
          </p>
        </div>
        <button
          onClick={() => openForm()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-blue-500/20 transition-all"
        >
          <UserPlus className="h-4 w-4" />
          New Candidate
        </button>
      </div>

      {/* ── Alerts ── */}
      {successMsg && (
        <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl p-4 mb-5 text-sm text-green-800">
          <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
          <div>
            <span>{successMsg}</span>
            {tempPassword && (
              <div className="mt-2 font-mono text-base font-bold bg-green-100 px-3 py-1.5 rounded-lg inline-block tracking-widest">
                {tempPassword}
              </div>
            )}
          </div>
        </div>
      )}
      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-5 text-sm text-red-700">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />{error}
        </div>
      )}

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-slate-400 shrink-0" />
          {SPECIALTIES.map(s => (
            <button key={s} onClick={() => setSpecialty(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                specialty === s
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300'
              }`}>
              {s}
            </button>
          ))}
          <span className="w-px h-4 bg-slate-200 mx-1" />
          <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
          <select
            value={yearFilter}
            onChange={e => setYearFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-semibold bg-white text-slate-600 focus:border-blue-400 focus:outline-none"
          >
            <option value="All">All Years</option>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
        {[
          { label: 'Total',    value: candidates.length,                                                         icon: Users,      color: 'text-blue-600 bg-blue-50'  },
          { label: 'Pending',  value: candidates.filter(c => c.status === 'PENDING').length,                    icon: Clock,      color: 'text-yellow-600 bg-yellow-50'},
          { label: 'Accepted', value: candidates.filter(c => c.status === 'ACCEPTED').length,                   icon: CheckCircle,color: 'text-green-600 bg-green-50' },
          { label: 'In Quiz',  value: candidates.filter(c => ['QUIZ_PENDING','QUIZ_COMPLETED'].includes(c.status)).length, icon: Briefcase, color: 'text-purple-600 bg-purple-50'},
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3 shadow-sm">
            <div className={`h-9 w-9 rounded-lg ${color} flex items-center justify-center`}>
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Candidates Table ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700">
            {filtered.length} candidate{filtered.length !== 1 ? 's' : ''}
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600/20 border-t-blue-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No candidates found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Candidate</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone / CIN</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Specialty</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Year</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Quiz</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(c => {
                  const name   = `${c.firstName || '—'} ${c.lastName || ''}`;
                  const status = c.status || 'PENDING';
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm shrink-0">
                            {(c.firstName || '?').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{name}</p>
                            <p className="text-xs text-slate-400 flex items-center gap-1">
                              <Mail className="h-3 w-3" />{c.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-slate-600 text-xs space-y-0.5">
                        <p className="flex items-center gap-1"><Phone className="h-3 w-3 text-slate-400" />{c.phone || '—'}</p>
                        <p className="flex items-center gap-1"><IdCard className="h-3 w-3 text-slate-400" />{c.cin  || '—'}</p>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-lg">
                          {c.specialty || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2 py-1 rounded-lg flex items-center gap-1 w-fit">
                          <Calendar className="h-3 w-3" />
                          {c.internshipYear || new Date(c.createdAt).getFullYear()}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_COLORS[status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                          {status.replace(/_/g, ' ')}
                        </span>
                      </td>
<td className="px-4 py-4">
                         {quizzes.length > 0 ? (
                           <button
                             onClick={() => handleSendQuiz(c.id)}
                             className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold"
                             title="Send quiz to this candidate"
                           >
                             <BookOpen className="h-3.5 w-3.5" /> Send
                           </button>
                         ) : (
                           <span className="text-xs text-slate-300">No quiz</span>
                         )}
                       </td>
                       <td className="px-4 py-4">
                         <div className="flex items-center gap-2">
                           <button
                             onClick={() => handleView(c)}
                             className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
                             title="View details"
                           >
                             <Eye className="h-4 w-4" />
                           </button>
                           <button
                             onClick={() => handleEdit(c)}
                             className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
                             title="Edit candidate"
                           >
                             <Edit className="h-4 w-4" />
                           </button>
                           <button
                             onClick={() => handleDelete(c.id)}
                             className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                             title="Delete candidate"
                           >
                             <Trash2 className="h-4 w-4" />
                           </button>
                         </div>
                       </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

{/* ── Create / View / Edit Candidate Modal ── */}
       {showForm && (
         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
             <div className="flex items-center justify-between mb-5">
               <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                 <UserPlus className="h-5 w-5 text-blue-600" />
                 {formMode === 'view' ? 'View Candidate' : formMode === 'edit' ? 'Edit Candidate' : 'Register New Candidate'}
               </h2>
               <button onClick={() => { setShowForm(false); setSelectedCandidate(null); setFiles(EMPTY_FILES); }}
                 className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                 <X className="h-5 w-5" />
               </button>
             </div>

             {formError && (
               <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-sm text-red-600 flex items-start gap-2">
                 <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />{formError}
               </div>
             )}

             <form onSubmit={formMode === 'edit' ? handleUpdate : handleCreate} className="space-y-4">

               {/* Name */}
               <div className="grid grid-cols-2 gap-3">
                 <div>
                   <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">First Name *</label>
                   <input name="firstName" value={form.firstName} onChange={handleFormChange} required disabled={formMode === 'view'}
                     className={`w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all ${formMode === 'view' ? 'bg-slate-50 text-slate-500' : ''}`} />
                 </div>
                 <div>
                   <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Last Name *</label>
                   <input name="lastName" value={form.lastName} onChange={handleFormChange} required disabled={formMode === 'view'}
                     className={`w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all ${formMode === 'view' ? 'bg-slate-50 text-slate-500' : ''}`} />
                 </div>
               </div>

               {/* Email */}
               <div>
                 <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Email Address *</label>
                 <input name="email" type="email" value={form.email} onChange={handleFormChange} required disabled={formMode === 'view'}
                   className={`w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all ${formMode === 'view' ? 'bg-slate-50 text-slate-500' : ''}`} />
               </div>

               {/* Phone + CIN */}
               <div className="grid grid-cols-2 gap-3">
                 <div>
                   <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                     <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> Phone Number</span>
                   </label>
                   <input name="phone" type="tel" value={form.phone} onChange={handleFormChange} disabled={formMode === 'view'}
                     className={`w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all ${formMode === 'view' ? 'bg-slate-50 text-slate-500' : ''}`} />
                 </div>
                 <div>
                   <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                     <span className="flex items-center gap-1"><IdCard className="h-3 w-3" /> CIN Number</span>
                   </label>
                   <input name="cin" value={form.cin} onChange={handleFormChange} disabled={formMode === 'view'}
                     className={`w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all ${formMode === 'view' ? 'bg-slate-50 text-slate-500' : ''}`} />
                 </div>
               </div>

               {/* Specialty */}
               <div>
                 <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Specialty</label>
                 <select name="specialty" value={form.specialty} onChange={handleFormChange} disabled={formMode === 'view'}
                   className={`w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all ${formMode === 'view' ? 'bg-slate-50 text-slate-500' : ''}`}>
                   {SPECIALTIES.filter(s => s !== 'All').map(s => <option key={s} value={s}>{s}</option>)}
                 </select>
               </div>

               {/* University + Degree + Year */}
               <div className="grid grid-cols-2 gap-3">
                 <div>
                   <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                     <span className="flex items-center gap-1"><GraduationCap className="h-3 w-3" /> University</span>
                   </label>
                   <input name="university" value={form.university} onChange={handleFormChange} disabled={formMode === 'view'}
                     className={`w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all ${formMode === 'view' ? 'bg-slate-50 text-slate-500' : ''}`} />
                 </div>
                 <div>
                   <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Degree</label>
                   <input name="degree" value={form.degree} onChange={handleFormChange} disabled={formMode === 'view'}
                     className={`w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all ${formMode === 'view' ? 'bg-slate-50 text-slate-500' : ''}`} />
                 </div>
               </div>

               {/* Internship Year */}
               <div>
                 <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                   <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Internship Year</span>
                 </label>
                 <select name="internshipYear" value={form.internshipYear} onChange={handleFormChange} disabled={formMode === 'view'}
                   className={`w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all ${formMode === 'view' ? 'bg-slate-50 text-slate-500' : ''}`}>
                   {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                 </select>
               </div>

               {/* Document Uploads — create mode only */}
               {formMode === 'create' && (
                 <div className="border border-slate-200 rounded-xl p-4 space-y-3">
                   <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                     <Paperclip className="h-3.5 w-3.5" /> Documents (optional)
                   </p>
                   {[{key:'cv',label:'CV / Resume',accept:'.pdf,.doc,.docx'},
                     {key:'coverLetter',label:'Cover Letter',accept:'.pdf,.doc,.docx'},
                     {key:'transcript',label:'Academic Transcript',accept:'.pdf'},
                     {key:'idCard',label:'ID Card',accept:'.pdf,.jpg,.png'},
                   ].map(({key,label,accept}) => (
                     <div key={key} className="flex items-center justify-between gap-2">
                       <span className="text-xs text-slate-600 flex items-center gap-1.5">
                         <FileText className="h-3.5 w-3.5 text-slate-400" />{label}
                       </span>
                       <label className="cursor-pointer flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                         <Upload className="h-3.5 w-3.5" />
                         {files[key] ? files[key].name : 'Choose file'}
                         <input type="file" accept={accept} className="hidden"
                           onChange={e => setFiles(f => ({...f, [key]: e.target.files[0] || null}))} />
                       </label>
                       {files[key] && (
                         <button type="button" onClick={() => setFiles(f => ({...f, [key]: null}))}
                           className="text-slate-300 hover:text-red-400 transition-colors">
                           <X className="h-3.5 w-3.5" />
                         </button>
                       )}
                     </div>
                   ))}
                 </div>
               )}

               {/* Status badge — view only */}
               {formMode === 'view' && selectedCandidate && (
                 <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                   <span className="text-xs font-semibold px-2.5 py-1 rounded-full border bg-slate-100 text-slate-600">
                     {selectedCandidate.status ? selectedCandidate.status.replace(/_/g, ' ') : 'PENDING'}
                   </span>
                 </div>
               )}

               {/* Quiz assignment notice — create only */}
               {formMode === 'create' && (quizzesLoading ? (
                 <span className="text-xs text-slate-400 flex items-center gap-2">
                   <span className="h-3 w-3 animate-spin rounded-full border border-slate-300 border-t-slate-500 inline-block" />
                   Loading quizzes...
                 </span>
               ) : quizzes.length > 0 ? (
                 <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700 flex items-center gap-2">
                   <BookOpen className="h-4 w-4 shrink-0" />
                   Quiz <strong>"{quizzes[0]?.title}"</strong> will be automatically assigned to this candidate.
                 </div>
               ) : (
                 <p className="text-xs text-slate-400">No quizzes available to assign yet.</p>
               ))}

               {/* Actions */}
               <div className="flex gap-3 pt-2">
                 <button type="button" onClick={() => { setShowForm(false); setSelectedCandidate(null); }}
                   className="flex-1 border border-slate-200 text-slate-600 font-semibold py-2.5 rounded-xl hover:bg-slate-50 transition-all text-sm">
                   Close
                 </button>
                 {formMode === 'edit' && (
                   <button type="submit" disabled={submitting}
                     className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-all text-sm flex items-center justify-center gap-2">
                     {submitting
                       ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                       : <><UserPlus className="h-4 w-4" /> Modify &amp; Notify</>
                     }
                   </button>
                 )}
                 {formMode === 'create' && (
                   <button type="submit" disabled={submitting}
                     className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-all text-sm flex items-center justify-center gap-2">
                     {submitting
                       ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                       : <><UserPlus className="h-4 w-4" /> Create &amp; Notify</>
                     }
                   </button>
                 )}
               </div>
             </form>
           </div>
         </div>
       )}
    </div>
  );

  // ── Send quiz to existing candidate ──────────────────────────────────────
  async function handleSendQuiz(candidateId) {
    if (quizzes.length === 0) {
      // Load quizzes on demand if not yet loaded
      try {
        const qRes = await quizzesApi.getAll();
        const loaded = qRes.data?.data || qRes.data || [];
        setQuizzes(loaded);
        if (loaded.length === 0) { setError('No quizzes available.'); return; }
        await quizzesApi.assignToCandidate(loaded[0].id, candidateId);
        setSuccessMsg(`Quiz "${loaded[0].title}" sent!`);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to assign quiz.');
      }
      return;
    }
    try {
      await quizzesApi.assignToCandidate(quizzes[0].id, candidateId);
      setSuccessMsg(`Quiz "${quizzes[0].title}" sent to candidate.`);
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign quiz.');
    }
  }

  // ── View candidate details (read-only modal) ──────────────────────────────
  function handleView(candidate) {
    setForm({
      firstName: candidate.firstName || '',
      lastName:  candidate.lastName || '',
      email:     candidate.email || '',
      phone:     candidate.phone || '',
      cin:       candidate.cin || '',
      specialty: candidate.specialty || 'Web Development',
      university: candidate.university || '',
      degree:    candidate.degree || '',
    });
    setFormMode('view');
    setShowForm(true);
  }

  // ── Edit candidate (pre-fill form) ──────────────────────────────────────
  function handleEdit(candidate) {
    setForm({
      firstName: candidate.firstName || '',
      lastName:  candidate.lastName || '',
      email:     candidate.email || '',
      phone:     candidate.phone || '',
      cin:       candidate.cin || '',
      specialty: candidate.specialty || 'Web Development',
      university: candidate.university || '',
      degree:    candidate.degree || '',
      password:  '',
    });
    setFormMode('edit');
    setShowForm(true);
  }

  // ── Delete candidate ────────────────────────────────────────────────────
  async function handleDelete(candidateId) {
    if (!window.confirm('Are you sure you want to delete this candidate?')) return;
    try {
      await usersApi.delete(candidateId);
      setSuccessMsg('Candidate deleted successfully.');
      fetchCandidates();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete candidate.');
    }
  }

  // ── Update candidate (Edit) ──────────────────────────────────────────
  async function handleUpdate(e) {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');

    try {
      const payload = {
        firstName: form.firstName,
        lastName:  form.lastName,
        email:     form.email,
        phone:     form.phone,
        cin:       form.cin,
        specialty: form.specialty,
      };

      await usersApi.update(selectedCandidate.id, payload);

      // Send update notification to candidate
      try {
        await api.post('/notifications', {
          userId: selectedCandidate.id,
          title: 'Profile Updated',
          message: 'Your profile has been updated by the reception team.',
          type: 'INFO',
          link: '/dashboard/my-profile'
        });
      } catch {}

      setSuccessMsg('Candidate updated successfully.');
      setShowForm(false);
      setSelectedCandidate(null);
      fetchCandidates();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to update candidate.');
    } finally {
      setSubmitting(false);
    }
  }
}