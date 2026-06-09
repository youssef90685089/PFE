import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload, FileText, Check, X, AlertCircle, Loader2,
  Brain, Sparkles, ChevronDown, ChevronUp, Target, Star,
  BookOpen, ArrowRight, RefreshCw, Zap
} from 'lucide-react';
import { candidatesApi } from '../../api/axios';

// ── Score helpers ────────────────────────────────────────────────────────────
const scoreColor  = (s) => s >= 70 ? '#059669' : s >= 40 ? '#d97706' : '#dc2626';
const scoreBgCls  = (s) => s >= 70 ? 'score-high' : s >= 40 ? 'score-mid' : 'score-low';
const scoreLabel  = (s) => s >= 70 ? 'Excellent match' : s >= 40 ? 'Good match' : 'Partial match';

export default function CVUploadPage() {
  const navigate = useNavigate();

  // Upload state
  const [uploading, setUploading]     = useState(false);
  const [dragActive, setDragActive]   = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [error, setError]             = useState('');

  // AI results state
  const [aiResult, setAiResult]         = useState(null); // CvProjectMatchDto
  const [roadmapOpen, setRoadmapOpen]   = useState(false);

  // ── Drag & Drop ──────────────────────────────────────────────────────────
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) handleFile(files[0]);
  }, []);

  // ── File handling ────────────────────────────────────────────────────────
  const handleFile = async (file) => {
    setError('');
    setAiResult(null);

    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(pdf|docx?)$/i)) {
      setError('Invalid file type. Please upload a PDF or DOCX file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10 MB. Please upload a smaller file.');
      return;
    }

    setUploadedFile({ name: file.name, size: (file.size / 1024 / 1024).toFixed(2) + ' MB' });
    setUploading(true);

    try {
      const res = await candidatesApi.uploadCV(file);
      const data = res.data?.data;
      setAiResult(data);
    } catch (err) {
      setError(err.response?.data?.message || 'AI analysis failed. Please try again.');
      setUploadedFile(null);
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleReset = () => {
    setUploadedFile(null);
    setAiResult(null);
    setError('');
    setRoadmapOpen(false);
  };

  // ── Skill chips from "Skills detected: …" string ────────────────────────
  const parseSkills = (skillsStr) => {
    if (!skillsStr) return [];
    const match = skillsStr.match(/Skills detected:\s*(.+)/i);
    if (!match) return [skillsStr];
    return match[1].split(',').map((s) => s.trim()).filter(Boolean);
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ── Page header ──────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 flex items-center gap-2">
            <Brain className="h-7 w-7 text-primary-500" />
            AI CV Analyzer
          </h1>
          <p className="text-surface-500 mt-1">
            Upload your CV — our AI instantly matches you to the best available projects
          </p>
        </div>
        {aiResult && (
          <button
            onClick={handleReset}
            className="flex items-center gap-2 rounded-xl border border-surface-200 px-4 py-2 text-sm font-medium text-surface-600 hover:bg-surface-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4" /> New CV
          </button>
        )}
      </div>

      {/* ── Upload area (hide once results are shown) ─────────────── */}
      {!aiResult && (
        <>
          {/* Guidelines */}
          <div className="bg-primary-50 rounded-2xl p-5 border border-primary-100">
            <h3 className="font-semibold text-primary-900 mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary-600" /> How it works
            </h3>
            <ul className="text-sm text-primary-700 space-y-1.5">
              {[
                'Upload your CV (PDF or DOCX, max 10 MB)',
                'AI extracts your skills and experience',
                'Instantly matches you to available projects',
                'Get a personalised 4-week roadmap',
              ].map((tip) => (
                <li key={tip} className="flex items-start gap-2">
                  <Check className="h-4 w-4 mt-0.5 shrink-0 text-primary-600" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Drop zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
              dragActive
                ? 'border-primary-500 bg-primary-50'
                : 'border-surface-200 hover:border-primary-300 hover:bg-surface-50'
            }`}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="h-16 w-16 rounded-2xl bg-primary-100 flex items-center justify-center">
                    <Brain className="h-8 w-8 text-primary-600 animate-pulse" />
                  </div>
                  <Loader2 className="h-6 w-6 animate-spin text-primary-500 absolute -bottom-1 -right-1" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-surface-800">Analysing your CV…</p>
                  <p className="text-sm text-surface-500 mt-1">AI is reading your skills and matching projects</p>
                </div>
                <div className="flex gap-1">
                  {['Extracting text', 'Detecting skills', 'Matching projects'].map((step, i) => (
                    <span key={step} className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-lg animate-pulse" style={{ animationDelay: `${i * 0.3}s` }}>
                      {step}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center gap-4 cursor-pointer">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center shadow-sm">
                  <Upload className="h-8 w-8 text-primary-500" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-surface-900">
                    {uploadedFile ? uploadedFile.name : 'Drag & drop your CV here'}
                  </p>
                  <p className="text-sm text-surface-500 mt-1">or click to browse files</p>
                </div>
                <input
                  type="file"
                  onChange={handleFileInput}
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  id="cv-upload"
                />
                <span className="flex items-center gap-2 px-4 py-2 bg-surface-100 rounded-lg text-sm text-surface-600">
                  <FileText className="h-4 w-4" /> PDF · DOCX · DOC
                </span>
              </label>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 rounded-xl bg-red-50 px-4 py-3 text-red-700 border border-red-100">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}
        </>
      )}

      {/* ── AI Results ──────────────────────────────────────────────── */}
      {aiResult && (
        <div className="space-y-5 animate-fade-in">

          {/* File info bar */}
          <div className="flex items-center gap-3 rounded-2xl border border-surface-200 bg-white px-5 py-3 shadow-sm">
            <div className="h-9 w-9 rounded-xl bg-primary-100 flex items-center justify-center">
              <FileText className="h-4 w-4 text-primary-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-surface-800 truncate">{uploadedFile?.name}</p>
              <p className="text-xs text-surface-400">{uploadedFile?.size} · Analysed successfully</p>
            </div>
            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
              <Check className="h-3.5 w-3.5" /> AI Complete
            </span>
          </div>

          {/* Detected skills */}
          {aiResult.detectedSkills && (
            <div className="rounded-2xl border border-surface-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-surface-700 mb-3 flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" />
                Skills Detected from your CV
              </h3>
              <div className="flex flex-wrap gap-2">
                {parseSkills(aiResult.detectedSkills).length > 0
                  ? parseSkills(aiResult.detectedSkills).map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200 px-3 py-1 text-sm font-medium text-primary-800"
                      >
                        {skill}
                      </span>
                    ))
                  : (
                    <p className="text-sm text-surface-500 italic">
                      No specific tech skills detected — consider adding technologies to your CV.
                    </p>
                  )
                }
              </div>
            </div>
          )}

          {/* Matched projects */}
          <div>
            <h2 className="text-lg font-bold text-surface-900 mb-3 flex items-center gap-2">
              <Target className="h-5 w-5 text-primary-500" />
              Recommended Projects
              <span className="ml-auto text-sm font-normal text-surface-400">
                {aiResult.matchedProjects?.length ?? 0} matches found
              </span>
            </h2>

            {(!aiResult.matchedProjects || aiResult.matchedProjects.length === 0) ? (
              <div className="rounded-2xl border border-dashed border-surface-300 p-10 text-center text-surface-400">
                <Target className="h-10 w-10 mx-auto mb-3 text-surface-300" />
                <p className="font-medium">No projects available yet</p>
                <p className="text-sm mt-1">Projects will appear here once managers submit them</p>
              </div>
            ) : (
              <div className="space-y-3">
                {aiResult.matchedProjects.map((project, idx) => {
                  const score = project.matchScore ?? 0;
                  return (
                    <div
                      key={project.projectId}
                      className="rounded-2xl border bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
                      style={{ borderColor: idx === 0 ? '#a78bfa' : '#e2e8f0', animationDelay: `${idx * 60}ms` }}
                    >
                      {/* Header row */}
                      <div className="flex items-start gap-4">
                        {/* Rank badge */}
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold"
                          style={{
                            background: idx === 0 ? 'linear-gradient(135deg,#7c3aed,#a78bfa)' : '#f1f5f9',
                            color: idx === 0 ? '#fff' : '#64748b',
                          }}
                        >
                          {idx === 0 ? <Star className="h-4 w-4" /> : `#${idx + 1}`}
                        </div>

                        {/* Title + reasoning */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <p className="font-bold text-surface-900 leading-snug">
                              {project.projectTitle}
                            </p>
                            {/* Score pill */}
                            <div
                              className="shrink-0 rounded-xl px-3 py-1.5 text-center"
                              style={{ background: score >= 70 ? '#ecfdf5' : score >= 40 ? '#fffbeb' : '#fef2f2',
                                       border: `1px solid ${score >= 70 ? '#a7f3d0' : score >= 40 ? '#fcd34d' : '#fecaca'}` }}
                            >
                              <p className="text-lg font-black leading-none" style={{ color: scoreColor(score) }}>
                                {score.toFixed(0)}%
                              </p>
                              <p className="text-[10px] text-surface-400 mt-0.5">{scoreLabel(score)}</p>
                            </div>
                          </div>

                          {/* Match reasoning */}
                          <p className="text-sm text-surface-500 mt-1.5 leading-relaxed">
                            {project.matchReasoning}
                          </p>

                          {/* Tech tags */}
                          {project.technologyTags && (
                            <div className="flex flex-wrap gap-1.5 mt-3">
                              {project.technologyTags.split(',').map((t) => t.trim()).filter(Boolean).map((tag) => (
                                <span
                                  key={tag}
                                  className="rounded-md bg-surface-100 px-2 py-0.5 text-[11px] font-medium text-surface-600"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* AI Roadmap (collapsible) */}
          {aiResult.roadmap && (
            <div className="rounded-2xl border border-surface-200 bg-white shadow-sm overflow-hidden">
              <button
                onClick={() => setRoadmapOpen((o) => !o)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-surface-50 transition-colors"
              >
                <span className="font-semibold text-surface-800 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary-500" />
                  AI-Generated 4-Week Roadmap
                </span>
                {roadmapOpen
                  ? <ChevronUp className="h-4 w-4 text-surface-400" />
                  : <ChevronDown className="h-4 w-4 text-surface-400" />
                }
              </button>
              {roadmapOpen && (
                <div className="px-5 pb-5 border-t border-surface-100">
                  <div className="prose prose-sm max-w-none mt-4">
                    {aiResult.roadmap.split('\n').map((line, i) => {
                      if (line.startsWith('###')) {
                        return <h3 key={i} className="text-base font-bold text-surface-900 mt-4 mb-2">{line.replace(/^#+\s*/, '')}</h3>;
                      }
                      if (line.startsWith('####')) {
                        return <h4 key={i} className="text-sm font-semibold text-primary-700 mt-3 mb-1">{line.replace(/^#+\s*/, '')}</h4>;
                      }
                      if (line.startsWith('**') && line.endsWith('**')) {
                        return <p key={i} className="font-semibold text-surface-800 mt-2">{line.replace(/\*\*/g, '')}</p>;
                      }
                      if (line.startsWith('-')) {
                        return <p key={i} className="text-sm text-surface-600 ml-3 mt-1">• {line.slice(1).trim()}</p>;
                      }
                      if (line.trim() === '') return <div key={i} className="h-1" />;
                      return <p key={i} className="text-sm text-surface-600 mt-1">{line}</p>;
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CTA buttons */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={() => navigate('/dashboard/my-applications')}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-surface-200 px-6 py-3 text-sm font-medium text-surface-600 hover:bg-surface-50 transition-colors"
            >
              My Applications
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-3 text-sm font-semibold text-white hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg shadow-primary-500/20"
            >
              Go to Dashboard <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}