import { useState, useRef, useCallback } from 'react';
import {
  X, GraduationCap, Calendar, Building2, BookOpen,
  Tag, Cpu, Upload, FileText, CheckCircle2, AlertCircle,
  Plus, ChevronDown, Loader2, Sparkles, FolderOpen,
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────
const CURRENT_YEAR = new Date().getFullYear();
const ACADEMIC_YEARS = Array.from({ length: 8 }, (_, i) => {
  const start = CURRENT_YEAR - 3 + i;
  return { label: `${start}–${start + 1}`, value: start };
});

const SUGGESTED_SKILLS = [
  'React', 'Vue.js', 'Angular', 'Node.js', 'Spring Boot', 'Django',
  'Python', 'Java', 'TypeScript', 'PostgreSQL', 'MySQL', 'MongoDB',
  'Docker', 'Kubernetes', 'AWS', 'Git', 'REST API', 'GraphQL',
  'Machine Learning', 'Data Analysis', 'Figma', 'Agile / Scrum',
];

const SUGGESTED_UNIVERSITIES = [
  'Université de Sfax', 'Université de Tunis', 'ENIS', 'ESPRIT',
  'ISIMS', 'FSS', 'ISET Sfax', 'École Polytechnique de Tunis',
  'Université de Carthage', 'Université de Sousse',
];

const ACCEPTED_TYPES = ['.pdf', '.doc', '.docx'];
const MAX_FILE_MB   = 10;

// ─── Tiny sub-components ──────────────────────────────────────────────────────
function Chip({ label, color = 'blue', onRemove }) {
  const palettes = {
    blue:   'bg-blue-50 text-blue-700 border-blue-200',
    violet: 'bg-violet-50 text-violet-700 border-violet-200',
    teal:   'bg-teal-50  text-teal-700  border-teal-200',
    amber:  'bg-amber-50 text-amber-700 border-amber-200',
  };
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${palettes[color]} transition-all`}
    >
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-0.5 rounded-full hover:bg-black/10 p-0.5 transition-colors"
          aria-label={`Remove ${label}`}
        >
          <X className="h-2.5 w-2.5" />
        </button>
      )}
    </span>
  );
}

function SectionLabel({ icon: Icon, children, required }) {
  return (
    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
      {Icon && <Icon className="h-3.5 w-3.5 text-slate-400" />}
      {children}
      {required && <span className="text-rose-400 font-bold">*</span>}
    </label>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────
/**
 * Props:
 *   candidateId  – ID of the candidate to attach the file to
 *   candidateName – display name shown in the header
 *   onClose()   – called when the modal should be hidden
 *   onSubmit(payload: FormData | object, hasDocument: boolean)
 *               – async callback; resolves on success, throws on error
 */
export default function AddInternshipFileModal({
  candidateId,
  candidateName = 'Candidate',
  onClose,
  onSubmit,
}) {
  // ── Form state ──────────────────────────────────────────
  const [year,       setYear]       = useState(CURRENT_YEAR);
  const [university, setUniversity] = useState('');
  const [degree,     setDegree]     = useState('');

  // Skills chip-input
  const [skills,        setSkills]        = useState([]);
  const [skillInput,    setSkillInput]    = useState('');
  const [showSkillSuggest, setShowSkillSuggest] = useState(false);
  const skillInputRef = useRef(null);

  // Tags chip-input
  const [tags,       setTags]       = useState([]);
  const [tagInput,   setTagInput]   = useState('');
  const tagInputRef  = useRef(null);

  // File upload
  const [file,          setFile]          = useState(null);
  const [fileError,     setFileError]     = useState('');
  const [isDragging,    setIsDragging]    = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);  // simulated
  const fileInputRef    = useRef(null);

  // Submit state
  const [submitting,  setSubmitting]  = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [success,     setSuccess]     = useState(false);

  // ── Validation helper ───────────────────────────────────
  const isValid = year && university.trim() && degree.trim() && file;

  // ── Skill helpers ───────────────────────────────────────
  const addSkill = useCallback((s) => {
    const trimmed = s.trim();
    if (!trimmed || skills.includes(trimmed)) return;
    setSkills(prev => [...prev, trimmed]);
    setSkillInput('');
  }, [skills]);

  const removeSkill = (s) => setSkills(prev => prev.filter(x => x !== s));

  const handleSkillKeyDown = (e) => {
    if (['Enter', ',', 'Tab'].includes(e.key)) {
      e.preventDefault();
      addSkill(skillInput);
      setShowSkillSuggest(false);
    } else if (e.key === 'Backspace' && !skillInput && skills.length) {
      removeSkill(skills[skills.length - 1]);
    }
  };

  const filteredSkillSuggestions = SUGGESTED_SKILLS.filter(
    s => s.toLowerCase().includes(skillInput.toLowerCase()) && !skills.includes(s)
  );

  // ── Tag helpers ─────────────────────────────────────────
  const addTag = useCallback((raw) => {
    const t = raw.trim().replace(/^#+/, '');
    if (!t) return;
    const formatted = `#${t}`;
    if (tags.includes(formatted)) return;
    setTags(prev => [...prev, formatted]);
    setTagInput('');
  }, [tags]);

  const removeTag = (t) => setTags(prev => prev.filter(x => x !== t));

  const handleTagKeyDown = (e) => {
    if (['Enter', ',', ' '].includes(e.key)) {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === 'Backspace' && !tagInput && tags.length) {
      removeTag(tags[tags.length - 1]);
    }
  };

  // ── File helpers ────────────────────────────────────────
  const validateAndSetFile = (f) => {
    if (!f) return;
    setFileError('');
    const ext = '.' + f.name.split('.').pop().toLowerCase();
    if (!ACCEPTED_TYPES.includes(ext)) {
      setFileError(`Invalid file type. Accepted: ${ACCEPTED_TYPES.join(', ')}`);
      return;
    }
    if (f.size > MAX_FILE_MB * 1024 * 1024) {
      setFileError(`File too large. Max size: ${MAX_FILE_MB} MB`);
      return;
    }
    setFile(f);
    // Simulate a brief "scan" progress bar
    setUploadProgress(0);
    let p = 0;
    const iv = setInterval(() => {
      p += 18;
      setUploadProgress(Math.min(p, 100));
      if (p >= 100) clearInterval(iv);
    }, 60);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    validateAndSetFile(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);

  // ── Submit ──────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid || submitting) return;
    setSubmitError('');
    setSubmitting(true);

    // Build payload — skills + tags joined into the skillsTags string for the
    // existing API contract; tags stored separately if needed later.
    const allTags = [
      ...skills,
      ...tags,
    ].join(', ');

    try {
      if (file) {
        const fd = new FormData();
        fd.append('year',       Number(year));
        fd.append('university', university.trim());
        fd.append('degree',     degree.trim());
        fd.append('skillsTags', allTags);
        fd.append('file',       file);
        await onSubmit(fd, true);
      } else {
        await onSubmit({
          year:       Number(year),
          university: university.trim(),
          degree:     degree.trim(),
          skillsTags: allTags,
        }, false);
      }
      setSuccess(true);
      setTimeout(onClose, 1600);
    } catch (err) {
      setSubmitError(err?.response?.data?.message || 'Failed to add internship file. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ──────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-fade-in"
        style={{ maxHeight: '92vh' }}
      >
        {/* ── Header ── */}
        <div className="relative bg-gradient-to-br from-[#0084ad] to-[#005b81] px-8 py-6 shrink-0">
          {/* Decorative blobs */}
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 bg-white translate-x-12 -translate-y-12" />
          <div className="absolute bottom-0 left-20 w-24 h-24 rounded-full opacity-10 bg-white translate-y-8" />

          <div className="relative flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <span className="text-white/70 text-xs font-semibold uppercase tracking-widest">
                  Dossier de Stage
                </span>
              </div>
              <h2 className="text-xl font-bold text-white leading-tight">
                Add Internship File per Year
              </h2>
              <p className="text-white/60 text-sm mt-1 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                {candidateName}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="overflow-y-auto flex-1 px-8 py-6">

          {/* Success state */}
          {success && (
            <div className="flex flex-col items-center justify-center py-10 animate-fade-in">
              <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4 ring-4 ring-emerald-50">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">File Added Successfully!</h3>
              <p className="text-sm text-slate-500">Internship dossier has been saved.</p>
            </div>
          )}

          {!success && (
            <form id="internship-file-form" onSubmit={handleSubmit} className="space-y-6" noValidate>

              {/* Error banner */}
              {submitError && (
                <div className="flex items-start gap-3 bg-rose-50 border border-rose-200 rounded-2xl p-4 text-sm text-rose-700 animate-fade-in">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
                  {submitError}
                </div>
              )}

              {/* ── Row 1: Academic Year ── */}
              <div>
                <SectionLabel icon={Calendar} required>Academic Year</SectionLabel>
                <div className="relative">
                  <select
                    id="internship-year"
                    value={year}
                    onChange={e => setYear(Number(e.target.value))}
                    required
                    className="w-full appearance-none border border-slate-200 rounded-xl px-4 py-3 pr-10 text-sm text-slate-900 bg-white focus:border-[#0084ad] focus:ring-2 focus:ring-[#0084ad]/15 focus:outline-none transition-all cursor-pointer"
                  >
                    {ACADEMIC_YEARS.map(({ label, value }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* ── Row 2: University ── */}
              <div>
                <SectionLabel icon={Building2} required>University / Institution</SectionLabel>
                <div className="relative">
                  <input
                    id="internship-university"
                    type="text"
                    value={university}
                    onChange={e => setUniversity(e.target.value)}
                    list="uni-list"
                    placeholder="e.g. Université de Sfax, ENIS…"
                    required
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-[#0084ad] focus:ring-2 focus:ring-[#0084ad]/15 focus:outline-none transition-all"
                  />
                  <datalist id="uni-list">
                    {SUGGESTED_UNIVERSITIES.map(u => <option key={u} value={u} />)}
                  </datalist>
                </div>
              </div>

              {/* ── Row 3: Degree ── */}
              <div>
                <SectionLabel icon={BookOpen} required>Degree / Level</SectionLabel>
                <input
                  id="internship-degree"
                  type="text"
                  value={degree}
                  onChange={e => setDegree(e.target.value)}
                  placeholder="e.g. Master's in Software Engineering, Licence Informatique…"
                  required
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-[#0084ad] focus:ring-2 focus:ring-[#0084ad]/15 focus:outline-none transition-all"
                />
              </div>

              {/* ── Row 4: Skills ── */}
              <div>
                <SectionLabel icon={Cpu}>Skills</SectionLabel>
                <div
                  className="min-h-[3rem] border border-slate-200 rounded-xl px-3 py-2 flex flex-wrap gap-1.5 items-center cursor-text focus-within:border-[#0084ad] focus-within:ring-2 focus-within:ring-[#0084ad]/15 transition-all"
                  onClick={() => skillInputRef.current?.focus()}
                >
                  {skills.map(s => (
                    <Chip key={s} label={s} color="blue" onRemove={() => removeSkill(s)} />
                  ))}
                  <div className="relative flex-1 min-w-[140px]">
                    <input
                      ref={skillInputRef}
                      id="skills-input"
                      type="text"
                      value={skillInput}
                      onChange={e => { setSkillInput(e.target.value); setShowSkillSuggest(true); }}
                      onKeyDown={handleSkillKeyDown}
                      onFocus={() => setShowSkillSuggest(true)}
                      onBlur={() => setTimeout(() => setShowSkillSuggest(false), 150)}
                      placeholder={skills.length === 0 ? 'Type a skill and press Enter or comma…' : ''}
                      className="w-full text-sm py-1 focus:outline-none bg-transparent text-slate-900 placeholder-slate-400"
                    />
                    {/* Autocomplete dropdown */}
                    {showSkillSuggest && skillInput && filteredSkillSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden animate-fade-in">
                        {filteredSkillSuggestions.slice(0, 6).map(s => (
                          <button
                            key={s}
                            type="button"
                            onMouseDown={() => { addSkill(s); setShowSkillSuggest(false); }}
                            className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                          >
                            <Plus className="h-3 w-3 text-[#0084ad]" />
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {/* Quick-add suggested skills */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {SUGGESTED_SKILLS.filter(s => !skills.includes(s)).slice(0, 8).map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => addSkill(s)}
                      className="text-xs text-slate-500 border border-dashed border-slate-300 rounded-full px-2.5 py-0.5 hover:border-[#0084ad] hover:text-[#0084ad] transition-all"
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Row 5: Tags ── */}
              <div>
                <SectionLabel icon={Tag}>Tags</SectionLabel>
                <div
                  className="min-h-[3rem] border border-slate-200 rounded-xl px-3 py-2 flex flex-wrap gap-1.5 items-center cursor-text focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-300/30 transition-all"
                  onClick={() => tagInputRef.current?.focus()}
                >
                  {tags.map(t => (
                    <Chip key={t} label={t} color="violet" onRemove={() => removeTag(t)} />
                  ))}
                  <input
                    ref={tagInputRef}
                    id="tags-input"
                    type="text"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder={tags.length === 0 ? '#WebDev #AI #Finance — press Space or Enter' : ''}
                    className="flex-1 min-w-[200px] text-sm py-1 focus:outline-none bg-transparent text-slate-900 placeholder-slate-400"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1.5">
                  Type a tag and press <kbd className="bg-slate-100 border border-slate-200 rounded px-1 text-slate-600">Space</kbd> or <kbd className="bg-slate-100 border border-slate-200 rounded px-1 text-slate-600">Enter</kbd> — the <span className="font-mono">#</span> prefix is added automatically.
                </p>
              </div>

              {/* ── Row 6: Document Upload ── */}
              <div>
                <SectionLabel icon={Upload} required>Dossier de Stage Document</SectionLabel>

                {/* Drop Zone */}
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={[
                    'relative group border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 select-none',
                    isDragging
                      ? 'border-[#0084ad] bg-[#0084ad]/5 scale-[1.01]'
                      : file
                        ? 'border-emerald-300 bg-emerald-50'
                        : 'border-slate-200 bg-slate-50/50 hover:border-[#0084ad] hover:bg-[#0084ad]/5',
                  ].join(' ')}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={e => validateAndSetFile(e.target.files[0])}
                  />

                  {file ? (
                    <>
                      <div className="h-14 w-14 rounded-2xl bg-emerald-100 flex items-center justify-center mb-3 ring-4 ring-emerald-50">
                        <FileText className="h-7 w-7 text-emerald-600" />
                      </div>
                      <p className="font-semibold text-emerald-700 text-sm mb-0.5 text-center max-w-xs truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-emerald-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      {/* Progress bar */}
                      <div className="mt-4 w-full max-w-xs h-1.5 bg-emerald-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-75"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      {uploadProgress === 100 && (
                        <p className="text-xs text-emerald-600 mt-1.5 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Ready to submit
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); setFile(null); setUploadProgress(0); }}
                        className="mt-3 text-xs text-slate-400 hover:text-rose-500 transition-colors underline"
                      >
                        Remove file
                      </button>
                    </>
                  ) : (
                    <>
                      <div className={[
                        'h-14 w-14 rounded-2xl flex items-center justify-center mb-3 transition-all',
                        isDragging ? 'bg-[#0084ad]/20 ring-4 ring-[#0084ad]/10' : 'bg-slate-100 group-hover:bg-[#0084ad]/10',
                      ].join(' ')}>
                        <FolderOpen className={`h-7 w-7 transition-colors ${isDragging ? 'text-[#0084ad]' : 'text-slate-400 group-hover:text-[#0084ad]'}`} />
                      </div>
                      <p className="font-semibold text-slate-700 text-sm mb-1">
                        {isDragging ? 'Drop to upload' : 'Drag & drop your document here'}
                      </p>
                      <p className="text-xs text-slate-400 mb-3">or click to browse</p>
                      <span className="text-xs bg-white border border-slate-200 text-slate-500 px-3 py-1 rounded-full shadow-sm">
                        PDF, DOC, DOCX · Max {MAX_FILE_MB} MB
                      </span>
                    </>
                  )}
                </div>

                {fileError && (
                  <p className="flex items-center gap-1.5 text-xs text-rose-600 mt-2 animate-fade-in">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {fileError}
                  </p>
                )}
              </div>

              {/* ── Validation hint ── */}
              {!isValid && (
                <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  Please fill in University, Degree, and attach a document before submitting.
                </div>
              )}

            </form>
          )}
        </div>

        {/* ── Footer ── */}
        {!success && (
          <div className="shrink-0 border-t border-slate-100 px-8 py-5 bg-slate-50/60 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none sm:px-6 border border-slate-200 text-slate-600 font-semibold py-3 rounded-xl hover:bg-slate-100 transition-all text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="internship-file-form"
              disabled={!isValid || submitting}
              className={[
                'flex-1 flex items-center justify-center gap-2 font-semibold py-3 rounded-xl text-sm transition-all duration-200',
                isValid && !submitting
                  ? 'bg-gradient-to-r from-[#0084ad] to-[#006990] text-white shadow-lg shadow-[#0084ad]/30 hover:shadow-xl hover:shadow-[#0084ad]/40 hover:-translate-y-0.5'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed',
              ].join(' ')}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                <>
                  <GraduationCap className="h-4 w-4" />
                  Submit Dossier
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
