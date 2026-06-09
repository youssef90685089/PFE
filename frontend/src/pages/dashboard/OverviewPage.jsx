import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dashboardApi, applicationsApi, usersApi, projectsApi } from '../../api/axios';
import StatCard from '../../components/ui/StatCard';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Users, FileText, FolderKanban, TrendingUp, Clock, CheckCircle2, XCircle, UserCheck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const PIE_COLORS = ['#f59e0b', '#3b82f6', '#8b5cf6', '#6366f1', '#06b6d4', '#f97316', '#22c55e', '#ef4444'];

export default function OverviewPage() {
  const { user, isCandidate, isAdmin, isManager } = useAuth();
  const [stats, setStats] = useState(null);
  const [myApps, setMyApps] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        if (isCandidate()) {
          const res = await applicationsApi.getMy();
          setMyApps(res.data?.data || []);
        } else if (isAdmin()) {
          const [statsRes, usersRes] = await Promise.all([
            dashboardApi.getManagerStats(),
            usersApi.getAll(),
          ]);
          setStats(statsRes.data?.data);
          setUsers(usersRes.data?.data || []);
        } else if (isManager()) {
          const [res, projectsRes] = await Promise.all([
            dashboardApi.getManagerStats(),
            projectsApi.getManaged(),
          ]);
          setStats(res.data?.data);
          setProjects(projectsRes.data?.data || []);
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

  // ── Admin View ────────────────────────────────────────────
  if (isAdmin()) {
    const activeUsers = users.filter(u => u.active).length;
    const inactiveUsers = users.filter(u => !u.active).length;
    const adminUsers = users.filter(u => u.roles?.some(r => r === 'ADMIN' || r === 'ROLE_ADMIN')).length;
    const managerUsers = users.filter(u => u.roles?.some(r => r === 'MANAGER' || r === 'ROLE_MANAGER')).length;
    const receptionUsers = users.filter(u => u.roles?.some(r => r === 'RECEPTIONIST' || r === 'ROLE_RECEPTIONIST')).length;
    const candidateUsers = users.filter(u => u.roles?.some(r => r === 'CANDIDATE' || r === 'ROLE_CANDIDATE')).length;

    const roleData = [
      { name: 'Admins', value: adminUsers },
      { name: 'Managers', value: managerUsers },
      { name: 'Receptionists', value: receptionUsers },
      { name: 'Candidates', value: candidateUsers },
    ].filter(r => r.value > 0);

    const recentUsers = [...users].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 5);

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Admin Dashboard</h1>
          <p className="text-surface-500 mt-1">System-wide user management overview</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard label="Total Users" value={users.length} icon={Users} color="primary" />
          <StatCard label="Admins" value={adminUsers} icon={UserCheck} color="info" />
          <StatCard label="Managers" value={managerUsers} icon={Users} color="warning" />
          <StatCard label="Receptionists" value={receptionUsers} icon={Users} color="neutral" />
          <StatCard label="Candidates" value={candidateUsers} icon={Users} color="success" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Role Distribution Pie Chart */}
          <div className="rounded-2xl border border-surface-200 bg-white p-6">
            <h3 className="text-lg font-bold text-surface-800 mb-4">Role Distribution</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={roleData} cx="50%" cy="50%" innerRadius={60} outerRadius={100}
                  paddingAngle={3} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                  {roleData.map((_, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Active vs Inactive */}
          <div className="rounded-2xl border border-surface-200 bg-white p-6">
            <h3 className="text-lg font-bold text-surface-800 mb-4">User Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-800">Active Users</span>
                </div>
                <span className="text-2xl font-bold text-emerald-600">{activeUsers}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-red-50 border border-red-100">
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  <span className="text-sm font-medium text-red-800">Inactive Users</span>
                </div>
                <span className="text-2xl font-bold text-red-500">{inactiveUsers}</span>
              </div>
              <div className="mt-4 h-3 w-full rounded-full bg-surface-200 overflow-hidden">
                <div className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${users.length > 0 ? (activeUsers / users.length) * 100 : 0}%` }} />
              </div>
              <p className="text-xs text-surface-400 text-center">
                {users.length > 0 ? `${((activeUsers / users.length) * 100).toFixed(1)}% of users are active` : 'No users'}
              </p>
            </div>
          </div>
        </div>

        {/* Recent Users */}
        <div className="rounded-2xl border border-surface-200 bg-white p-6">
          <h3 className="text-lg font-bold text-surface-800 mb-4">Recent Users</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-surface-400 border-b border-surface-100">
                  <th className="pb-3 font-semibold">Name</th>
                  <th className="pb-3 font-semibold">Email</th>
                  <th className="pb-3 font-semibold">Roles</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Created</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map(u => (
                  <tr key={u.id} className="border-b border-surface-50 hover:bg-surface-50/50 transition-colors">
                    <td className="py-3 text-surface-800 font-medium">{u.firstName} {u.lastName}</td>
                    <td className="py-3 text-surface-500">{u.email}</td>
                    <td className="py-3">
                      <div className="flex gap-1 flex-wrap">
                        {(u.roles || []).map(r => (
                          <Badge key={r} status="NEUTRAL" text={r.replace('ROLE_', '')} />
                        ))}
                      </div>
                    </td>
                    <td className="py-3"><Badge status={u.active ? 'ACCEPTED' : 'REJECTED'} text={u.active ? 'Active' : 'Inactive'} /></td>
                    <td className="py-3 text-surface-400">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}</td>
                  </tr>
                ))}
                {recentUsers.length === 0 && (
                  <tr><td colSpan={5} className="py-6 text-center text-surface-400">No users found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ── Manager View ────────────────────────────────────
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

      {/* My Projects Section */}
      {projects.length > 0 && (
        <div className="rounded-2xl border border-surface-200 bg-white p-6">
          <h3 className="text-lg font-bold text-surface-800 mb-4">My Projects</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(p => (
              <div key={p.id} className="rounded-xl border border-surface-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-surface-800 line-clamp-2">{p.title}</h4>
                  <Badge status={p.status} />
                </div>
                <p className="text-sm text-surface-600 line-clamp-2 mb-2">{p.description}</p>
                {p.technologyTags && (
                  <div className="flex flex-wrap gap-1">
                    {p.technologyTags.split(',').slice(0, 2).map(t => (
                      <span key={t} className="text-xs bg-surface-100 text-surface-600 px-2 py-1 rounded">{t.trim()}</span>
                    ))}
                  </div>
                )}
                {p.aiScore && <p className="text-xs text-surface-500 mt-2">AI Score: <span className="font-bold text-primary-600">{p.aiScore.toFixed(1)}</span></p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
