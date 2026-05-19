import { useState } from 'react';
import { CalendarDays, User, Clock, CheckCircle2, ChevronRight, Search } from 'lucide-react';

export default function InterviewPage() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <CalendarDays className="h-7 w-7 text-primary-600" />
          Schedule & Conduct Interview
        </h1>
        <p className="text-slate-500 mt-1">Manage candidate interviews and evaluation process.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Candidate List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search candidates..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-primary-200 hover:bg-primary-50/30 transition-all cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                      C{i}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 text-sm">Candidate Name {i}</h3>
                      <p className="text-xs text-slate-500">Full Stack Developer · Score: 85%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-100">
                      AWAITING INTERVIEW
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-primary-500 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Quick Actions / Stats */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary-600" />
              Upcoming Today
            </h2>
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-xs font-bold text-primary-600 mb-1">10:30 AM</p>
                <p className="text-sm font-semibold text-slate-800">John Doe</p>
                <p className="text-[10px] text-slate-500">Technical Interview (Room A)</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-xs font-bold text-primary-600 mb-1">02:00 PM</p>
                <p className="text-sm font-semibold text-slate-800">Jane Smith</p>
                <p className="text-[10px] text-slate-500">HR Evaluation (Remote)</p>
              </div>
            </div>
          </div>

          <div className="bg-primary-600 rounded-2xl p-6 text-white shadow-lg shadow-primary-600/20">
            <h3 className="font-bold mb-2">Conduct Evaluation</h3>
            <p className="text-primary-100 text-xs mb-4">Access the real-time scoring system and interview guidelines.</p>
            <button className="w-full py-2 bg-white text-primary-600 rounded-xl text-sm font-bold hover:bg-primary-50 transition-colors">
              Open Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
