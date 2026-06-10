import { useState, useEffect } from 'react';
import { Briefcase, User, Brain, Rocket, CheckCircle2, AlertCircle, Loader2, TrendingUp, Star, Search } from 'lucide-react';
import axios, { candidatesApi } from '../../api/axios';

export default function ProjectAssignmentPage() {
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [roadmap, setRoadmap] = useState('');
  const [matchedProjects, setMatchedProjects] = useState([]);
  const [detectedSkills, setDetectedSkills] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const hasResults = matchedProjects.length > 0 || !!roadmap;

  useEffect(() => {
    const loadCandidates = async () => {
      try {
        const res = await candidatesApi.getAll();
        setCandidates(res.data?.data || []);
      } catch (err) {
        setError('Failed to load candidates.');
      } finally {
        setLoading(false);
      }
    };
    loadCandidates();
  }, []);

  const handleCandidateSelect = async (e) => {
    const candidateId = e.target.value;
    setSelectedCandidateId(candidateId);
    setError('');
    if (!candidateId) {
      setRoadmap('');
      setMatchedProjects([]);
      setDetectedSkills('');
      return;
    }
    setGenerating(true);
    setError('');
    setMessage('');
    try {
      const res = await axios.post(`/ai/match-candidate/${candidateId}`);
      const data = res.data?.data;
      setRoadmap(data?.roadmap || '');
      setMatchedProjects(data?.matchedProjects || []);
      setDetectedSkills(data?.detectedSkills || '');
      setMessage(data?.message || '');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to match candidate.');
      setRoadmap('');
      setMatchedProjects([]);
      setDetectedSkills('');
    } finally {
      setGenerating(false);
    }
  };

  const handleReset = () => {
    setSelectedCandidateId('');
    setRoadmap('');
    setMatchedProjects([]);
    setDetectedSkills('');
    setError('');
  };

  const getScoreBadgeClass = (score) => {
    if (score >= 70) return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
    if (score >= 40) return 'bg-amber-100 text-amber-700 border border-amber-200';
    return 'bg-slate-100 text-slate-600 border border-slate-200';
  };

  const getScoreLabel = (score) => {
    if (score >= 70) return 'Excellent';
    if (score >= 40) return 'Good';
    return 'Learning';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Briefcase className="h-7 w-7 text-primary-600" />
          Assign Project &amp; Tutor
        </h1>
        <p className="text-slate-500 mt-1">Select a candidate to automatically match them with the best-fit projects using their uploaded CV.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Candidate Selector */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
              <User className="h-4 w-4 text-primary-500" />
              Select Candidate
            </h2>

            <div className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 ml-1">CANDIDATE</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <select
                      value={selectedCandidateId}
                      onChange={handleCandidateSelect}
                      className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm appearance-none bg-white"
                    >
                      <option value="">-- Select a candidate --</option>
                      {candidates.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.firstName} {c.lastName} — {c.email}
                        </option>
                      ))}
                    </select>
                  </div>
                  {selectedCandidateId && (
                    <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Candidate selected. AI matching in progress...
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Candidate info */}
          {selectedCandidateId && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="font-bold text-slate-900 mb-3 flex items-center gap-2 text-xs uppercase tracking-wider">
                <Star className="h-4 w-4 text-amber-500" />
                Candidate Details
              </h2>
              {(() => {
                const c = candidates.find((c) => String(c.id) === selectedCandidateId);
                if (!c) return null;
                return (
                  <div className="space-y-2 text-sm">
                    <p className="text-slate-700"><span className="font-semibold text-slate-900">Name:</span> {c.firstName} {c.lastName}</p>
                    <p className="text-slate-700"><span className="font-semibold text-slate-900">Email:</span> {c.email}</p>
                    <p className="text-slate-700"><span className="font-semibold text-slate-900">Phone:</span> {c.phone || '—'}</p>
                    <p className="text-slate-700"><span className="font-semibold text-slate-900">CIN:</span> {c.cin || '—'}</p>
                    <p className="text-slate-700"><span className="font-semibold text-slate-900">Skills:</span> {c.skillsTags || '—'}</p>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* Right: AI Output Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden min-h-[500px] flex flex-col">
            <div className="bg-slate-900 p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Rocket className="h-5 w-5 text-primary-400" />
                <h3 className="text-white font-bold tracking-tight">AI Project Matches</h3>
              </div>
              {hasResults && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-300 border border-primary-500/30">
                  RESULTS READY
                </span>
              )}
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
              {!selectedCandidateId && !generating ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                  <Brain className="h-16 w-16 text-slate-300" />
                  <div>
                    <p className="text-slate-900 font-bold">Waiting for selection...</p>
                    <p className="text-slate-500 text-xs mt-1 max-w-[220px]">
                      Select a candidate from the left panel to automatically match them with the best-fit projects and tutors.
                    </p>
                  </div>
                </div>
              ) : generating ? (
                <div className="h-full flex flex-col items-center justify-center space-y-4">
                  <div className="h-12 w-12 rounded-full border-4 border-primary-500/20 border-t-primary-600 animate-spin" />
                  <p className="text-sm font-bold text-slate-600 animate-pulse">Analyzing CV &amp; Matching Projects...</p>
                </div>
              ) : (
                <div className="space-y-6 animate-fade-in">

                  {detectedSkills && (
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                      <p className="text-xs font-bold text-blue-900 mb-2 uppercase tracking-wide">Detected Skills</p>
                      <div className="flex flex-wrap gap-1.5">
                        {detectedSkills.replace('Skills detected: ', '').split(', ').map((skill, i) => (
                          <span key={i} className="text-[11px] px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full font-medium">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {matchedProjects.length > 0 ? (
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider flex items-center gap-2">
                        <TrendingUp className="h-3.5 w-3.5 text-primary-600" />
                        Top {matchedProjects.length} Recommended Projects
                      </h4>
                      <div className="space-y-3">
                        {matchedProjects.map((project, idx) => (
                          <div
                            key={idx}
                            className="p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-primary-300 hover:bg-primary-50/30 transition-all"
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold flex items-center justify-center">
                                  {idx + 1}
                                </span>
                                <h5 className="font-bold text-sm text-slate-900 truncate">{project.projectTitle}</h5>
                              </div>
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${getScoreBadgeClass(project.matchScore)}`}>
                                  {project.matchScore}%
                                </span>
                                <span className="text-[10px] text-slate-500 font-medium">{getScoreLabel(project.matchScore)}</span>
                              </div>
                            </div>

                            <div className="w-full h-1.5 bg-slate-200 rounded-full mb-3">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${project.matchScore}%`,
                                  background: project.matchScore >= 70
                                    ? 'linear-gradient(90deg,#10b981,#059669)'
                                    : project.matchScore >= 40
                                      ? 'linear-gradient(90deg,#f59e0b,#d97706)'
                                      : 'linear-gradient(90deg,#94a3b8,#64748b)'
                                }}
                              />
                            </div>

                            {project.projectDescription && (
                              <p className="text-xs text-slate-600 mb-2 line-clamp-2 leading-relaxed">
                                {project.projectDescription}
                              </p>
                            )}

                            {project.technologyTags && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {project.technologyTags.split(/[,\s\/]+/).filter(Boolean).map((tag, ti) => (
                                  <span key={ti} className="text-[10px] px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded font-medium uppercase">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}

                            <p className="text-xs text-slate-500 italic leading-relaxed">{project.matchReasoning}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    !generating && selectedCandidateId && !message && (
                      <div className="text-center py-6 text-slate-400">
                        <Star className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        <p className="text-sm font-medium">No matching projects found.</p>
                        <p className="text-xs mt-1">This candidate may not have a CV document uploaded or matching skills.</p>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            {hasResults && (
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
                <button className="flex-1 py-2.5 bg-primary-600 text-white rounded-xl text-xs font-bold hover:bg-primary-700 transition-all flex items-center justify-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> Confirm &amp; Assign
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-white transition-all"
                >
                  Reset
                </button>
              </div>
            )}
          </div>

          {message && !error && (
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-center gap-3 text-amber-700 text-sm">
              <AlertCircle className="h-5 w-5 shrink-0" />
              {message}
            </div>
          )}
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm">
              <AlertCircle className="h-5 w-5 shrink-0" />
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}