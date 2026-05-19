import { useState } from 'react';
import { Briefcase, User, Search, Brain, Rocket, ChevronRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import axios from '../../api/axios';

export default function ProjectAssignmentPage() {
  const [candidateId, setCandidateId] = useState('');
  const [cvText, setCvText] = useState('');
  const [roadmap, setRoadmap] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [brandSearch, setBrandSearch] = useState('');
  const [brandData, setBrandData] = useState(null);
  const [searchingBrand, setSearchingBrand] = useState(false);

  const BRANDFETCH_KEY = "1idsJnI6FqSziZ2zdsJ";

  const handleGenerateRoadmap = async () => {
    if (!cvText.trim()) {
      setError('Please enter CV text to generate a roadmap.');
      return;
    }
    setGenerating(true);
    setError('');
    try {
      const res = await axios.post('/api/ai/generate-roadmap', cvText, {
        headers: { 'Content-Type': 'text/plain' }
      });
      setRoadmap(res.data?.data || res.data);
    } catch (err) {
      setError('Failed to generate roadmap. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleBrandSearch = async () => {
    if (!brandSearch.trim()) return;
    setSearchingBrand(true);
    try {
      const url = new URL(`https://api.brandfetch.io/v2/search/${brandSearch}`);
      url.searchParams.set('c', BRANDFETCH_KEY);
      
      const response = await fetch(url, { method: 'GET' });
      const data = await response.json();
      setBrandData(data[0] || data); // Usually returns an array
    } catch (err) {
      console.error('Brandfetch error:', err);
    } finally {
      setSearchingBrand(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Briefcase className="h-7 w-7 text-primary-600" />
          Assign Project & Tutor
        </h1>
        <p className="text-slate-500 mt-1">Match candidates with projects and generate custom roadmaps using AI.</p>
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
                Generate AI Roadmap
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
              <Search className="h-4 w-4 text-primary-500" />
              Company / Brand Lookup
            </h2>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search company (e.g. google.com)"
                className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleBrandSearch()}
              />
              <button 
                onClick={handleBrandSearch}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors"
              >
                Search
              </button>
            </div>

            {brandData && (
              <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-4 animate-fade-in">
                {brandData.icon && <img src={brandData.icon} alt="Logo" className="h-10 w-10 rounded-lg shadow-sm" />}
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{brandData.name || brandData.domain}</h4>
                  <p className="text-[10px] text-slate-500">{brandData.domain}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: AI Output Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden min-h-[500px] flex flex-col">
            <div className="bg-slate-900 p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Rocket className="h-5 w-5 text-primary-400" />
                <h3 className="text-white font-bold tracking-tight">AI Generated Program</h3>
              </div>
              {roadmap && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-300 border border-primary-500/30">DRAFT READY</span>}
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
              {!roadmap && !generating ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                  <Brain className="h-16 w-16 text-slate-300" />
                  <div>
                    <p className="text-slate-900 font-bold">Waiting for input...</p>
                    <p className="text-slate-500 text-xs mt-1 max-w-[200px]">Paste CV text and click generate to build a custom 4-week roadmap.</p>
                  </div>
                </div>
              ) : generating ? (
                <div className="h-full flex flex-col items-center justify-center space-y-4">
                  <div className="h-12 w-12 rounded-full border-4 border-primary-500/20 border-t-primary-600 animate-spin" />
                  <p className="text-sm font-bold text-slate-600 animate-pulse">Analyzing CV & Drafting Program...</p>
                </div>
              ) : (
                <div className="prose prose-slate prose-sm max-w-none animate-fade-in">
                  <div className="whitespace-pre-wrap text-slate-700 leading-relaxed font-medium">
                    {roadmap}
                  </div>
                </div>
              )}
            </div>

            {roadmap && (
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
                <button className="flex-1 py-2.5 bg-primary-600 text-white rounded-xl text-xs font-bold hover:bg-primary-700 transition-all flex items-center justify-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> Confirm & Assign
                </button>
                <button onClick={() => setRoadmap('')} className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-white transition-all">
                  Regenerate
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
