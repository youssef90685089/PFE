import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { candidatesApi } from '../../api/axios';
import {
  Users, UserPlus, Search, Filter, X, CheckCircle,
  Clock, Briefcase, Mail, Phone,
  AlertCircle, IdCard, Eye, Edit, Trash2,
  Calendar, GraduationCap, BookOpen, Plus
} from 'lucide-react';

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR - 1 + i);

const EMPTY_FORM = {
  firstName: '', lastName: '', email: '',
  phone: '',   cin: '',
};

const EMPTY_FILE_FORM = {
  year: CURRENT_YEAR, university: '', degree: '', skillsTags: '',
};

export default function ReceptionPanel() {
  const { user } = useAuth();

  const [candidates, setCandidates]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [successMsg, setSuccessMsg]   = useState('');
  const [activeTab, setActiveTab]     = useState('candidates'); // 'candidates' or 'files'

  const [search, setSearch]           = useState('');

  // ── Candidate Modal ──
  const [showForm, setShowForm]       = useState(false);
  const [formMode, setFormMode]       = useState('create');
  const [form, setForm]               = useState(EMPTY_FORM);
  const [submitting, setSubmitting]   = useState(false);
  const [formError, setFormError]     = useState('');
  const [createdCandidateId, setCreatedCandidateId] = useState(null);

  // ── Internship File Modal ──
  const [showFileForm, setShowFileForm] = useState(false);
  const [fileForm, setFileForm]         = useState(EMPTY_FILE_FORM);
  const [fileSubmitting, setFileSubmitting] = useState(false);
  const [fileDoc, setFileDoc]           = useState(null);

  // ── View Files Modal ──
  const [showFilesModal, setShowFilesModal] = useState(false);
  const [selectedCandidateFiles, setSelectedCandidateFiles] = useState(null);
  const [filesLoading, setFilesLoading] = useState(false);

  useEffect(() => { fetchCandidates(); }, []);

  const fetchCandidates = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await candidatesApi.getAll();
      setCandidates(res.data?.data || []);
    } catch {
      setError('Failed to load candidates.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleFileFormChange = e => setFileForm(f => ({ ...f, [e.target.name]: e.target.value }));

  // ── Create Candidate (no User, no Email) ─────────────────
  const handleCreate = async e => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');

    try {
      const res = await candidatesApi.create({
        firstName: form.firstName,
        lastName:  form.lastName,
        email:     form.email,
        phone:     form.phone,
        cin:       form.cin,
      });

      if (!res.data.success) {
        setFormError(res.data.message || 'Failed to create candidate.');
        return;
      }

      const created = res.data.data;
      setCreatedCandidateId(created.id);
      setSuccessMsg(`✓ ${form.firstName} ${form.lastName} registered successfully`);
      setShowForm(false);
      setForm(EMPTY_FORM);
      fetchCandidates();
      setTimeout(() => setSuccessMsg(''), 8000);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Server error.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Add Internship File ──────────────────────────────────
  const handleAddFile = async e => {
    e.preventDefault();
    if (!createdCandidateId) return;
    setFileSubmitting(true);

    try {
      if (fileDoc) {
        const formData = new FormData();
        formData.append('year', Number(fileForm.year));
        formData.append('university', fileForm.university);
        formData.append('degree', fileForm.degree);
        formData.append('skillsTags', fileForm.skillsTags);
        formData.append('file', fileDoc);
        await candidatesApi.addInternshipFileWithDocument(createdCandidateId, formData);
      } else {
        await candidatesApi.addInternshipFile(createdCandidateId, {
          year:       Number(fileForm.year),
          university: fileForm.university,
          degree:     fileForm.degree,
          skillsTags: fileForm.skillsTags,
        });
      }
      toast.success('Internship file added');
      setShowFileForm(false);
      setFileForm(EMPTY_FILE_FORM);
      setFileDoc(null);
      fetchCandidates();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add file');
    } finally {
      setFileSubmitting(false);
    }
  };

  // ── Filter ──────────────────────────────────────────────
  const filtered = candidates.filter(c => {
    const name  = `${c.firstName || ''} ${c.lastName || ''}`.toLowerCase();
    const email = (c.email || '').toLowerCase();
    return !search || name.includes(search.toLowerCase()) || email.includes(search.toLowerCase());
  });

  // ── Delete Candidate ────────────────────────────────────
  const handleDelete = async id => {
    try {
      await candidatesApi.delete(id);
      toast.success('Candidate deleted');
      fetchCandidates();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  // ── View (open file form for existing) ───────────────────
  const handleAddFileFor = (candidate) => {
    setCreatedCandidateId(candidate.id);
    setFileForm(EMPTY_FILE_FORM);
    setShowFileForm(true);
  };

  // ── View Internship Files ────────────────────────────────
  const handleViewFiles = async (candidate) => {
    setSelectedCandidateFiles(candidate);
    setShowFilesModal(true);
    setFilesLoading(true);
    try {
      const res = await candidatesApi.getInternshipFiles(candidate.id);
      setSelectedCandidateFiles({
        ...candidate,
        files: res.data?.data || []
      });
    } catch (err) {
      toast.error('Failed to load internship files');
      setSelectedCandidateFiles(null);
    } finally {
      setFilesLoading(false);
    }
  };

  // ── Delete Internship File ───────────────────────────────
  const handleDeleteFile = async (fileId) => {
    if (!window.confirm('Delete this internship file?')) return;
    try {
      await candidatesApi.deleteInternshipFile(fileId);
      toast.success('File deleted');
      if (selectedCandidateFiles) {
        handleViewFiles(selectedCandidateFiles);
      }
    } catch (err) {
      toast.error('Failed to delete file');
    }
  };

  // ── Render ───────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600" />
            Reception Panel
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Welcome, {user?.fullName} · Register candidates (no user account created)
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setFormError(''); setCreatedCandidateId(null); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-blue-500/20 transition-all"
        >
          <UserPlus className="h-4 w-4" />
          New Candidate
        </button>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl p-4 mb-5 text-sm text-green-800">
          <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}
      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-5 text-sm text-red-700">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />{error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('candidates')}
          className={`px-4 py-3 font-semibold text-sm border-b-2 transition-colors ${
            activeTab === 'candidates'
              ? 'text-blue-600 border-blue-600'
              : 'text-slate-500 border-transparent hover:text-slate-700'
          }`}
        >
          <Users className="h-4 w-4 inline mr-2" />
          Candidates
        </button>
        <button
          onClick={() => setActiveTab('files')}
          className={`px-4 py-3 font-semibold text-sm border-b-2 transition-colors ${
            activeTab === 'files'
              ? 'text-blue-600 border-blue-600'
              : 'text-slate-500 border-transparent hover:text-slate-700'
          }`}
        >
          <BookOpen className="h-4 w-4 inline mr-2" />
          Internship Files
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text" placeholder="Search by name or email..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
        />
      </div>

      {/* CANDIDATES TAB */}
      {activeTab === 'candidates' && (
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
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">User Account</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Files</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm shrink-0">
                          {(c.firstName || '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{c.firstName} {c.lastName}</p>
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
                      {c.hasUserAccount ? (
                        <span className="text-xs font-semibold bg-green-50 text-green-700 px-2 py-1 rounded-full border border-green-200">Active</span>
                      ) : (
                        <span className="text-xs font-semibold bg-yellow-50 text-yellow-700 px-2 py-1 rounded-full border border-yellow-200">No Account</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => handleViewFiles(c)}
                        className="text-xs font-semibold bg-blue-50 text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
                      >
                        {c.internshipFiles?.length || 0} file{(c.internshipFiles?.length || 0) !== 1 ? 's' : ''}
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAddFileFor(c)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                          title="Add internship file"
                        >
                          <Plus className="h-4 w-4" />
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      )}

      {/* FILES TAB */}
      {activeTab === 'files' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-700">
              All Internship Files
            </h2>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600/20 border-t-blue-600" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No internship files found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Candidate</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Year</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">University</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Degree</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Skills</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Documents</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map(c => (c.internshipFiles || []).map(f => (
                    <tr key={`${c.id}-${f.id}`} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs shrink-0">
                            {(c.firstName || '?').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 text-sm">{c.firstName} {c.lastName}</p>
                            <p className="text-xs text-slate-400">{c.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-slate-700">{f.year}</td>
                      <td className="px-4 py-4 text-slate-700">{f.university || '—'}</td>
                      <td className="px-4 py-4 text-slate-700">{f.degree || '—'}</td>
                      <td className="px-4 py-4">
                        {f.skillsTags ? (
                          <div className="flex flex-wrap gap-1">
                            {f.skillsTags.split(',').map((tag, idx) => (
                              <span key={idx} className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{tag.trim()}</span>
                            ))}
                          </div>
                        ) : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-4 py-4">
                        {f.documentFileNames?.length > 0 ? (
                          <span className="text-xs text-blue-600">{f.documentFileNames.length} file(s)</span>
                        ) : <span className="text-slate-300">—</span>}
                      </td>
                    </tr>
                  )))}
                  {filtered.every(c => !c.internshipFiles?.length) && (
                    <tr>
                      <td colSpan="6" className="text-center py-12 text-slate-400 text-sm">No internship files found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Create Candidate Modal ── */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-blue-600" />
                Register New Candidate
              </h2>
              <button onClick={() => setShowForm(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-sm text-red-600 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />{formError}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">First Name *</label>
                  <input name="firstName" value={form.firstName} onChange={handleFormChange} required
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Last Name *</label>
                  <input name="lastName" value={form.lastName} onChange={handleFormChange} required
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Email *</label>
                <input name="email" type="email" value={form.email} onChange={handleFormChange} required
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Phone className="h-3 w-3" /> Phone
                  </label>
                  <input name="phone" type="tel" value={form.phone} onChange={handleFormChange}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <IdCard className="h-3 w-3" /> CIN
                  </label>
                  <input name="cin" value={form.cin} onChange={handleFormChange}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all" />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                No user account or email will be created yet. A manager can send the quiz invite later.
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 border border-slate-200 text-slate-600 font-semibold py-2.5 rounded-xl hover:bg-slate-50 transition-all text-sm">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-all text-sm flex items-center justify-center gap-2">
                  {submitting
                    ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    : <><UserPlus className="h-4 w-4" /> Register Candidate</>
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Add Internship File Modal ── */}
      {showFileForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-blue-600" />
                Add Internship File
              </h2>
              <button onClick={() => setShowFileForm(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddFile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  <Calendar className="h-3 w-3 inline mr-1" /> Year *
                </label>
                <select name="year" value={fileForm.year} onChange={handleFileFormChange} required
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all">
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">University</label>
                <input name="university" value={fileForm.university} onChange={handleFileFormChange}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Degree / Level</label>
                <input name="degree" value={fileForm.degree} onChange={handleFileFormChange}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Skills / Tags</label>
                <input name="skillsTags" value={fileForm.skillsTags} onChange={handleFileFormChange}
                  placeholder="e.g. Java, React, Spring Boot"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Document (PDF, DOC)</label>
                <input type="file" accept=".pdf,.doc,.docx"
                  onChange={e => setFileDoc(e.target.files[0] || null)}
                  className="w-full text-sm text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all cursor-pointer" />
                {fileDoc && <p className="text-xs text-green-600 mt-1">{fileDoc.name}</p>}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowFileForm(false); setFileDoc(null); }}
                  className="flex-1 border border-slate-200 text-slate-600 font-semibold py-2.5 rounded-xl hover:bg-slate-50 transition-all text-sm">
                  Cancel
                </button>
                <button type="submit" disabled={fileSubmitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-all text-sm flex items-center justify-center gap-2">
                  {fileSubmitting
                    ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    : <><Plus className="h-4 w-4" /> Add File</>
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── View Internship Files Modal ── */}
      {showFilesModal && selectedCandidateFiles && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5 sticky top-0 bg-white pb-3 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                Internship Files — {selectedCandidateFiles.firstName} {selectedCandidateFiles.lastName}
              </h2>
              <button onClick={() => { setShowFilesModal(false); setSelectedCandidateFiles(null); }}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {filesLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600/20 border-t-blue-600" />
              </div>
            ) : !selectedCandidateFiles.files || selectedCandidateFiles.files.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No internship files</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedCandidateFiles.files.map(f => (
                  <div key={f.id} className="border border-slate-200 rounded-xl p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          <p className="font-semibold text-slate-900">{f.year}</p>
                          {f.university && (
                            <>
                              <span className="text-slate-300">•</span>
                              <p className="text-sm text-slate-600">{f.university}</p>
                            </>
                          )}
                        </div>
                        {f.degree && (
                          <p className="text-xs text-slate-500 mb-2">
                            <GraduationCap className="h-3 w-3 inline mr-1" />
                            {f.degree}
                          </p>
                        )}
                        {f.skillsTags && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {f.skillsTags.split(',').map((tag, idx) => (
                              <span key={idx} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                                {tag.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                        {f.documentFileNames?.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {f.documentFileNames.map((docName, idx) => (
                              <p key={idx} className="text-xs text-blue-600 flex items-center gap-1">
                                📄 {docName}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteFile(f.id)}
                        className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors shrink-0"
                        title="Delete file"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3 pt-4 mt-4 border-t border-slate-100 sticky bottom-0 bg-white">
              <button
                onClick={() => {
                  setShowFilesModal(false);
                  setSelectedCandidateFiles(null);
                }}
                className="flex-1 border border-slate-200 text-slate-600 font-semibold py-2.5 rounded-xl hover:bg-slate-50 transition-all text-sm"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleAddFileFor(selectedCandidateFiles);
                  setShowFilesModal(false);
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition-all text-sm flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" /> Add Another File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
