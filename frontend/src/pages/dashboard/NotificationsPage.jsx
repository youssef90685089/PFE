import { useEffect, useState } from 'react';
import { notificationsApi } from '../../api/axios';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Bell, CheckCheck } from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);
  const load = () => notificationsApi.getAll().then(r => setNotifications(r.data?.data || [])).catch(console.error).finally(() => setLoading(false));

  const markAllRead = async () => {
    await notificationsApi.markAllAsRead();
    load();
  };

  const markRead = async (id) => {
    await notificationsApi.markAsRead(id);
    load();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Notifications</h1>
          <p className="text-surface-500 mt-1">{notifications.filter(n => !n.read).length} unread</p>
        </div>
        <button onClick={markAllRead} className="flex items-center gap-2 rounded-xl bg-surface-100 px-4 py-2 text-sm font-medium text-surface-600 hover:bg-surface-200 transition-colors">
          <CheckCheck className="h-4 w-4" /> Mark all read
        </button>
      </div>

      <div className="space-y-2">
        {notifications.length === 0 && (
          <div className="rounded-2xl border border-dashed border-surface-300 p-12 text-center text-surface-400">
            <Bell className="h-10 w-10 mx-auto mb-3 text-surface-300" />
            <p>No notifications yet</p>
          </div>
        )}
        {notifications.map(n => (
          <div key={n.id}
            onClick={() => !n.read && markRead(n.id)}
            className={`rounded-2xl border p-4 transition-all cursor-pointer ${
              n.read ? 'bg-white border-surface-100' : 'bg-primary-50/30 border-primary-100 shadow-sm'
            } hover:shadow-md`}>
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${n.read ? 'bg-surface-300' : 'bg-primary-500 animate-pulse-subtle'}`} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-surface-800 text-sm">{n.title}</p>
                  <Badge status={n.type} />
                </div>
                <p className="text-sm text-surface-500 mt-1">{n.message}</p>
                <p className="text-xs text-surface-400 mt-2">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
