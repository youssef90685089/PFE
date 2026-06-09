import { useState } from 'react';
import { Briefcase, User, Brain, Rocket, CheckCircle2, AlertCircle, Loader2, TrendingUp, Star } from 'lucide-react';
import axios from '../../api/axios';

export default function ProjectAssignmentPage() {
  const [cvText, setCvText] = useState('');
  const [roadmap, setRoadmap] = useState('');
  const [matchedProjects, setMatchedProjects] = useState([]);
  const [detectedSkills, setDetectedSkills] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const hasResults = matchedProjects.length > 0 || !!roadmap;

  const handleGenerateRoadmap = async () => {
    if (!cvText.trim()) {
      setError('Please enter CV text to generate a roadmap.');
      return;
    }
    setGenerating(true);
    setError('');
    try {
      const res = await axios.post('/ai/match-cv-to-projects', cvText, {
        headers: { 'Content-Type': 'text/plain' }
      });
      const data = res.data?.data;
      setRoadmap(data?.roadmap || '');
      setMatchedProjects(data?.matchedProjects || []);
      setDetectedSkills(data?.detectedSkills || '');
    } catch (err) {
      setError('Failed to generate roadmap. Please try again.');
      console.error('Error:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleReset = () => {
    setRoadmap('');
    setMatchedProjects([]);
    setDetectedSkills('');
    setError('');
  };

  /** Score → color tier */
  const getScoreBadgeClass = (score) => {
    if (score >= 70) return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
    if (score >= 40) return 'bg-amber-100 text-amber-700 border border-amber-200';
    return 'bg-slate-100 text-slate-600 border border-slate-200';
  };

  const getScoreLabel = (score) => {
    if (score >= 70) return '⭐ Excellent';
    if (score >= 40) return '✓ Good';
    return '~ Learning';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Briefcase className="h-7 w-7 text-primary-600" />
          Assign Project &amp; Tutor
        </h1>
        <p className="text-slate-500 mt-1">Match candidates with projects using AI-powered CV analysis.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Input Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
              <User className="h-4 w-4 text-primary-500" />
              Candidate Analysis
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 ml-1">PASTE CV TEXT</label>
                <textarea
                  className="w-full h-48 p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm resize-none"
                  placeholder="Paste candidate's CV text here for AI analysis..."
                  value={cvText}
                  onChange={(e) => setCvText(e.target.value)}
                />
              </div>

              <button
                onClick={handleGenerateRoadmap}
                disabled={generating}
                className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary-500/20 disabled:opacity-50"
              >
                {generating ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Brain className="h-5 w-5" />
                )}
                {generating ? 'Analyzing...' : 'Match CV to Projects'}
              </button>
            </div>
          </div>
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
              {!hasResults && !generating ? (
                /* Empty state */
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                  <Brain className="h-16 w-16 text-slate-300" />
                  <div>
                    <p className="text-slate-900 font-bold">Waiting for input...</p>
                    <p className="text-slate-500 text-xs mt-1 max-w-[200px]">
                      Paste CV text and click "Match CV to Projects" to find the best-fit projects.
                    </p>
                  </div>
                </div>
              ) : generating ? (
                /* Loading state */
                <div className="h-full flex flex-col items-center justify-center space-y-4">
                  <div className="h-12 w-12 rounded-full border-4 border-primary-500/20 border-t-primary-600 animate-spin" />
                  <p className="text-sm font-bold text-slate-600 animate-pulse">Analyzing CV &amp; Matching Projects...</p>
                </div>
              ) : (
                /* Results */
                <div className="space-y-6 animate-fade-in">

                  {/* Detected Skills */}
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

                  {/* Matched Projects */}
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
                            {/* Header row */}
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

                            {/* Score bar */}
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

                            {/* Description */}
                            {project.projectDescription && (
                              <p className="text-xs text-slate-600 mb-2 line-clamp-2 leading-relaxed">
                                {project.projectDescription}
                              </p>
                            )}

                            {/* Tech tags */}
                            {project.technologyTags && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {project.technologyTags.split(/[,\s\/]+/).filter(Boolean).map((tag, ti) => (
                                  <span key={ti} className="text-[10px] px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded font-medium uppercase">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Reasoning */}
                            <p className="text-xs text-slate-500 italic leading-relaxed">{project.matchReasoning}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-slate-400">
                      <Star className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm font-medium">No matching projects found.</p>
                      <p className="text-xs mt-1">Try adding more tech keywords to the CV.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer action bar */}
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

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm animate-shake">
              <AlertCircle className="h-5 w-5 shrink-0" />
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
