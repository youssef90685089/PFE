import { useEffect, useState } from 'react';
import { aiApi, supervisorsApi } from '../../api/axios';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Brain, Sparkles, Users } from 'lucide-react';

export default function AiInsightsPage() {
  const [projectRankings, setProjectRankings] = useState([]);
  const [candidateMatchings, setCandidateMatchings] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [selectedSupervisor, setSelectedSupervisor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('projects');

  useEffect(() => {
    supervisorsApi.getAll().then(r => setSupervisors(r.data?.data || [])).catch(console.error);
  }, []);

  const rankProjects = async () => {
    setLoading(true);
    try {
      const res = await aiApi.rankProjects();
      setProjectRankings(res.data?.data || []);
    } catch (e) { alert(e.response?.data?.message || 'Ranking failed'); }
    finally { setLoading(false); }
  };

  const matchCandidates = async (supId) => {
    setSelectedSupervisor(supId);
    setLoading(true);
    try {
      const res = await aiApi.matchCandidates(supId);
      setCandidateMatchings(res.data?.data || []);
      setTab('candidates');
    } catch (e) { alert(e.response?.data?.message || 'Matching failed'); }
    finally { setLoading(false); }
  };

  const scoreColor = (s) => s >= 80 ? 'text-emerald-600' : s >= 50 ? 'text-amber-600' : 'text-red-500';
  const scoreBg = (s) => s >= 80 ? 'bg-emerald-50 border-emerald-200' : s >= 50 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200';

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 flex items-center gap-2">
            <Brain className="h-7 w-7 text-primary-500" /> AI Insights
          </h1>
          <p className="text-surface-500 mt-1">AI-powered project ranking and candidate-supervisor matching</p>
        </div>
        <button onClick={rankProjects} disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 hover:from-primary-600 hover:to-primary-700 disabled:opacity-60 transition-all">
          <Sparkles className="h-4 w-4" /> Run AI Analysis
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button onClick={() => setTab('projects')}
          className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${tab === 'projects' ? 'bg-primary-500 text-white' : 'bg-surface-100 text-surface-600'}`}>
          Project Rankings
        </button>
        <button onClick={() => setTab('candidates')}
          className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${tab === 'candidates' ? 'bg-primary-500 text-white' : 'bg-surface-100 text-surface-600'}`}>
          Candidate Matching
        </button>
      </div>

      {loading && <LoadingSpinner />}

      {/* Project Rankings */}
      {tab === 'projects' && !loading && (
        <div className="space-y-3">
          {projectRankings.length === 0 && (
            <div className="rounded-2xl border border-dashed border-surface-300 p-12 text-center text-surface-400">
              <Sparkles className="h-10 w-10 mx-auto mb-3 text-surface-300" />
              <p className="font-medium">No rankings yet</p>
              <p className="text-sm mt-1">Click "Run AI Analysis" to rank submitted projects</p>
            </div>
          )}
          {projectRankings.map((r, idx) => (
            <div key={r.referenceId} className={`rounded-2xl border bg-white p-5 animate-fade-in shadow-sm`} style={{ animationDelay: `${idx * 50}ms` }}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-surface-100 text-sm font-bold text-surface-600">#{idx + 1}</span>
                  <div>
                    <p className="font-bold text-surface-800">{r.referenceName}</p>
                    <p className="text-xs text-surface-400 mt-0.5 max-w-xl">{r.reasoning}</p>
                  </div>
                </div>
                <div className={`rounded-xl border px-3 py-1.5 ${scoreBg(r.score)}`}>
                  <span className={`text-lg font-bold ${scoreColor(r.score)}`}>{r.score.toFixed(1)}</span>
                  <span className="text-xs text-surface-400 ml-0.5">/100</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Candidate Matching */}
      {tab === 'candidates' && !loading && (
        <div className="space-y-4">
          {/* Supervisor Selector */}
          <div className="rounded-2xl border border-surface-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-surface-700 mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" /> Select Supervisor to Match
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {supervisors.map(s => (
                <button key={s.id} onClick={() => matchCandidates(s.id)}
                  className={`rounded-xl border p-3 text-left transition-all ${
                    selectedSupervisor === s.id ? 'border-primary-400 bg-primary-50 shadow-sm' : 'border-surface-200 hover:border-surface-300'
                  }`}>
                  <p className="font-medium text-sm text-surface-800">{s.fullName}</p>
                  <p className="text-xs text-surface-400">{s.department}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {s.expertiseTags?.split(',').slice(0, 3).map(t => (
                      <span key={t} className="rounded bg-surface-100 px-1.5 py-0.5 text-[10px] text-surface-600">{t.trim()}</span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          {candidateMatchings.map((r, idx) => (
            <div key={r.referenceId} className="rounded-2xl border border-surface-200 bg-white p-5 animate-fade-in shadow-sm" style={{ animationDelay: `${idx * 50}ms` }}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-surface-800">{r.referenceName}</p>
                  <p className="text-xs text-surface-400 mt-1">{r.reasoning}</p>
                </div>
                <div className={`rounded-xl border px-3 py-1.5 ${scoreBg(r.score)}`}>
                  <span className={`text-lg font-bold ${scoreColor(r.score)}`}>{r.score.toFixed(1)}</span>
                  <span className="text-xs text-surface-400 ml-0.5">%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
