import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dashboardApi, applicationsApi, candidatesApi } from '../../api/axios';
import StatCard from '../../components/ui/StatCard';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Users, FileText, FolderKanban, UserCheck, TrendingUp, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const PIE_COLORS = ['#f59e0b', '#3b82f6', '#8b5cf6', '#6366f1', '#06b6d4', '#f97316', '#22c55e', '#ef4444'];

export default function OverviewPage() {
  const { user, isCandidate } = useAuth();
  const [stats, setStats] = useState(null);
  const [myApps, setMyApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        if (isCandidate()) {
          const res = await applicationsApi.getMy();
          setMyApps(res.data?.data || []);
        } else {
          const res = await dashboardApi.getManagerStats();
          setStats(res.data?.data);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <LoadingSpinner />;

  // ── Candidate View ────────────────────────────────────────
  if (isCandidate()) {
    const statusSteps = ['PENDING', 'UNDER_REVIEW', 'QUIZ_PENDING', 'QUIZ_COMPLETED', 'AI_EVALUATING', 'MANAGER_REVIEW', 'ACCEPTED'];
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Welcome, {user?.fullName?.split(' ')[0]}</h1>
          <p className="text-surface-500 mt-1">Track your internship application progress</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Total Applications" value={myApps.length} icon={FileText} color="primary" />
          <StatCard label="Accepted" value={myApps.filter(a => a.status === 'ACCEPTED').length} icon={CheckCircle2} color="success" />
          <StatCard label="Pending" value={myApps.filter(a => !['ACCEPTED', 'REJECTED'].includes(a.status)).length} icon={Clock} color="warning" />
        </div>

        {/* Application Progress Stepper */}
        {myApps.length > 0 && (
          <div className="rounded-2xl border border-surface-200 bg-white p-6">
            <h3 className="text-lg font-bold text-surface-800 mb-6">Application Progress</h3>
            {myApps.map(app => {
              const currentIdx = statusSteps.indexOf(app.status);
              const isRejected = app.status === 'REJECTED';
              return (
                <div key={app.id} className="mb-6 last:mb-0">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-surface-700">{app.projectTitle || `Application #${app.id}`}</span>
                    <Badge status={app.status} />
                  </div>
                  {!isRejected && (
                    <div className="flex items-center gap-1">
                      {statusSteps.map((step, i) => (
                        <div key={step} className="flex items-center flex-1">
                          <div className={`h-2 flex-1 rounded-full transition-colors ${i <= currentIdx ? 'bg-primary-500' : 'bg-surface-200'}`} />
                        </div>
                      ))}
                    </div>
                  )}
                  {isRejected && <div className="h-2 w-full rounded-full bg-error-500" />}
                  <div className="flex justify-between mt-1 text-[10px] text-surface-400">
                    <span>Pending</span><span>Review</span><span>Quiz</span><span>AI</span><span>Decision</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ── Manager/Admin View ────────────────────────────────────
  if (!stats) return <p className="text-surface-500">No data available</p>;

  const statusData = Object.entries(stats.applicationsByStatus || {}).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }));
  const monthData = Object.entries(stats.applicationsByMonth || {}).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Dashboard Overview</h1>
        <p className="text-surface-500 mt-1">System-wide internship metrics at a glance</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Candidates" value={stats.totalCandidates} icon={Users} color="primary" />
        <StatCard label="Applications" value={stats.totalApplications} icon={FileText} color="info" />
        <StatCard label="Projects" value={stats.totalProjects} icon={FolderKanban} color="warning" />
        <StatCard label="Acceptance Rate" value={`${stats.acceptanceRate}%`} icon={TrendingUp} color="success" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <div className="rounded-2xl border border-surface-200 bg-white p-6">
          <h3 className="text-lg font-bold text-surface-800 mb-4">Monthly Applications</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="value" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#818cf8" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status Breakdown */}
        <div className="rounded-2xl border border-surface-200 bg-white p-6">
          <h3 className="text-lg font-bold text-surface-800 mb-4">Applications by Status</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100}
                paddingAngle={3} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                {statusData.map((_, idx) => (
                  <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Pending Review" value={stats.pendingApplications} icon={Clock} color="warning" />
        <StatCard label="Accepted" value={stats.acceptedApplications} icon={CheckCircle2} color="success" />
        <StatCard label="Rejected" value={stats.rejectedApplications} icon={XCircle} color="error" />
      </div>
    </div>
  );
}
