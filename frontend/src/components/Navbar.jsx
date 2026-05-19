import { useAuth } from '../context/AuthContext';
import { Bell, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { notificationsApi } from '../api/axios';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    notificationsApi.getUnreadCount()
      .then(res => setUnreadCount(res.data?.data?.count || 0))
      .catch(() => {});
  }, []);

  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-surface-200 bg-white/80 backdrop-blur-lg px-6">
      {/* Search Bar */}
      <div className="relative max-w-md flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
        <input
          type="text"
          placeholder="Search anything..."
          className="w-full rounded-xl border border-surface-200 bg-surface-50 py-2 pl-10 pr-4 text-sm text-surface-700 placeholder:text-surface-400 focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all"
        />
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Notifications Bell */}
        <button
          onClick={() => navigate('/dashboard/notifications')}
          className="relative rounded-xl p-2 text-surface-500 hover:bg-surface-50 hover:text-surface-700 transition-colors"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-error-500 px-1 text-[10px] font-bold text-white animate-pulse-subtle">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* User Avatar */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 text-white text-sm font-bold shadow-md shadow-primary-500/20">
            {initials}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-surface-800">{user?.fullName}</p>
            <p className="text-xs text-surface-400">{user?.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
