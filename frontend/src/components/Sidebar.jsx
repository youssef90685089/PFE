import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, FileText, FolderKanban, GraduationCap,
  Brain, Bell, Settings, ClipboardCheck, UserCheck, LogOut, ChevronLeft, ChevronRight, Upload,
  CalendarDays, Briefcase, History
} from 'lucide-react';
import { useState } from 'react';

const NAV_ITEMS = {
  ADMIN: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { to: '/dashboard/users', icon: Users, label: 'Users' },
    { to: '/dashboard/supervisors', icon: UserCheck, label: 'Supervisors' },
    { to: '/dashboard/activity-log', icon: History, label: 'Activity Log' },
    { to: '/dashboard/notifications', icon: Bell, label: 'Notifications' },
    { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
  ],
  MANAGER: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { to: '/dashboard/candidates', icon: Users, label: 'Candidates' },
    { to: '/dashboard/quizzes', icon: ClipboardCheck, label: 'Quizzes' },
    { to: '/dashboard/interviews', icon: CalendarDays, label: 'Schedule Interview' },
    { to: '/dashboard/project-assignment', icon: Briefcase, label: 'Assign Project' },
    { to: '/dashboard/activity-log', icon: History, label: 'Activity Log' },
    { to: '/dashboard/notifications', icon: Bell, label: 'Notifications' },
    { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
  ],
  RECEPTIONIST: [
    { to: '/dashboard/reception-panel', icon: ClipboardCheck, label: 'Reception Panel' },
    { to: '/dashboard/notifications', icon: Bell, label: 'Notifications' },
    { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
  ],
  CANDIDATE: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { to: '/dashboard/cv-upload', icon: FileText, label: 'Submit CV' },
    { to: '/dashboard/my-applications', icon: FileText, label: 'My Applications' },
    { to: '/dashboard/my-projects', icon: FolderKanban, label: 'My Projects' },
    { to: '/dashboard/quiz-interface', icon: ClipboardCheck, label: 'Take Quiz' },
    { to: '/dashboard/notifications', icon: Bell, label: 'Notifications' },
    { to: '/dashboard/profile', icon: Settings, label: 'Profile' },
  ],
};

function getRoleKey(user) {
  if (!user?.roles) return 'CANDIDATE';
  for (const r of ['ADMIN', 'MANAGER', 'RECEPTIONIST', 'CANDIDATE']) {
    if (user.roles.includes(r) || user.roles.includes(`ROLE_${r}`)) return r;
  }
  return 'CANDIDATE';
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const roleKey = getRoleKey(user);
  const items = NAV_ITEMS[roleKey] || NAV_ITEMS.CANDIDATE;

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside className={`${collapsed ? 'w-[72px]' : 'w-64'} flex flex-col border-r border-surface-200 bg-white transition-all duration-300 ease-in-out h-screen sticky top-0`}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-surface-100">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-500 text-white font-bold text-sm shadow-lg shadow-primary-500/25">
          C
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <h1 className="font-bold text-lg text-surface-900 tracking-tighter">CLINISYS</h1>
            <p className="text-[10px] text-surface-400 -mt-0.5 uppercase tracking-wider">Management Portal</p>
          </div>
        )}
      </div>

      {/* Role Badge */}
      {!collapsed && (
        <div className="px-4 py-3">
          <span className="inline-flex items-center rounded-lg bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700 ring-1 ring-primary-200/60">
            {roleKey}
          </span>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/dashboard'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 group
              ${isActive
                ? 'bg-primary-50 text-primary-700 shadow-sm shadow-primary-100'
                : 'text-surface-500 hover:bg-surface-50 hover:text-surface-800'
              }`
            }
          >
            <item.icon className={`h-[18px] w-[18px] shrink-0 transition-transform duration-200 group-hover:scale-110`} />
            {!collapsed && <span className="animate-fade-in">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Collapse + Logout */}
      <div className="border-t border-surface-100 p-3 space-y-1">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-surface-400 hover:bg-surface-50 hover:text-surface-700 transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4 shrink-0" /> : <ChevronLeft className="h-4 w-4 shrink-0" />}
          {!collapsed && <span>Collapse</span>}
        </button>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-error-500 hover:bg-red-50 transition-colors"
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
